import { useState, useEffect, useCallback } from 'react'
import BarChart from '../components/BarChart'
import CommentsModal from '../components/CommentsModal'
import GlassCard from '../components/GlassCard'
import { RefreshCw, MessageSquare, Filter, Clock, TrendingUp } from 'lucide-react'
import Button from '../components/Button'

// SubredditSelector Component
const SubredditSelector = ({ selectedSubreddit, onSubredditChange }) => {
  const subreddits = [
    { value: 'all', label: 'All', display: 'All Subreddits' },
    { value: 'wallstreetbets', label: 'WSB', display: 'r/wallstreetbets' },
    { value: 'stocks', label: 'Stocks', display: 'r/stocks' },
    { value: 'valueinvesting', label: 'Value', display: 'r/valueInvesting' }
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground block">Subreddit</label>
      <select
        value={selectedSubreddit}
        onChange={(e) => onSubredditChange(e.target.value)}
        className="w-full px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
      >
        {subreddits.map((subreddit) => (
          <option key={subreddit.value} value={subreddit.value} className="bg-[#1a1a1f]">
            {subreddit.display}
          </option>
        ))}
      </select>
    </div>
  )
}

// TimeSelector Component
const TimeSelector = ({ timeValue, timeUnit, onTimeValueChange, onTimeUnitChange }) => {
  const units = [
    { value: 'minutes', label: 'Minutes', max: 10080 },
    { value: 'hours', label: 'Hours', max: 168 },
    { value: 'days', label: 'Days', max: 7 }
  ]

  const currentUnit = units.find(unit => unit.value === timeUnit)
  const maxValue = currentUnit ? currentUnit.max : 7
  const numericTimeValue = parseInt(timeValue) || 0
  const isValidValue = numericTimeValue >= 1 && numericTimeValue <= maxValue && timeValue !== ''

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground block">Time Period</label>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          max={maxValue}
          value={timeValue}
          onChange={(e) => onTimeValueChange(e.target.value === '' ? '' : parseInt(e.target.value))}
          className={`w-20 px-4 py-2 text-sm rounded-xl bg-white/5 border text-foreground outline-none transition-all ${isValidValue ? 'border-white/10 focus:border-primary' : 'border-red-500/50 focus:border-red-500'
            }`}
        />
        <select
          value={timeUnit}
          onChange={(e) => onTimeUnitChange(e.target.value)}
          className="flex-1 px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-primary outline-none transition-all"
        >
          {units.map((unit) => (
            <option key={unit.value} value={unit.value} className="bg-[#1a1a1f]">
              {unit.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// FilterControls Container Component
const FilterControls = ({
  selectedSubreddit,
  onSubredditChange,
  timeValue,
  timeUnit,
  onTimeValueChange,
  onTimeUnitChange,
  onApplyFilters,
  loading
}) => {
  const numericTimeValue = parseInt(timeValue) || 0
  const units = { minutes: { max: 10080 }, hours: { max: 168 }, days: { max: 7 } }
  const maxValue = units[timeUnit]?.max || 7
  const isValidForApply = numericTimeValue >= 1 && numericTimeValue <= maxValue && timeValue !== ''

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubredditSelector
          selectedSubreddit={selectedSubreddit}
          onSubredditChange={onSubredditChange}
        />
        <TimeSelector
          timeValue={timeValue}
          timeUnit={timeUnit}
          onTimeValueChange={onTimeValueChange}
          onTimeUnitChange={onTimeUnitChange}
        />
      </div>

      <div className="pt-2">
        <Button
          onClick={onApplyFilters}
          disabled={!isValidForApply || loading}
          className="w-full md:w-auto bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        >
          Apply Filters
        </Button>
      </div>
    </GlassCard>
  )
}

const Current = () => {
  const [currentData, setCurrentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [totalMentions, setTotalMentions] = useState(0)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

  // Filter state
  const [selectedSubreddit, setSelectedSubreddit] = useState('all')
  const [timeValue, setTimeValue] = useState(3)
  const [timeUnit, setTimeUnit] = useState('days')
  const [filtersChanged, setFiltersChanged] = useState(false)

  // Applied filter state
  const [appliedSubreddit, setAppliedSubreddit] = useState('all')
  const [appliedTimeValue, setAppliedTimeValue] = useState(3)
  const [appliedTimeUnit, setAppliedTimeUnit] = useState('days')

  const fetchCurrentDataWithParams = async (subredditParam, timeValueParam, timeUnitParam) => {
    setLoading(true)
    try {
      let timeframe
      if (timeUnitParam === 'minutes') timeframe = `${timeValueParam}m`
      else if (timeUnitParam === 'hours') timeframe = `${timeValueParam}h`
      else if (timeUnitParam === 'days') timeframe = `${timeValueParam}d`

      const subredditMap = {
        'all': 'all',
        'wallstreetbets': 'wallstreetbets',
        'stocks': 'stocks',
        'valueinvesting': 'ValueInvesting'
      }

      const subreddit = subredditMap[subredditParam] || 'all'
      const response = await fetch(`/api/top-10-filtered?timeframe=${timeframe}&subreddit=${subreddit}`)

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json()

      if (result.status === 200 && result.data) {
        const transformedData = result.data.map(item => ({
          name: item.ticker,
          mentions: item.mentions
        }))

        setCurrentData(transformedData)
        setTotalMentions(result.total_mentions || 0)
        setLastUpdated(new Date())
      } else {
        setCurrentData([])
        setTotalMentions(0)
      }
    } catch (error) {
      console.error('Error fetching ticker data:', error)
      setCurrentData([])
      setTotalMentions(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentData = useCallback(async () => {
    await fetchCurrentDataWithParams(appliedSubreddit, appliedTimeValue, appliedTimeUnit)
  }, [appliedSubreddit, appliedTimeValue, appliedTimeUnit])

  const handleSubredditChange = (subreddit) => setSelectedSubreddit(subreddit)
  const handleTimeValueChange = (value) => setTimeValue(value)
  const handleTimeUnitChange = (unit) => {
    setTimeUnit(unit)
    const units = { minutes: { max: 10080 }, hours: { max: 168 }, days: { max: 7 } }
    const maxValue = units[unit]?.max || 7
    if (timeValue > maxValue) setTimeValue(maxValue)
  }

  const applyFilters = async () => {
    const units = { minutes: { max: 10080 }, hours: { max: 168 }, days: { max: 7 } }
    const maxValue = units[timeUnit]?.max || 7
    const validValue = Math.min(Math.max(1, parseInt(timeValue) || 1), maxValue)

    if (validValue !== timeValue) setTimeValue(validValue)

    setAppliedSubreddit(selectedSubreddit)
    setAppliedTimeValue(validValue)
    setAppliedTimeUnit(timeUnit)

    await fetchCurrentDataWithParams(selectedSubreddit, validValue, timeUnit)
  }

  const getSubredditDisplayName = () => {
    const names = {
      all: 'All Subreddits',
      wallstreetbets: 'r/wallstreetbets',
      stocks: 'r/stocks',
      valueinvesting: 'r/valueInvesting'
    }
    return names[appliedSubreddit] || 'All Subreddits'
  }

  const getTimeDisplayText = () => {
    const singular = appliedTimeValue === 1 ? appliedTimeUnit.slice(0, -1) : appliedTimeUnit
    return `${appliedTimeValue} ${singular}`
  }

  const getDynamicTitle = () => `Top 10 from ${getSubredditDisplayName()} - Last ${getTimeDisplayText()}`

  useEffect(() => {
    fetchCurrentData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => fetchCurrentData(), 60000)
    return () => clearInterval(interval)
  }, [fetchCurrentData])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Live Market Pulse</h1>
        <p className="text-xl text-muted-foreground">
          Real-time sentiment tracking from <span className="text-primary font-medium">{getSubredditDisplayName()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <FilterControls
            selectedSubreddit={selectedSubreddit}
            onSubredditChange={handleSubredditChange}
            timeValue={timeValue}
            timeUnit={timeUnit}
            onTimeValueChange={handleTimeValueChange}
            onTimeUnitChange={handleTimeUnitChange}
            onApplyFilters={applyFilters}
            loading={loading}
          />

          <GlassCard className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Stats Overview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-muted-foreground">Total Mentions</span>
                <span className="font-mono font-bold text-primary">{totalMentions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-muted-foreground">Time Range</span>
                <span className="text-right">Last {getTimeDisplayText()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-right text-xs text-muted-foreground">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
                </span>
              </div>
            </div>
          </GlassCard>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsCommentsModalOpen(true)}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </Button>
            <Button
              onClick={fetchCurrentData}
              disabled={loading}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="min-h-[500px] p-6">
            {loading && !currentData.length ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <BarChart
                data={currentData}
                title={getDynamicTitle()}
                enableClick={false}
                height={450}
                barColor="var(--chart-current)"
                hoverColor="var(--chart-current-hover)"
              />
            )}
          </GlassCard>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-sm text-primary/80">
          Live counting in progress. Charts update automatically every minute.
        </p>
      </div>

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
      />
    </div>
  )
}

export default Current
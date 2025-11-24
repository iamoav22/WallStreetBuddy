import { useState, useEffect, useRef } from 'react'
import BarChart from '../components/BarChart'
import GlassCard from '../components/GlassCard'
import { ArrowRight, Activity, TrendingUp, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  const [latestBatchData, setLatestBatchData] = useState([])
  const [totalMentions, setTotalMentions] = useState(0)
  const [batchInfo, setBatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch real data from API
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/home-data')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const apiResponse = await response.json()

        const transformedData = apiResponse.data.map(ticker => ({
          name: ticker.ticker,
          mentions: ticker.mentions
        }))

        setLatestBatchData(transformedData)
        setTotalMentions(apiResponse.total_mentions || 0)
        setBatchInfo(apiResponse.batch_info || null)
      } catch (error) {
        console.error('Failed to fetch home data:', error)
        setLatestBatchData([])
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden mb-20">
        <div
          ref={heroRef}
          className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none"
        >
          <div className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] absolute -top-20 -left-20 animate-pulse" />
          <div className="w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] absolute bottom-0 right-0 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-4">
          <div className="inline-block animate-float">
            <span className="px-4 py-2 rounded-full glass text-sm font-medium text-primary border border-primary/20">
              Next Gen Financial Analytics
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
            Market <span className="text-gradient">Intelligence</span>
            <br />
            Reimagined
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Advanced sentiment analysis powered by AI. Track the pulse of the market with real-time data visualization and deep insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/current">
              <button className="px-8 py-4 rounded-full bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                Launch Dashboard
              </button>
            </Link>
            <button className="px-8 py-4 rounded-full glass text-white font-medium text-lg hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-2">
              Learn More <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <GlassCard className="text-center space-y-2" hoverEffect>
          <Activity className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-bold">{totalMentions.toLocaleString()}</h3>
          <p className="text-muted-foreground">Total Mentions Analyzed</p>
        </GlassCard>
        <GlassCard className="text-center space-y-2" hoverEffect>
          <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-4" />
          <h3 className="text-3xl font-bold">98%</h3>
          <p className="text-muted-foreground">Accuracy Rate</p>
        </GlassCard>
        <GlassCard className="text-center space-y-2" hoverEffect>
          <BarChart2 className="w-8 h-8 text-accent mx-auto mb-4" />
          <h3 className="text-3xl font-bold">24/7</h3>
          <p className="text-muted-foreground">Real-time Monitoring</p>
        </GlassCard>
      </div>

      {/* Main Chart Section */}
      <div className="space-y-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Market Pulse</h2>
            <p className="text-muted-foreground">Top mentioned stocks in the last 72 hours</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-muted-foreground">
              {batchInfo ?
                `${new Date(batchInfo.batch_start).toLocaleDateString()} - ${new Date(batchInfo.batch_end).toLocaleDateString()}`
                : 'Live Data'}
            </p>
          </div>
        </div>

        <GlassCard className="p-8 min-h-[500px]">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : latestBatchData.length > 0 ? (
            <BarChart
              data={latestBatchData}
              title=""
              enableClick={true}
              height={450}
              barColor="var(--primary)"
              hoverColor="var(--secondary)"
            />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
              <p>No data available for the current period</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

export default Home
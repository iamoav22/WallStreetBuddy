import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Maximize2, X, TrendingUp, AlertCircle, Calendar, MessageCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import BarChart from '../components/BarChart'
import Button from '../components/Button'
import GlassCard from '../components/GlassCard'

const StockDetail = () => {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return

      try {
        setLoading(true)
        const response = await fetch(`/api/stock/${symbol}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.status === 200) {
          setStockData(result.data)
        } else {
          throw new Error(result.message || 'Failed to fetch stock data')
        }
      } catch (error) {
        console.error('Error fetching stock data:', error)
        setStockData({
          symbol: symbol?.toUpperCase(),
          total_mentions: 0,
          positive_mentions: null,
          negative_mentions: null,
          analysis_date: null,
          ai_analysis: 'Unable to load analysis. Please try again later.',
          historical_mentions: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [symbol])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showAnalysisModal) {
        setShowAnalysisModal(false)
      }
    }

    if (showAnalysisModal) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [showAnalysisModal])

  if (loading || !stockData) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-white/10 rounded-full"></div>
          <div>
            <div className="h-8 w-32 bg-white/10 rounded mb-2"></div>
            <div className="h-4 w-48 bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[300px] bg-white/5 rounded-2xl"></div>
          <div className="h-[300px] bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate(-1)}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              {stockData.symbol}
              <span className="text-sm font-normal px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Stock Analysis
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Analysis Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              AI Sentiment Analysis
            </h2>
            <Button
              onClick={() => setShowAnalysisModal(true)}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              size="sm"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Report
            </Button>
          </div>

          <div
            className="relative cursor-pointer"
            onClick={() => setShowAnalysisModal(true)}
          >
            <div className="prose prose-invert max-w-none line-clamp-[10] text-muted-foreground hover:text-foreground transition-colors">
              <ReactMarkdown>{stockData.ai_analysis || 'No analysis available'}</ReactMarkdown>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0c] to-transparent pointer-events-none" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4" />
            This is not financial advice. AI analysis based on social sentiment.
          </div>
        </GlassCard>

        {/* Stats Card */}
        <GlassCard className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-secondary" />
            Key Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Total Mentions</p>
              <p className="text-2xl font-bold text-primary">{stockData.total_mentions}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Analysis Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">
                  {stockData.analysis_date ? new Date(stockData.analysis_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Positive Sentiment</p>
              <p className="text-lg font-medium text-green-400">Coming Soon</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Negative Sentiment</p>
              <p className="text-lg font-medium text-red-400">Coming Soon</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Mention History Chart */}
      <GlassCard className="p-6">
        <BarChart
          data={stockData.historical_mentions}
          title={`${stockData.symbol} Mention History (Last 7 Days)`}
          enableClick={false}
          height={350}
          barColor="var(--chart-stock)"
          hoverColor="var(--chart-stock-hover)"
        />
      </GlassCard>

      {/* AI Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                AI Analysis - {stockData.symbol}
              </h2>
              <Button
                onClick={() => setShowAnalysisModal(false)}
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{stockData.ai_analysis || 'No analysis available'}</ReactMarkdown>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Analysis generated on {stockData.analysis_date ? new Date(stockData.analysis_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockDetail
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useRecommend } from '@/hooks/useRecommend'
import { useCompare } from '@/hooks/useCompare'
import { CarCard } from '@/components/results/CarCard'
import { CompareDrawer } from '@/components/results/CompareDrawer'
import { AgentTracePanel } from '@/components/results/AgentTracePanel'
import type { UserPreferences } from '@/types'

export function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const preferences = location.state?.preferences as UserPreferences | undefined

  const { run, trace, recommendations, status, error } = useRecommend()
  const { selected, toggle, isSelected, drawerOpen, openDrawer, closeDrawer, canAdd } = useCompare()
  const [tracePanelOpen, setTracePanelOpen] = useState(false)

  useEffect(() => {
    if (!preferences) {
      navigate('/')
      return
    }
    run(preferences)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = status === 'streaming' || status === 'idle'

  return (
    <div className={cn('min-h-screen bg-gray-50 transition-all duration-300', tracePanelOpen ? 'md:pr-72' : 'pr-0')}>
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/wizard')}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 text-sm"
            >
              ← Back
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🚗</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">CarMatch</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {selected.length > 0 && (
              <button
                onClick={openDrawer}
                className="bg-blue-600 text-white text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Compare {selected.length} ↑
              </button>
            )}
            <button
              onClick={() => setTracePanelOpen((v) => !v)}
              className="text-xs sm:text-sm text-gray-500 border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              🧠 <span className="hidden sm:inline">Agent </span>Trace
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status banner */}
        {isLoading && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="font-semibold text-blue-700 text-base sm:text-lg">AI is analyzing cars for you...</span>
            </div>
            <div className="space-y-1.5">
              {trace.map((t, i) => (
                <div key={i} className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-sm text-blue-600 px-2">
                  <span className="text-emerald-500 flex-shrink-0">✓</span>
                  <span className="font-medium">{t.node.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">— {t.detail}</span>
                </div>
              ))}
              {trace.length === 0 && (
                <p className="text-sm text-blue-400">Starting agent pipeline...</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {status === 'done' && recommendations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">😔</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No cars found</h2>
            <p className="text-gray-500 mb-6">Try widening your budget or changing your fuel preference.</p>
            <button
              onClick={() => navigate('/wizard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {recommendations.length > 0 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Top {recommendations.length} Picks</h1>
              <p className="text-gray-500 mt-1">
                Personalized by AI based on your preferences · Select up to 3 to compare
              </p>
            </div>

            <div className="space-y-4">
              {recommendations.map((car, i) => (
                <CarCard
                  key={car.car_id}
                  car={car}
                  rank={i + 1}
                  isSelected={isSelected(car.car_id)}
                  onToggleCompare={toggle}
                  canAdd={canAdd}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/wizard')}
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                ← Refine my search
              </button>
            </div>
          </>
        )}
      </main>

      {/* Agent Trace Panel */}
      <AgentTracePanel
        trace={trace}
        isOpen={tracePanelOpen}
        onToggle={() => setTracePanelOpen((v) => !v)}
        streamStatus={status}
      />

      {/* Compare Drawer */}
      {drawerOpen && (
        <CompareDrawer
          cars={selected}
          onClose={closeDrawer}
          onRemove={toggle}
        />
      )}
    </div>
  )
}

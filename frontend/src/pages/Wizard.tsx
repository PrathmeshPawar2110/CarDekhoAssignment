import { useNavigate } from 'react-router-dom'
import { useWizard } from '@/hooks/useWizard'
import { useRecommend } from '@/hooks/useRecommend'
import { CountryStep } from '@/components/wizard/CountryStep'
import { BudgetStep } from '@/components/wizard/BudgetStep'
import { UseCaseStep } from '@/components/wizard/UseCaseStep'
import { FuelStep } from '@/components/wizard/FuelStep'
import { PriorityStep } from '@/components/wizard/PriorityStep'
import { cn } from '@/lib/utils'
import { COUNTRY_BY_CODE } from '@/lib/countries'

const STEP_LABELS = ['Country', 'Budget', 'Use Case', 'Fuel', 'Priorities']

export function Wizard() {
  const navigate = useNavigate()
  const { currentStep, currentIndex, steps, preferences, updatePreferences, next, prev, isFirst, isLast } =
    useWizard()
  const { run } = useRecommend()

  const canProceed = () => {
    if (currentStep === 'use_case') return preferences.use_cases.length > 0
    return true
  }

  const handleNext = async () => {
    if (!isLast) {
      next()
      return
    }
    // Last step — run the agent
    run(preferences)
    navigate('/results', { state: { preferences } })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚗</span>
              <span className="font-bold text-gray-900">CarMatch</span>
            </div>
            <span className="text-sm text-gray-400">
              Step {currentIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  i <= currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'flex-1 text-xs text-center transition-colors',
                  i === currentIndex ? 'text-blue-600 font-semibold' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8">
          {currentStep === 'country' && (
            <CountryStep
              value={preferences.country}
              onChange={(country) => {
                const meta = COUNTRY_BY_CODE[country]
                updatePreferences({
                  country,
                  budget_min: meta?.defaultBudgetMin ?? 8,
                  budget_max: meta?.defaultBudgetMax ?? 20,
                })
              }}
            />
          )}
          {currentStep === 'budget' && (
            <BudgetStep
              min={preferences.budget_min}
              max={preferences.budget_max}
              countryCode={preferences.country}
              onChange={(min, max) => updatePreferences({ budget_min: min, budget_max: max })}
            />
          )}
          {currentStep === 'use_case' && (
            <UseCaseStep
              selected={preferences.use_cases}
              onChange={(use_cases) => updatePreferences({ use_cases })}
            />
          )}
          {currentStep === 'fuel' && (
            <FuelStep
              value={preferences.fuel_preference}
              onChange={(fuel_preference) => updatePreferences({ fuel_preference })}
            />
          )}
          {currentStep === 'priorities' && (
            <PriorityStep
              priorities={preferences.priorities}
              onChange={(priorities) => updatePreferences({ priorities })}
            />
          )}
        </div>
      </main>

      {/* Navigation */}
      <footer className="bg-white border-t px-6 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {!isFirst && (
            <button
              onClick={prev}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'flex-1 py-3 rounded-xl font-bold text-white transition-all',
              canProceed()
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isLast ? '🔍 Find My Car' : 'Next →'}
          </button>
        </div>
      </footer>
    </div>
  )
}

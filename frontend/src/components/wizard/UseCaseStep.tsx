import { cn } from '@/lib/utils'

const USE_CASES = [
  { id: 'daily_commute', label: 'Daily Commute', icon: '🏙️', desc: 'City driving, stop & go' },
  { id: 'family_trips', label: 'Family Trips', icon: '👨‍👩‍👧', desc: 'Weekend getaways, luggage' },
  { id: 'highway', label: 'Highway Cruising', icon: '🛣️', desc: 'Long distance, fast runs' },
  { id: 'offroad', label: 'Off-Road', icon: '⛰️', desc: 'Mountains, rough terrain' },
  { id: 'city_parking', label: 'City Parking', icon: '🅿️', desc: 'Tight spaces, compact' },
]

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function UseCaseStep({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">How will you use the car?</h2>
        <p className="mt-2 text-gray-500">Select all that apply</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {USE_CASES.map((uc) => {
          const active = selected.includes(uc.id)
          return (
            <button
              key={uc.id}
              onClick={() => toggle(uc.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
                active
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <span className="text-2xl">{uc.icon}</span>
              <div>
                <p className={cn('font-semibold', active ? 'text-blue-700' : 'text-gray-800')}>
                  {uc.label}
                </p>
                <p className="text-sm text-gray-500">{uc.desc}</p>
              </div>
              <div className="ml-auto">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    active ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  )}
                >
                  {active && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-center text-sm text-amber-600 bg-amber-50 rounded-xl py-2">
          Select at least one use case
        </p>
      )}
    </div>
  )
}

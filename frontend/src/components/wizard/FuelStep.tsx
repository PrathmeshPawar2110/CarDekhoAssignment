import { cn } from '@/lib/utils'

const FUEL_OPTIONS = [
  {
    id: 'petrol',
    label: 'Petrol',
    icon: '⛽',
    desc: 'Widely available, smooth performance',
  },
  {
    id: 'diesel',
    label: 'Diesel',
    icon: '🛢️',
    desc: 'Best mileage, ideal for long drives',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    icon: '🌿',
    desc: 'Best of both — great city + highway mileage',
  },
  {
    id: 'electric',
    label: 'Electric',
    icon: '⚡',
    desc: 'Zero emissions, lowest running cost',
  },
  {
    id: 'cng',
    label: 'CNG',
    icon: '💨',
    desc: 'Cheapest running cost in city',
  },
  {
    id: 'any',
    label: 'No Preference',
    icon: '🎯',
    desc: 'Show me the best, regardless of fuel',
  },
]

interface Props {
  value: string
  onChange: (fuel: string) => void
}

export function FuelStep({ value, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Fuel preference?</h2>
        <p className="mt-2 text-gray-500">This affects running costs and availability</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {FUEL_OPTIONS.map((opt) => {
          const active = value === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
                active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div className="flex-1">
                <p className={cn('font-semibold', active ? 'text-blue-700' : 'text-gray-800')}>
                  {opt.label}
                </p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2',
                  active ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

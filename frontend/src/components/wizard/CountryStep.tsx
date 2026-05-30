import { cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'

interface Props {
  value: string
  onChange: (countryCode: string) => void
}

export function CountryStep({ value, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Where are you buying?</h2>
        <p className="mt-2 text-gray-500">
          We'll search real-time listings in your market
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {COUNTRIES.map((country) => {
          const active = value === country.code
          return (
            <button
              key={country.code}
              onClick={() => onChange(country.code)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left',
                active
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50'
              )}
            >
              <span className="text-2xl leading-none">{country.flag}</span>
              <div className="min-w-0">
                <div
                  className={cn(
                    'font-semibold text-sm',
                    active ? 'text-blue-700' : 'text-gray-800'
                  )}
                >
                  {country.name}
                </div>
                <div className="text-xs text-gray-400">{country.currency.trim()}</div>
              </div>
              {active && (
                <span className="ml-auto text-blue-500 text-sm font-bold">✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

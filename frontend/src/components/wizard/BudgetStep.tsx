import * as Slider from '@radix-ui/react-slider'
import { COUNTRY_BY_CODE, formatBudgetValue } from '@/lib/countries'

interface Props {
  min: number
  max: number
  countryCode: string
  onChange: (min: number, max: number) => void
}

export function BudgetStep({ min, max, countryCode, onChange }: Props) {
  const country = COUNTRY_BY_CODE[countryCode] ?? COUNTRY_BY_CODE['IN']
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">What's your budget?</h2>
        <p className="mt-2 text-gray-500">Set your comfortable price range</p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Selected Range</p>
        <p className="text-3xl font-bold text-blue-600">
          {formatBudgetValue(min, country)} – {formatBudgetValue(max, country)}
        </p>
      </div>

      <div className="px-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          min={country.budgetMin}
          max={country.budgetMax}
          step={country.step}
          value={[min, max]}
          onValueChange={([newMin, newMax]) => onChange(newMin, newMax)}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-grab"
            aria-label="Minimum budget"
          />
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-grab"
            aria-label="Maximum budget"
          />
        </Slider.Root>

        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{formatBudgetValue(country.budgetMin, country)}</span>
          <span>{formatBudgetValue(country.budgetMax, country)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {country.budgetPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange(preset.min, preset.max)}
            className={`px-3 py-2 text-sm rounded-xl border transition-all ${
              min === preset.min && max === preset.max
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

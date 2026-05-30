import { cn, fuelLabel } from '@/lib/utils'
import type { CarRecommendation } from '@/types'

interface Props {
  car: CarRecommendation
  isSelected: boolean
  onToggleCompare: (car: CarRecommendation) => void
  canAdd: boolean
  rank: number
}

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
  return 'text-amber-600 bg-amber-50 border-amber-200'
}

const FUEL_ICONS: Record<string, string> = {
  petrol: '⛽',
  diesel: '🛢️',
  electric: '⚡',
  cng: '💨',
  hybrid: '🌿',
}

export function CarCard({ car, isSelected, onToggleCompare, canAdd, rank }: Props) {
  const specs = car.specs
  const canToggle = isSelected || canAdd

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-md',
        isSelected ? 'border-blue-400 shadow-blue-50 shadow-md' : 'border-gray-100'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            #{rank}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {specs.make} {specs.model}
            </h3>
            <p className="text-sm text-gray-500">{specs.variant} · {specs.year}</p>
          </div>
        </div>
        <div className={cn('px-3 py-1.5 rounded-xl border text-sm font-bold', SCORE_COLOR(car.match_score))}>
          {car.match_score}% match
        </div>
      </div>

      {/* Price + Fuel */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-2xl font-bold text-gray-900">{specs.price_display}</span>
        <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
          {FUEL_ICONS[specs.fuel_type] ?? '🚗'} {fuelLabel(specs.fuel_type)}
        </span>
        <span className="text-sm text-gray-500 capitalize">{specs.body_type}</span>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SpecPill
          label={specs.fuel_type === 'electric' ? 'Range' : 'Mileage'}
          value={
            specs.fuel_type === 'electric'
              ? `${specs.range_km ?? '—'} km`
              : `${specs.mileage_kmpl ?? '—'} kmpl`
          }
        />
        <SpecPill label="Power" value={specs.power_bhp != null ? `${specs.power_bhp} bhp` : '—'} />
        <SpecPill label="Safety" value={specs.safety_rating_stars != null ? `${specs.safety_rating_stars}★` : '—'} />
        <SpecPill label="Seats" value={specs.seating_capacity != null ? `${specs.seating_capacity}` : '—'} />
      </div>

      {/* Highlight */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">✨ Key Highlight</p>
        <p className="text-sm text-amber-900">{car.highlight}</p>
      </div>

      {/* Why it fits */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{car.why_this_fits}</p>

      {/* Key Feature */}
      {specs.key_feature && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {specs.key_feature}
          </span>
        </div>
      )}

      {/* Compare Button */}
      <button
        onClick={() => onToggleCompare(car)}
        disabled={!canToggle}
        className={cn(
          'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
          isSelected
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : canAdd
            ? 'border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
            : 'border-2 border-gray-100 text-gray-400 cursor-not-allowed'
        )}
      >
        {isSelected ? '✓ Added to Compare' : canAdd ? 'Add to Compare' : 'Compare Full (max 3)'}
      </button>
    </div>
  )
}

function SpecPill({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={cn('text-xs font-semibold text-gray-700', capitalize && 'capitalize')}>{value}</p>
    </div>
  )
}

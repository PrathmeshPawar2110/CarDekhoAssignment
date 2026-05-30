import { cn, fuelLabel } from '@/lib/utils'
import type { CarRecommendation } from '@/types'

interface Props {
  cars: CarRecommendation[]
  onClose: () => void
  onRemove: (car: CarRecommendation) => void
}

const SPEC_ROWS = [
  { key: 'price_display', label: 'Price', format: (v: unknown) => String(v ?? '—') },
  { key: 'fuel_type', label: 'Fuel', format: (v: unknown) => fuelLabel(v as string) },
  { key: 'body_type', label: 'Body Type', format: (v: unknown) => String(v ?? '—') },
  {
    key: 'mileage_kmpl',
    label: 'Mileage / Range',
    format: (v: unknown, specs: Record<string, unknown>) =>
      specs.fuel_type === 'electric'
        ? `${specs.range_km ?? '—'} km range`
        : `${v ?? '—'} kmpl`,
  },
  { key: 'power_bhp', label: 'Power', format: (v: unknown) => (v != null ? `${v} bhp` : '—') },
  { key: 'seating_capacity', label: 'Seating', format: (v: unknown) => (v != null ? `${v} seats` : '—') },
  { key: 'safety_rating_stars', label: 'Safety Rating', format: (v: unknown) => (v != null ? `${v} / 5 ★` : '—') },
  { key: 'key_feature', label: 'Key Feature', format: (v: unknown) => String(v ?? '—') },
  { key: 'year', label: 'Year', format: (v: unknown) => String(v ?? '—') },
]

export function CompareDrawer({ cars, onClose, onRemove }: Props) {
  if (cars.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Compare Cars ({cars.length}/3)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-32">Spec</th>
                {cars.map((car) => (
                  <th key={car.car_id} className="px-4 py-3 text-center min-w-[160px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                        {car.match_score}
                      </div>
                      <p className="font-bold text-gray-900 text-xs leading-tight">
                        {car.specs.make} {car.specs.model}
                      </p>
                      <p className="text-xs text-gray-400">{car.specs.variant}</p>
                      <button
                        onClick={() => onRemove(car)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={cn(i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
                >
                  <td className="px-4 py-2.5 text-gray-500 font-medium">{row.label}</td>
                  {cars.map((car) => {
                    const specs = car.specs as unknown as Record<string, unknown>
                    const value = row.format(specs[row.key], specs)
                    return (
                      <td key={car.car_id} className="px-4 py-2.5 text-center font-medium text-gray-800 capitalize">
                        {value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLakh(value: number): string {
  if (value >= 100) return `₹${(value / 100).toFixed(1)} Cr`
  return `₹${value.toFixed(1)}L`
}

export function fuelLabel(fuel: string): string {
  const map: Record<string, string> = {
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    cng: 'CNG',
    hybrid: 'Hybrid',
    any: 'Any',
  }
  return map[fuel] ?? fuel
}

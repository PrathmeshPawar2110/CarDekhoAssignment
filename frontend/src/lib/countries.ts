export interface CountryMeta {
  code: string
  name: string
  flag: string
  currency: string
  unit: string // "L" (lakh) or "K" (thousands)
  budgetMin: number
  budgetMax: number
  defaultBudgetMin: number
  defaultBudgetMax: number
  step: number
  budgetPresets: { label: string; min: number; max: number }[]
  serperGl: string
}

export const COUNTRIES: CountryMeta[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: '₹',
    unit: 'L',
    budgetMin: 3,
    budgetMax: 70,
    defaultBudgetMin: 8,
    defaultBudgetMax: 20,
    step: 0.5,
    budgetPresets: [
      { label: 'Under ₹5L', min: 3, max: 5 },
      { label: '₹5–10L', min: 5, max: 10 },
      { label: '₹10–15L', min: 10, max: 15 },
      { label: '₹15–25L', min: 15, max: 25 },
      { label: '₹25–40L', min: 25, max: 40 },
      { label: '₹40L+', min: 40, max: 70 },
    ],
    serperGl: 'in',
  },
  {
    code: 'US',
    name: 'USA',
    flag: '🇺🇸',
    currency: '$',
    unit: 'K',
    budgetMin: 10,
    budgetMax: 200,
    defaultBudgetMin: 25,
    defaultBudgetMax: 60,
    step: 5,
    budgetPresets: [
      { label: 'Under $20K', min: 10, max: 20 },
      { label: '$20–35K', min: 20, max: 35 },
      { label: '$35–55K', min: 35, max: 55 },
      { label: '$55–80K', min: 55, max: 80 },
      { label: '$80–120K', min: 80, max: 120 },
      { label: '$120K+', min: 120, max: 200 },
    ],
    serperGl: 'us',
  },
  {
    code: 'GB',
    name: 'UK',
    flag: '🇬🇧',
    currency: '£',
    unit: 'K',
    budgetMin: 8,
    budgetMax: 150,
    defaultBudgetMin: 20,
    defaultBudgetMax: 50,
    step: 2,
    budgetPresets: [
      { label: 'Under £15K', min: 8, max: 15 },
      { label: '£15–25K', min: 15, max: 25 },
      { label: '£25–40K', min: 25, max: 40 },
      { label: '£40–65K', min: 40, max: 65 },
      { label: '£65–100K', min: 65, max: 100 },
      { label: '£100K+', min: 100, max: 150 },
    ],
    serperGl: 'gb',
  },
  {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    currency: 'AED ',
    unit: 'K',
    budgetMin: 30,
    budgetMax: 800,
    defaultBudgetMin: 80,
    defaultBudgetMax: 200,
    step: 10,
    budgetPresets: [
      { label: 'Under AED 70K', min: 30, max: 70 },
      { label: 'AED 70–120K', min: 70, max: 120 },
      { label: 'AED 120–200K', min: 120, max: 200 },
      { label: 'AED 200–350K', min: 200, max: 350 },
      { label: 'AED 350–500K', min: 350, max: 500 },
      { label: 'AED 500K+', min: 500, max: 800 },
    ],
    serperGl: 'ae',
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: '€',
    unit: 'K',
    budgetMin: 8,
    budgetMax: 150,
    defaultBudgetMin: 20,
    defaultBudgetMax: 55,
    step: 2,
    budgetPresets: [
      { label: 'Under €15K', min: 8, max: 15 },
      { label: '€15–25K', min: 15, max: 25 },
      { label: '€25–40K', min: 25, max: 40 },
      { label: '€40–65K', min: 40, max: 65 },
      { label: '€65–100K', min: 65, max: 100 },
      { label: '€100K+', min: 100, max: 150 },
    ],
    serperGl: 'de',
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'A$',
    unit: 'K',
    budgetMin: 15,
    budgetMax: 250,
    defaultBudgetMin: 30,
    defaultBudgetMax: 70,
    step: 5,
    budgetPresets: [
      { label: 'Under A$30K', min: 15, max: 30 },
      { label: 'A$30–50K', min: 30, max: 50 },
      { label: 'A$50–75K', min: 50, max: 75 },
      { label: 'A$75–110K', min: 75, max: 110 },
      { label: 'A$110–160K', min: 110, max: 160 },
      { label: 'A$160K+', min: 160, max: 250 },
    ],
    serperGl: 'au',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'C$',
    unit: 'K',
    budgetMin: 15,
    budgetMax: 250,
    defaultBudgetMin: 30,
    defaultBudgetMax: 70,
    step: 5,
    budgetPresets: [
      { label: 'Under C$30K', min: 15, max: 30 },
      { label: 'C$30–45K', min: 30, max: 45 },
      { label: 'C$45–65K', min: 45, max: 65 },
      { label: 'C$65–100K', min: 65, max: 100 },
      { label: 'C$100–150K', min: 100, max: 150 },
      { label: 'C$150K+', min: 150, max: 250 },
    ],
    serperGl: 'ca',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'S$',
    unit: 'K',
    budgetMin: 60,
    budgetMax: 600,
    defaultBudgetMin: 100,
    defaultBudgetMax: 200,
    step: 10,
    budgetPresets: [
      { label: 'Under S$100K', min: 60, max: 100 },
      { label: 'S$100–150K', min: 100, max: 150 },
      { label: 'S$150–200K', min: 150, max: 200 },
      { label: 'S$200–300K', min: 200, max: 300 },
      { label: 'S$300–450K', min: 300, max: 450 },
      { label: 'S$450K+', min: 450, max: 600 },
    ],
    serperGl: 'sg',
  },
]

export const COUNTRY_BY_CODE: Record<string, CountryMeta> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
)

export function formatBudgetValue(value: number, country: CountryMeta): string {
  if (country.unit === 'L') {
    if (value >= 100) return `₹${(value / 100).toFixed(1)} Cr`
    return `${country.currency}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}L`
  }
  return `${country.currency}${value}K`
}

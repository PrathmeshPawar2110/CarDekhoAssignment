// Domain types shared across frontend

export interface UserPreferences {
  country: string
  budget_min: number
  budget_max: number
  use_cases: string[]
  fuel_preference: string
  priorities: string[]
}

export interface CarSpecs {
  car_id: string
  make: string
  model: string
  variant: string
  year: number
  price: number
  price_display: string
  fuel_type: string
  body_type: string
  mileage_kmpl: number | null
  range_km: number | null
  power_bhp: number | null
  seating_capacity: number | null
  safety_rating_stars: number | null
  key_feature: string
  country: string
}

export interface CarRecommendation {
  car_id: string
  match_score: number
  why_this_fits: string
  highlight: string
  specs: CarSpecs
}

export interface TraceEvent {
  type: 'trace'
  node: string
  status: 'running' | 'done' | 'error'
  timestamp: string
  detail: string
}

export interface RecommendRequest {
  preferences: UserPreferences
}

export type WizardStep = 'country' | 'budget' | 'use_case' | 'fuel' | 'priorities'

export type RecommendStatus = 'idle' | 'streaming' | 'done' | 'error'

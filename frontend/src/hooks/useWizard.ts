import { useState, useCallback } from 'react'
import type { UserPreferences, WizardStep } from '@/types'

const STEPS: WizardStep[] = ['country', 'budget', 'use_case', 'fuel', 'priorities']

const DEFAULT_PREFS: UserPreferences = {
  country: 'IN',
  budget_min: 8,
  budget_max: 20,
  use_cases: [],
  fuel_preference: 'any',
  priorities: ['mileage', 'safety', 'boot_space', 'performance', 'low_maintenance', 'resale_value'],
}

export function useWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('country')
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS)

  const currentIndex = STEPS.indexOf(currentStep)

  const next = useCallback(() => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }, [currentIndex])

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    }
  }, [currentIndex])

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }))
  }, [])

  const isFirst = currentIndex === 0
  const isLast = currentIndex === STEPS.length - 1

  return {
    currentStep,
    currentIndex,
    steps: STEPS,
    preferences,
    updatePreferences,
    next,
    prev,
    isFirst,
    isLast,
  }
}

import { useState, useCallback } from 'react'
import type { CarRecommendation } from '@/types'

const MAX_COMPARE = 3

export function useCompare() {
  const [selected, setSelected] = useState<CarRecommendation[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggle = useCallback((car: CarRecommendation) => {
    setSelected((prev) => {
      const exists = prev.find((c) => c.car_id === car.car_id)
      if (exists) return prev.filter((c) => c.car_id !== car.car_id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, car]
    })
  }, [])

  const isSelected = useCallback(
    (car_id: string) => selected.some((c) => c.car_id === car_id),
    [selected]
  )

  const clear = useCallback(() => setSelected([]), [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return {
    selected,
    toggle,
    isSelected,
    clear,
    drawerOpen,
    openDrawer,
    closeDrawer,
    canAdd: selected.length < MAX_COMPARE,
  }
}

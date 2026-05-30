import { useState, useCallback, useRef } from 'react'
import type { CarRecommendation, TraceEvent, UserPreferences, RecommendStatus } from '@/types'
import { fetchRecommendations } from '@/lib/api'

export function useRecommend() {
  const [trace, setTrace] = useState<TraceEvent[]>([])
  const [recommendations, setRecommendations] = useState<CarRecommendation[]>([])
  const [status, setStatus] = useState<RecommendStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async (preferences: UserPreferences) => {
    // Abort any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('streaming')
    setTrace([])
    setRecommendations([])
    setError(null)

    try {
      await fetchRecommendations(
        { preferences },
        (raw) => {
          if (raw === '[DONE]') {
            setStatus('done')
            return
          }
          try {
            const event = JSON.parse(raw)
            if (event.type === 'trace') {
              setTrace((prev) => {
                // Replace or append
                const idx = prev.findIndex((t) => t.node === event.node)
                if (idx >= 0) {
                  const next = [...prev]
                  next[idx] = event
                  return next
                }
                return [...prev, event]
              })
            } else if (event.type === 'result') {
              setRecommendations(event.recommendations ?? [])
            } else if (event.type === 'error') {
              setError(event.message)
              setStatus('error')
            }
          } catch {
            // non-JSON line — ignore
          }
        },
        controller.signal
      )
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message)
        setStatus('error')
      }
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setTrace([])
    setRecommendations([])
    setError(null)
  }, [])

  return { run, trace, recommendations, status, error, reset }
}

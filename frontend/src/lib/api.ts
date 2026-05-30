import type { RecommendRequest } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export async function fetchRecommendations(
  request: RecommendRequest,
  onEvent: (raw: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error ${response.status}: ${text}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        onEvent(line.slice(6).trim())
      }
    }
  }
}

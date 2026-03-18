import { useEffect, useRef } from 'react'

export interface BudgetAlert {
  id: string
  categoryName: string
  usagePercent: number
  spent: number
  limit: number
  monthYear: string
  timestamp: Date
}

export function useNotifications(
  token: string | null,
  onAlert: (alert: BudgetAlert) => void
) {
  const onAlertRef = useRef(onAlert)
  onAlertRef.current = onAlert

  useEffect(() => {
    if (!token) return

    let ws: WebSocket | null = null
    let retryTimeout: ReturnType<typeof setTimeout>
    let active = true

    const connect = () => {
      if (!active) return

      // Determine WS URL — same host, swap http→ws protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      ws = new WebSocket(`${protocol}//${host}/ws/notifications?token=${token}`)

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'budget-alert') {
            onAlertRef.current({
              id: `${Date.now()}-${Math.random()}`,
              categoryName: payload.categoryName,
              usagePercent: payload.usagePercent,
              spent: payload.spent,
              limit: payload.limit,
              monthYear: payload.monthYear,
              timestamp: new Date(),
            })
          }
        } catch { /* ignore malformed messages */ }
      }

      ws.onclose = () => {
        if (active) retryTimeout = setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()

    return () => {
      active = false
      clearTimeout(retryTimeout)
      ws?.close()
    }
  }, [token])
}

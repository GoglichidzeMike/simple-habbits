import { useEffect, useState } from 'react'
import { todayDay } from './dates.ts'

export function useToday() {
  const [today, setToday] = useState(todayDay)

  useEffect(() => {
    const refresh = () => setToday(todayDay())
    const timer = setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return today
}

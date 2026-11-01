import { useEffect, useState } from 'react'

/** Re-renderiza periodicamente para manter os "há X min" atualizados. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useStored, KEYS } from './useStored'
import { useNow } from './useNow'
import { welcomeNotification } from '../lib/notifications'

// Avisos que chegam junto com a ação da pessoa (ela já viu a confirmação na tela)
const INSTANT = ['received', 'review', 'welcome']
const REPORT_KINDS = ['received', 'confirmed', 'blocked', 'removed', 'expired', 'review', 'review-done']

/** Central de avisos simulados. Usar uma vez só, no App. */
export function useNotifications({ onArrive } = {}) {
  const [items, setItems] = useStored(KEYS.notifications, null)
  const [prefs, setPrefs] = useStored(KEYS.notifyPrefs, { reports: true, list: true, push: false })
  const now = useNow(3000)

  // Primeira visita: aviso de boas-vindas
  useEffect(() => {
    if (items === null) setItems([welcomeNotification()])
  }, [items, setItems])

  const allowed = useCallback(
    (n) => (REPORT_KINDS.includes(n.kind) ? prefs.reports : n.kind === 'list' ? prefs.list : true),
    [prefs]
  )

  const visible = useMemo(
    () => (items ?? []).filter((n) => n.at <= now && allowed(n)).sort((a, b) => b.at - a.at),
    [items, now, allowed]
  )
  const unread = visible.filter((n) => !n.read).length

  // Avisa quando chega um aviso novo com o site aberto
  const seen = useRef(null)
  useEffect(() => {
    const ids = new Set(visible.map((n) => n.id))
    if (seen.current) {
      const fresh = visible.filter((n) => !seen.current.has(n.id) && !n.read && n.at > now - 10000 && !INSTANT.includes(n.kind))
      if (fresh.length) onArrive?.(fresh[0])
    }
    seen.current = ids
  }, [visible, now, onArrive])

  const schedule = useCallback((list) => setItems((prev) => [...(prev ?? []), ...list].slice(-100)), [setItems])
  const markAllRead = useCallback(() => setItems((prev) => (prev ?? []).map((n) => (n.at <= Date.now() ? { ...n, read: true } : n))), [setItems])
  const clear = useCallback(() => setItems((prev) => (prev ?? []).filter((n) => n.at > Date.now())), [setItems])

  return { visible, unread, prefs, setPrefs, schedule, markAllRead, clear }
}

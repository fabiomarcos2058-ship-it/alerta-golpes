import { useCallback, useEffect, useState } from 'react'

const EVENT = 'alerta-golpe:storage'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * Estado salvo no navegador e compartilhado entre componentes
 * (se uma tela muda a lista, as outras atualizam na hora).
 */
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))

  useEffect(() => {
    const sync = (e) => {
      if (!e.detail || e.detail === key) setValue(read(key, fallback))
    }
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
    // fallback é constante para cada chave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* navegação privada: fica só na memória */
        }
        queueMicrotask(() => window.dispatchEvent(new CustomEvent(EVENT, { detail: key })))
        return resolved
      })
    },
    [key]
  )

  return [value, update]
}

export const KEYS = {
  recent: 'alerta-golpe:pesquisas:v1',
  watchlist: 'alerta-golpe:minha-lista:v1',
  training: 'alerta-golpe:treino:v1',
  textSize: 'alerta-golpe:texto:v1',
  plan: 'alerta-golpe:plano-simulado:v1',
  trialUsed: 'alerta-golpe:teste-usado:v1',
  attempts: 'alerta-golpe:tentativas:v1',
  notifications: 'alerta-golpe:notificacoes:v1',
  notifyPrefs: 'alerta-golpe:avisos-config:v1',
  onboarded: 'alerta-golpe:tutorial-visto:v1',
  reviews: 'alerta-golpe:revisoes:v1',
}

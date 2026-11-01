import { useCallback, useEffect, useState } from 'react'
import { backend } from '../services/backend'
import { statusSublabel } from '../data/constants'
import { isDDDQuery, isTelemarketingPrefix, isValidPhone, normalizePhone } from '../utils/phone'

/** Ajustes comuns aos dois modos: aviso do prefixo 0303 e texto do selo. */
function decorate(result) {
  if (result.type === 'phone' && isTelemarketingPrefix(result.phone)) {
    result.telemarketingPrefix = true
    if (result.status === 'seguro') result.status = 'suspeito'
  }
  result.sublabel = result.type === 'phone' ? statusSublabel(result) : null
  return result
}

/**
 * Dados da aplicação. Fala com o Supabase quando configurado (src/config.js)
 * ou com a base fictícia do modo demonstração.
 */
export function useReports() {
  const [recent, setRecent] = useState(null) // null = carregando
  const [stats, setStats] = useState(null)
  const [feedError, setFeedError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const [rows, totals] = await Promise.all([backend.recentes(20), backend.estatisticas()])
      setRecent(rows)
      setStats(totals)
      setFeedError('')
    } catch (err) {
      setFeedError(err.message)
    }
  }, [])

  useEffect(() => {
    refresh()
    return backend.subscribe(refresh)
  }, [refresh])

  /** Consulta um número completo ou um DDD (2 dígitos). */
  const search = useCallback(async (query) => {
    const digits = normalizePhone(query)
    if (isDDDQuery(digits)) return decorate(await backend.panoramaDDD(digits))
    if (isValidPhone(digits)) return decorate(await backend.consultarNumero(digits))
    throw new Error('Digite um número com DDD, como (11) 98765-4321, ou apenas um DDD, como 11.')
  }, [])

  const addReport = useCallback(
    async (form) => {
      const saved = await backend.registrar({
        phone: normalizePhone(form.phone),
        category: form.category,
        severity: form.severity,
        description: form.description.trim(),
      })
      refresh()
      return saved
    },
    [refresh]
  )

  return { mode: backend.mode, recent, stats, feedError, search, addReport }
}

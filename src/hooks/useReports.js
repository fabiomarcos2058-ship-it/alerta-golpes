import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateSeed, makeReport, PROFILES, pick } from '../data/seed'
import { statsForDDD, statsForNumber } from '../services/stats'
import { isDDDQuery, isValidPhone, normalizePhone } from '../utils/phone'

const STORAGE_KEY = 'alerta-golpe:denuncias:v1'
const LATENCY_MS = 700 // simula a ida ao servidor

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStored(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {
    /* navegação privada ou armazenamento cheio: segue só em memória */
  }
}

/**
 * "Banco de dados" da aplicação.
 * - seed: base fictícia gerada ao abrir a página
 * - userReports: denúncias feitas por você (ficam salvas no navegador)
 * - liveReports: denúncias simuladas da comunidade chegando em tempo real
 *
 * Para usar um backend de verdade, troque o corpo de `search` e `addReport`
 * por chamadas fetch() e o intervalo "ao vivo" por WebSocket/SSE.
 */
export function useReports({ live = true } = {}) {
  const [seed] = useState(() => generateSeed(Date.now()))
  const [userReports, setUserReports] = useState(loadStored)
  const [liveReports, setLiveReports] = useState([])
  const liveCounter = useRef(0)

  const allReports = useMemo(
    () => [...userReports, ...liveReports, ...seed],
    [userReports, liveReports, seed]
  )

  // Simulação do feed em tempo real: uma nova denúncia a cada 8–18 s.
  useEffect(() => {
    if (!live) return undefined
    let timer
    const schedule = () => {
      timer = setTimeout(() => {
        const rand = Math.random
        const profile = pick(PROFILES, rand)
        const id = `live-${Date.now()}-${liveCounter.current++}`
        setLiveReports((prev) => [{ ...makeReport(profile, Date.now(), rand, id), live: true }, ...prev].slice(0, 50))
        schedule()
      }, 8000 + Math.random() * 10000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [live])

  const recent = useMemo(
    () => [...allReports].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20),
    [allReports]
  )

  /** Consulta um número completo ou um DDD (2 dígitos). */
  const search = useCallback(
    async (query) => {
      const digits = normalizePhone(query)
      await wait(LATENCY_MS)
      if (isDDDQuery(digits)) return statsForDDD(allReports, digits)
      if (isValidPhone(digits)) return statsForNumber(allReports, digits)
      throw new Error('Digite um número com DDD, como (11) 98765-4321, ou apenas um DDD, como 11.')
    },
    [allReports]
  )

  const addReport = useCallback(async ({ phone, category, severity, description }) => {
    await wait(LATENCY_MS)
    const report = {
      id: `user-${Date.now()}`,
      phone: normalizePhone(phone),
      category,
      severity,
      description: description.trim(),
      createdAt: Date.now(),
      mine: true,
    }
    setUserReports((prev) => {
      const next = [report, ...prev]
      saveStored(next)
      return next
    })
    return report
  }, [])

  return { allReports, recent, search, addReport }
}

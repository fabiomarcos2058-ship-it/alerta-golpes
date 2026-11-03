// MODO DEMONSTRAÇÃO: usado quando o Supabase não está configurado (src/config.js).
// Base fictícia em memória + denúncias do próprio usuário salvas no navegador
// + denúncias simuladas chegando a cada 8–18 s.
import { generateSeed, makeReport, PROFILES, pick } from '../data/seed'
import { globalStats, statsForDDD, statsForNumber } from './stats'
import { maskPhone } from '../utils/phone'

const STORAGE_KEY = 'alerta-golpe:denuncias:v1'
const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

let seed = null
let mine = loadStored()
let live = []
const listeners = new Set()
let timer = null

const all = () => {
  seed ??= generateSeed(Date.now())
  return [...mine, ...live, ...seed]
}
const notify = () => listeners.forEach((cb) => cb())

function scheduleLive() {
  timer = setTimeout(() => {
    const id = `live-${Date.now()}`
    live = [makeReport(pick(PROFILES, Math.random), Date.now(), Math.random, id), ...live].slice(0, 50)
    notify()
    scheduleLive()
  }, 8000 + Math.random() * 10000)
}

export const demoBackend = {
  mode: 'demo',

  async consultarNumero(phone) {
    await wait()
    return statsForNumber(all(), phone)
  },

  async panoramaDDD(ddd) {
    await wait()
    return statsForDDD(all(), ddd)
  },

  async recentes(limit = 20) {
    return all()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        masked: maskPhone(r.phone),
        category: r.category,
        severity: r.severity,
        createdAt: r.createdAt,
        mine: Boolean(r.mine),
      }))
  },

  async estatisticas() {
    return globalStats(all())
  },

  async registrar({ phone, category, severity, description }) {
    await wait()
    const report = { id: `user-${Date.now()}`, phone, category, severity, description, createdAt: Date.now(), mine: true }
    mine = [report, ...mine]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mine))
    } catch {
      /* navegação privada: segue só em memória */
    }
    notify()
    return { phone, createdAt: report.createdAt }
  },

  /** No modo demonstração o feedback fica só neste navegador. */
  async enviarFeedback(feedback) {
    await wait()
    try {
      const key = 'alerta-golpe:feedbacks:v1'
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      localStorage.setItem(key, JSON.stringify([{ ...feedback, createdAt: Date.now() }, ...list]))
    } catch {
      /* navegação privada: ignora */
    }
    return { id: `demo-${Date.now()}` }
  },

  /** Avisa quando chegam denúncias novas. Devolve a função de cancelar. */
  subscribe(callback) {
    listeners.add(callback)
    if (!timer) scheduleLive()
    return () => {
      listeners.delete(callback)
      if (!listeners.size) {
        clearTimeout(timer)
        timer = null
      }
    }
  },
}

// MODO DEMONSTRAÇÃO: usado quando o Supabase não está configurado (src/config.js).
// Base fictícia em memória + denúncias do próprio usuário salvas no navegador
// + denúncias simuladas chegando a cada 8–18 s.
import { generateSeed, makeReport, PROFILES, pick } from '../data/seed'
import { globalStats, statsForDDD, statsForNumber } from './stats'
import { maskPhone } from '../utils/phone'

const STORAGE_KEY = 'alerta-golpe:denuncias:v1'
const ACCOUNT_KEY = 'alerta-golpe:conta-demo:v1'
const DEMO_CODE = '123456'
const REVIEWS_KEY = 'alerta-golpe:revisoes:v1'
const MOD_KEY = 'alerta-golpe:moderacao:v1' // { cleared: { phone: data }, removed: [ids] }
const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* navegação privada */
  }
}

// Pedidos de exemplo para a tela de moderação não começar vazia (números fictícios da base)
const SAMPLE_REVIEWS = [
  { id: 'exemplo-1', phone: '11900014471', reason: 'clonado', createdAt: Date.now() - 5 * 3600e3, status: 'pendente', sample: true },
  { id: 'exemplo-2', phone: '41900052286', reason: 'novo', createdAt: Date.now() - 26 * 3600e3, status: 'pendente', sample: true },
]

let seed = null
let mine = loadStored()
let live = []
const listeners = new Set()
let timer = null

const visibleReport = (r, mod) => !mod.removed.includes(r.id) && !(mod.cleared[r.phone] && r.createdAt <= mod.cleared[r.phone])
const all = () => {
  seed ??= generateSeed(Date.now())
  const mod = loadJSON(MOD_KEY, { cleared: {}, removed: [] })
  return [...mine, ...live, ...seed].filter((r) => visibleReport(r, mod))
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
    const reviewedAt = loadJSON(MOD_KEY, { cleared: {} }).cleared[phone] ?? null
    return { ...statsForNumber(all(), phone), reviewedAt }
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

  /** Denúncias feitas neste navegador. */
  async minhasDenuncias() {
    return [...mine].sort((a, b) => b.createdAt - a.createdAt)
  },

  /**
   * Login de demonstração: nenhum SMS é enviado e o código é sempre 123456.
   * No modo online (Supabase) o código chega de verdade por SMS.
   */
  auth: {
    demoCode: DEMO_CODE,
    async current() {
      try {
        return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null')
      } catch {
        return null
      }
    },
    onChange() {
      return () => {}
    },
    async sendCode() {
      await wait(700)
      return { demo: true }
    },
    async verifyCode(phone, code) {
      await wait(700)
      if (code !== DEMO_CODE) throw new Error('Código incorreto. Confira os 6 números e tente de novo.')
      const user = { phone }
      try {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(user))
      } catch {
        /* navegação privada */
      }
      return user
    },
    async signOut() {
      try {
        localStorage.removeItem(ACCOUNT_KEY)
      } catch {
        /* navegação privada */
      }
    },
  },

  /** Pedido de revisão de quem diz ser dono do número (só o motivo, nenhum dado pessoal). */
  async pedirRevisao({ phone, reason }) {
    await wait(400)
    const list = loadJSON(REVIEWS_KEY, null) ?? SAMPLE_REVIEWS
    if (list.some((r) => r.phone === phone && r.status === 'pendente')) throw new Error('Já existe um pedido de revisão em análise para este número.')
    const req = { id: `rev-${Date.now()}`, phone, reason, createdAt: Date.now(), status: 'pendente' }
    saveJSON(REVIEWS_KEY, [req, ...list])
    return req
  },

  /**
   * Moderação. Na demonstração qualquer pessoa vê esta área e as decisões valem só neste navegador.
   * No Supabase, só quem está na tabela `moderadores` consegue usar.
   */
  moderacao: {
    async souModerador() {
      return true
    },
    async listar() {
      await wait(300)
      const reviews = (loadJSON(REVIEWS_KEY, null) ?? SAMPLE_REVIEWS).sort((a, b) => b.createdAt - a.createdAt)
      const withText = all()
        .filter((r) => r.description)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 12)
        .map((r) => ({ id: r.id, phone: r.phone, category: r.category, severity: r.severity, description: r.description, createdAt: r.createdAt, mine: Boolean(r.mine) }))
      return { revisoes: reviews, denuncias: withText }
    },
    async decidirRevisao(id, aprovar) {
      await wait(300)
      const list = loadJSON(REVIEWS_KEY, null) ?? SAMPLE_REVIEWS
      const req = list.find((r) => r.id === id)
      if (!req) throw new Error('Pedido não encontrado.')
      saveJSON(REVIEWS_KEY, list.map((r) => (r.id === id ? { ...r, status: aprovar ? 'aprovado' : 'recusado', decidedAt: Date.now() } : r)))
      if (aprovar) {
        const mod = loadJSON(MOD_KEY, { cleared: {}, removed: [] })
        mod.cleared[req.phone] = Date.now()
        saveJSON(MOD_KEY, mod)
        notify()
      }
      return req
    },
    async apagarDenuncia(id) {
      await wait(300)
      const mod = loadJSON(MOD_KEY, { cleared: {}, removed: [] })
      mod.removed = [...mod.removed, id]
      saveJSON(MOD_KEY, mod)
      notify()
    },
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

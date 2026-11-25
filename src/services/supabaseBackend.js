// MODO ONLINE: conversa com o Supabase pelas funções criadas em supabase/schema.sql.
import { supabase } from '../lib/supabase'
import { withPct } from './stats'
import { maskFromPrefix, ufFromDDD } from '../utils/phone'

const REFRESH_MS = 20000 // de quanto em quanto tempo o feed busca denúncias novas
const toTime = (iso) => (iso ? new Date(iso).getTime() : null)

function friendlyError(error) {
  if (error?.code === 'P0001') return error.message // mensagens escritas no próprio SQL
  if (error?.code === '23514') return 'Algum campo está inválido. Confira o número e o relato.'
  return 'Não foi possível falar com o servidor. Verifique sua internet e tente de novo.'
}

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw new Error(friendlyError(error))
  return data
}

/** Cada navegador ganha uma conta anônima: é o que permite contar "pessoas diferentes". */
async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return
  const { error } = await supabase.auth.signInAnonymously()
  if (error) {
    throw new Error('O envio ainda não está ativado. Ative o login anônimo no Supabase.')
  }
}

/** Usuário logado com número (contas anônimas não contam como login). */
function toUser(u) {
  if (!u || u.is_anonymous || !u.phone) return null
  const digits = String(u.phone).replace(/\D/g, '')
  return { phone: digits.startsWith('55') ? digits.slice(2) : digits }
}

export const supabaseBackend = {
  mode: 'online',

  async minhasDenuncias() {
    const rows = await rpc('minhas_denuncias')
    return rows.map((r) => ({ ...r, createdAt: toTime(r.created_at) }))
  },

  /** Login opcional por SMS (Supabase → Authentication → Phone). */
  auth: {
    demoCode: null,
    async current() {
      const { data } = await supabase.auth.getSession()
      return toUser(data.session?.user)
    },
    onChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(toUser(session?.user)))
      return () => data.subscription.unsubscribe()
    },
    async sendCode(phone) {
      const { error } = await supabase.auth.signInWithOtp({ phone: `+55${phone}` })
      if (error) {
        if (/provider|sms|phone/i.test(error.message)) throw new Error('O login por SMS ainda não foi ativado neste site.')
        throw new Error('Não foi possível enviar o código agora. Tente de novo em alguns minutos.')
      }
      return { demo: false }
    },
    async verifyCode(phone, code) {
      const { data, error } = await supabase.auth.verifyOtp({ phone: `+55${phone}`, token: code, type: 'sms' })
      if (error) throw new Error('Código incorreto ou vencido. Confira os números ou peça um novo código.')
      return toUser(data.user)
    },
    async signOut() {
      await supabase.auth.signOut()
    },
  },

  async consultarNumero(phone) {
    const d = await rpc('consultar_numero', { p_phone: phone })
    return {
      type: 'phone',
      phone,
      uf: ufFromDDD(phone.slice(0, 2)),
      status: d.status,
      total: d.total,
      reporters: d.reporters,
      reportersAlto: d.reporters_alto,
      severity: d.severity,
      lastAt: toTime(d.last_at),
      firstAt: toTime(d.first_at),
      categories: withPct(d.categories, d.total),
      recent: d.recent.map((r) => ({ ...r, createdAt: toTime(r.created_at) })),
      reviewedAt: d.reviewed_at ? toTime(d.reviewed_at) : null,
    }
  },

  async pedirRevisao({ phone, reason }) {
    await ensureSession()
    const id = await rpc('pedir_revisao', { p_phone: phone, p_reason: reason })
    return { id, phone, reason, createdAt: Date.now(), status: 'pendente' }
  },

  /** Só funciona para quem está na tabela `moderadores` (veja supabase/schema.sql). */
  moderacao: {
    async souModerador() {
      await ensureSession()
      return Boolean(await rpc('sou_moderador'))
    },
    async listar() {
      const d = await rpc('moderacao_listar')
      return {
        revisoes: d.revisoes.map((r) => ({ id: r.id, phone: r.phone, reason: r.reason, status: r.status, createdAt: toTime(r.created_at), decidedAt: r.decided_at ? toTime(r.decided_at) : null })),
        denuncias: d.denuncias.map((r) => ({ id: r.id, phone: r.phone, category: r.category, severity: r.severity, description: r.description, createdAt: toTime(r.created_at) })),
      }
    },
    async decidirRevisao(id, aprovar) {
      return rpc('decidir_revisao', { p_id: id, p_aprovar: aprovar })
    },
    async apagarDenuncia(id) {
      return rpc('apagar_denuncia', { p_id: id })
    },
  },

  async panoramaDDD(ddd) {
    const d = await rpc('panorama_ddd', { p_ddd: ddd })
    return {
      type: 'ddd',
      ddd,
      uf: ufFromDDD(ddd),
      total: d.total,
      numbersCount: d.numbers_count,
      dangerousCount: d.dangerous_count,
      lastAt: toTime(d.last_at),
      categories: withPct(d.categories, d.total),
      topNumbers: d.top_numbers.map((n) => ({ masked: maskFromPrefix(n.prefixo), total: n.total, status: n.status })),
    }
  },

  async recentes(limit = 20) {
    const rows = await rpc('denuncias_recentes', { p_limit: limit })
    return rows.map((r) => ({
      id: r.id,
      masked: maskFromPrefix(r.prefixo),
      category: r.category,
      severity: r.severity,
      createdAt: toTime(r.created_at),
      mine: r.minha,
    }))
  },

  async estatisticas() {
    return rpc('estatisticas_gerais')
  },

  async registrar({ phone, category, severity, description }) {
    await ensureSession()
    const d = await rpc('registrar_denuncia', {
      p_phone: phone,
      p_category: category,
      p_severity: severity,
      p_description: description,
    })
    return { phone: d.phone, createdAt: toTime(d.created_at) }
  },

  async enviarFeedback({ rating, kind, message, contact }) {
    await ensureSession()
    return rpc('enviar_feedback', {
      p_rating: rating,
      p_kind: kind,
      p_message: message,
      p_contact: contact || null,
      p_page: location.pathname + location.hash,
      p_user_agent: navigator.userAgent.slice(0, 300),
    })
  },

  /** Busca novidades periodicamente e quando a aba volta a ficar visível. */
  subscribe(callback) {
    const id = setInterval(() => document.visibilityState === 'visible' && callback(), REFRESH_MS)
    const onVisible = () => document.visibilityState === 'visible' && callback()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  },
}

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
    throw new Error('O envio de denúncias ainda não está ativado. Ative o login anônimo no Supabase.')
  }
}

export const supabaseBackend = {
  mode: 'online',

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
    }
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

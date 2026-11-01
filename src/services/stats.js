// Cálculos usados no MODO DEMONSTRAÇÃO (no modo online, o banco faz isso nas funções SQL).
// No demo, cada denúncia conta como uma pessoa diferente.
import { classifyCounts } from '../data/constants'
import { maskPhone, ufFromDDD } from '../utils/phone'

export function withPct(categories, total) {
  return categories.map((c) => ({ ...c, pct: total ? Math.round((c.count / total) * 100) : 0 }))
}

function categoryBreakdown(reports, limit = 4) {
  const counts = {}
  reports.forEach((r) => { counts[r.category] = (counts[r.category] ?? 0) + 1 })
  const list = Object.entries(counts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
  return withPct(list, reports.length)
}

function severityBreakdown(reports) {
  const out = { leve: 0, moderado: 0, alto: 0 }
  reports.forEach((r) => { out[r.severity] = (out[r.severity] ?? 0) + 1 })
  return out
}

const countsOf = (reports) => ({
  total: reports.length,
  reporters: reports.length,
  reportersAlto: reports.filter((r) => r.severity === 'alto').length,
})

export function statsForNumber(allReports, phone) {
  const reports = allReports
    .filter((r) => r.phone === phone)
    .sort((a, b) => b.createdAt - a.createdAt)
  const counts = countsOf(reports)

  return {
    type: 'phone',
    phone,
    uf: ufFromDDD(phone.slice(0, 2)),
    ...counts,
    status: classifyCounts(counts),
    categories: categoryBreakdown(reports),
    severity: severityBreakdown(reports),
    lastAt: reports[0]?.createdAt ?? null,
    firstAt: reports.at(-1)?.createdAt ?? null,
    recent: reports.slice(0, 3),
  }
}

export function statsForDDD(allReports, ddd) {
  const reports = allReports.filter((r) => r.phone.slice(0, 2) === ddd)
  const byPhone = {}
  reports.forEach((r) => { (byPhone[r.phone] ??= []).push(r) })

  const numbers = Object.entries(byPhone)
    .map(([phone, list]) => ({ masked: maskPhone(phone), total: list.length, status: classifyCounts(countsOf(list)) }))
    .sort((a, b) => b.total - a.total)

  return {
    type: 'ddd',
    ddd,
    uf: ufFromDDD(ddd),
    total: reports.length,
    numbersCount: numbers.length,
    dangerousCount: numbers.filter((n) => n.status === 'perigoso').length,
    categories: categoryBreakdown(reports),
    topNumbers: numbers.slice(0, 5),
    lastAt: reports.reduce((max, r) => Math.max(max, r.createdAt), 0) || null,
  }
}

export function globalStats(allReports, now = Date.now()) {
  const phones = new Set(allReports.map((r) => r.phone))
  const last24h = allReports.filter((r) => now - r.createdAt < 24 * 60 * 60 * 1000).length
  return { total: allReports.length, numbers: phones.size, last24h }
}

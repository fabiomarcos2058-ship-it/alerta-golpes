import { classify } from '../data/constants'
import { ufFromDDD } from '../utils/phone'

function categoryBreakdown(reports, limit = 4) {
  const counts = {}
  reports.forEach((r) => { counts[r.category] = (counts[r.category] ?? 0) + 1 })
  return Object.entries(counts)
    .map(([id, count]) => ({ id, count, pct: Math.round((count / reports.length) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function severityBreakdown(reports) {
  const out = { leve: 0, moderado: 0, alto: 0 }
  reports.forEach((r) => { out[r.severity] = (out[r.severity] ?? 0) + 1 })
  return out
}

/** Estatísticas de um número específico. */
export function statsForNumber(allReports, phone) {
  const reports = allReports
    .filter((r) => r.phone === phone)
    .sort((a, b) => b.createdAt - a.createdAt)

  return {
    type: 'phone',
    phone,
    uf: ufFromDDD(phone.slice(0, 2)),
    status: classify(reports),
    total: reports.length,
    categories: categoryBreakdown(reports),
    severity: severityBreakdown(reports),
    lastAt: reports[0]?.createdAt ?? null,
    firstAt: reports.at(-1)?.createdAt ?? null,
    recent: reports.slice(0, 3),
  }
}

/** Panorama de um DDD inteiro. */
export function statsForDDD(allReports, ddd) {
  const reports = allReports.filter((r) => r.phone.startsWith(ddd))
  const byPhone = {}
  reports.forEach((r) => { (byPhone[r.phone] ??= []).push(r) })

  const numbers = Object.entries(byPhone)
    .map(([phone, list]) => ({ phone, total: list.length, status: classify(list) }))
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

/** Números gerais da base para a faixa de estatísticas. */
export function globalStats(allReports, now = Date.now()) {
  const phones = new Set(allReports.map((r) => r.phone))
  const last24h = allReports.filter((r) => now - r.createdAt < 24 * 60 * 60 * 1000).length
  return { total: allReports.length, numbers: phones.size, last24h }
}

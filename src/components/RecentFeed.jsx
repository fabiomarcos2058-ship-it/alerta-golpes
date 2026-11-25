import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Flag, TriangleAlert } from 'lucide-react'
import { CATEGORY_BY_ID, SEVERITY_BY_ID } from '../data/constants'
import { timeAgo } from '../utils/phone'
import { useNow } from '../hooks/useNow'
import DemoNote from './DemoNote'

export default function RecentFeed({ reports, stats, error, onReport, isDemo }) {
  const now = useNow(15000)
  const [expanded, setExpanded] = useState(false)
  const visible = (reports ?? []).slice(0, expanded ? 20 : 6)

  // Destaca só o que chegou depois do primeiro carregamento.
  const seen = useRef(null)
  const fresh = useMemo(
    () => (seen.current ? new Set((reports ?? []).filter((r) => !seen.current.has(r.id)).map((r) => r.id)) : new Set()),
    [reports]
  )
  useEffect(() => {
    if (reports) seen.current = new Set(reports.map((r) => r.id))
  }, [reports])

  return (
    <section aria-labelledby="feed-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="feed-title" className="text-xl font-bold text-ink">Denunciados recentemente</h2>
        {stats && (
          <p className="text-sm text-ink-soft">
            {stats.total.toLocaleString('pt-BR')} denúncias na base, {stats.last24h} nas últimas 24 horas
          </p>
        )}
      </div>
      <p className="mt-1 text-[15px] text-ink-soft">Os dois últimos dígitos ficam escondidos para proteger as pessoas.</p>
      {isDemo && (
        <DemoNote className="mt-2">
          Demonstração: números e denúncias fictícios. A contagem muda sozinha porque o site simula denúncias novas chegando de tempos em tempos.
        </DemoNote>
      )}

      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
          <TriangleAlert className="size-4 shrink-0" /> {error}
        </p>
      )}

      {reports && reports.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="font-semibold text-ink">Nenhuma denúncia ainda</p>
          <p className="mt-1 text-ink-soft">Recebeu uma ligação suspeita? Seja a primeira pessoa a avisar.</p>
          <button type="button" onClick={() => onReport()} className="btn btn-primary mt-4">
            <Flag className="size-5" /> Denunciar número
          </button>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {!reports &&
            [0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-4">
                <span className="size-9 rounded-full bg-paper" />
                <span className="h-4 w-40 rounded bg-paper" />
              </li>
            ))}
          {visible.map((r) => {
            const cat = CATEGORY_BY_ID[r.category]
            const sev = SEVERITY_BY_ID[r.severity]
            const Icon = cat.icon
            return (
              <li key={r.id} className={`flex items-center gap-3 px-4 py-3.5 ${fresh.has(r.id) ? 'animate-feed-in' : ''}`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-ink-soft">
                  <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-mono text-ink">
                    {r.masked}
                    {r.mine && <span className="rounded bg-brand-tint px-1.5 font-sans text-xs font-semibold text-brand">você</span>}
                  </p>
                  <p className="truncate text-sm text-ink-soft">{cat.label}</p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="flex items-center justify-end gap-1.5 text-ink">
                    <span className={`size-2 rounded-full ${sev.dot}`} />
                    {sev.label}
                  </p>
                  <time className="text-ink-soft" dateTime={new Date(r.createdAt).toISOString()}>
                    {timeAgo(r.createdAt, now)}
                  </time>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {reports && reports.length > 6 && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="btn btn-ghost mt-2 px-3">
          {expanded ? 'Mostrar menos' : 'Ver mais denúncias'}
          <ChevronDown className={`size-4 transition ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </section>
  )
}

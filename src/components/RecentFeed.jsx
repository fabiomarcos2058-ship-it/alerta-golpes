import { useEffect, useMemo, useRef, useState } from 'react'
import { Radio, ChevronDown, Flag, TriangleAlert } from 'lucide-react'
import { CATEGORY_BY_ID, SEVERITY_BY_ID } from '../data/constants'
import { timeAgo } from '../utils/phone'
import { useNow } from '../hooks/useNow'

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, i) => (
    <li key={i} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
      <span className="size-10 rounded-xl bg-white/5" />
      <span className="flex-1 space-y-2">
        <span className="block h-3.5 w-36 rounded bg-white/5" />
        <span className="block h-3 w-24 rounded bg-white/5" />
      </span>
    </li>
  ))
}

export default function RecentFeed({ reports, error, onReport }) {
  const now = useNow(15000)
  const [expanded, setExpanded] = useState(false)
  const visible = (reports ?? []).slice(0, expanded ? 20 : 8)

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
    <section id="feed" className="scroll-mt-24 rounded-3xl border border-white/10 bg-ink-900/70">
      <header className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Denúncias recentes</h2>
          <p className="text-xs text-slate-500">Enviadas pela comunidade · finais ocultos por privacidade</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-300 ring-1 ring-red-500/30">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          Ao vivo
        </span>
      </header>

      {error && (
        <p className="flex items-center gap-2 border-b border-white/5 bg-red-500/5 px-5 py-2.5 text-xs text-red-200 sm:px-6">
          <TriangleAlert className="size-3.5 shrink-0" /> {error}
        </p>
      )}

      {reports && reports.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/5">
            <Flag className="size-5 text-slate-400" />
          </span>
          <p className="mt-4 font-medium text-slate-200">Nenhuma denúncia ainda</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">Recebeu uma ligação suspeita? Seja a primeira pessoa a avisar a comunidade.</p>
          <button
            type="button"
            onClick={() => onReport()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400"
          >
            <Flag className="size-4" /> Denunciar número
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {!reports && <SkeletonRows />}
          {visible.map((r) => {
            const cat = CATEGORY_BY_ID[r.category]
            const sev = SEVERITY_BY_ID[r.severity]
            const Icon = cat.icon
            return (
              <li key={r.id} className={`flex items-center gap-3 px-5 py-3.5 sm:px-6 ${fresh.has(r.id) ? 'animate-feed-in' : ''}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/5">
                  <Icon className="size-4.5 text-slate-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-mono text-sm text-white">
                    {r.masked}
                    {r.mine && <span className="rounded bg-cyan-400/15 px-1.5 py-px font-sans text-[10px] font-semibold text-cyan-300">VOCÊ</span>}
                  </p>
                  <p className="truncate text-xs text-slate-400">{cat.label}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className={`size-1.5 rounded-full ${sev.dot}`} />
                    {sev.label}
                  </span>
                  <time className="text-[11px] text-slate-500" dateTime={new Date(r.createdAt).toISOString()}>
                    {timeAgo(r.createdAt, now)}
                  </time>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {reports && reports.length > 8 && (
        <footer className="flex items-center justify-between border-t border-white/5 px-5 py-3 sm:px-6">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Radio className="size-3.5" /> Atualiza automaticamente
          </span>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            {expanded ? 'Mostrar menos' : 'Ver mais'}
            <ChevronDown className={`size-3.5 transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </footer>
      )}
    </section>
  )
}

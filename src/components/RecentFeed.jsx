import { useState } from 'react'
import { Radio, ChevronDown } from 'lucide-react'
import { CATEGORY_BY_ID, SEVERITY_BY_ID } from '../data/constants'
import { maskPhone, timeAgo } from '../utils/phone'
import { useNow } from '../hooks/useNow'

export default function RecentFeed({ reports }) {
  const now = useNow(15000)
  const [expanded, setExpanded] = useState(false)
  const visible = reports.slice(0, expanded ? 20 : 8)

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

      <ul className="divide-y divide-white/5">
        {visible.map((r) => {
          const cat = CATEGORY_BY_ID[r.category]
          const sev = SEVERITY_BY_ID[r.severity]
          const Icon = cat.icon
          return (
            <li key={r.id} className={`flex items-center gap-3 px-5 py-3.5 sm:px-6 ${r.live || r.mine ? 'animate-feed-in' : ''}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/5">
                <Icon className="size-4.5 text-slate-300" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-mono text-sm text-white">
                  {maskPhone(r.phone)}
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
    </section>
  )
}

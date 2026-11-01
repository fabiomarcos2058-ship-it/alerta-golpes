import { Flag, Clock, MapPin, MessageSquare, TriangleAlert, Info, Hash } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { CATEGORY_BY_ID, SEVERITY_BY_ID, STATUS } from '../data/constants'
import { formatDateTime, formatPhone, maskPhone, timeAgo } from '../utils/phone'

function Panel({ status, children }) {
  return (
    <section
      aria-live="polite"
      className="animate-rise relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/90 shadow-2xl shadow-black/40"
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${STATUS[status]?.glow ?? 'from-cyan-400/15'} to-transparent`} />
      <div className="relative p-5 sm:p-7">{children}</div>
    </section>
  )
}

function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

function CategoryBars({ categories, barClass }) {
  if (!categories.length) return null
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Golpes mais associados</h3>
      <ul className="space-y-3">
        {categories.map((c) => {
          const cat = CATEGORY_BY_ID[c.id]
          const Icon = cat.icon
          return (
            <li key={c.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-slate-200">
                  <Icon className="size-4 text-slate-400" />
                  {cat.label}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {c.count} · {c.pct}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(c.pct, 4)}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PhoneResult({ result, onReport }) {
  const meta = STATUS[result.status]
  const StatusIcon = meta.icon
  const { severity } = result

  return (
    <Panel status={result.status}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-ink-950/60 ring-1 ring-white/10 ${meta.text}`}>
            <StatusIcon className="size-7" />
          </div>
          <div>
            <StatusBadge status={result.status} size="lg" />
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {formatPhone(result.phone)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
              <MapPin className="size-3.5" />
              DDD {result.phone.slice(0, 2)}{result.uf ? ` · ${result.uf}` : ''} — {meta.sublabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onReport(result.phone)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
        >
          <Flag className="size-4" />
          Denunciar este número
        </button>
      </div>

      {result.total === 0 ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100/90">
          <Info className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          <p>
            Nenhuma denúncia para este número até agora. Isso não garante que ele seja confiável:
            golpistas trocam de número com frequência. Na dúvida, não passe dados nem códigos.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={Hash} label="Total de denúncias" value={result.total} />
            <Stat icon={Clock} label="Última denúncia" value={timeAgo(result.lastAt)} sub={formatDateTime(result.lastAt)} />
            <Stat
              icon={TriangleAlert}
              label="Gravidade alta"
              value={`${Math.round((severity.alto / result.total) * 100)}%`}
              sub={`${severity.alto} de ${result.total} relatos`}
            />
            <Stat icon={Clock} label="Primeiro registro" value={timeAgo(result.firstAt)} sub={formatDateTime(result.firstAt)} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CategoryBars categories={result.categories} barClass={meta.bar} />

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Relatos recentes</h3>
              <ul className="space-y-2.5">
                {result.recent.map((r) => (
                  <li key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <span className={`size-1.5 rounded-full ${SEVERITY_BY_ID[r.severity].dot}`} />
                        {CATEGORY_BY_ID[r.category].label}
                      </span>
                      <span className="text-slate-500">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="flex gap-2 text-sm leading-relaxed text-slate-400">
                      <MessageSquare className="mt-1 size-3.5 shrink-0 text-slate-600" />
                      {r.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </Panel>
  )
}

function DDDResult({ result }) {
  return (
    <Panel status={result.dangerousCount > 0 ? 'perigoso' : 'seguro'}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Panorama regional</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-white">
            DDD {result.ddd} <span className="text-slate-500">· {result.uf}</span>
          </h2>
        </div>
        {result.lastAt && <p className="text-sm text-slate-400">Última denúncia {timeAgo(result.lastAt)}</p>}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Denúncias" value={result.total} />
        <Stat label="Números" value={result.numbersCount} />
        <Stat label="Perigosos" value={result.dangerousCount} />
      </div>

      {result.total > 0 ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <CategoryBars categories={result.categories} barClass="bg-cyan-400" />
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mais denunciados</h3>
            <ul className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.02]">
              {result.topNumbers.map((n) => (
                <li key={n.phone} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-sm text-slate-200">{maskPhone(n.phone)}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500">{n.total}×</span>
                    <StatusBadge status={n.status} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">Digite o número completo para ver os detalhes.</p>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">Ainda não há denúncias registradas neste DDD.</p>
      )}
    </Panel>
  )
}

export function ResultSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/80 p-7" aria-busy="true">
      <div className="absolute inset-y-0 left-0 w-1/3 animate-scan bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-2xl bg-white/5" />
        <div className="space-y-2">
          <div className="h-5 w-28 rounded-full bg-white/5" />
          <div className="h-7 w-56 rounded-lg bg-white/5" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/5" />)}
      </div>
      <p className="mt-5 font-mono text-xs text-cyan-300/70">Consultando base de denúncias…</p>
    </div>
  )
}

export default function ResultCard({ result, onReport }) {
  if (!result) return null
  return result.type === 'ddd' ? <DDDResult result={result} /> : <PhoneResult result={result} onReport={onReport} />
}

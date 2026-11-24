import { Flag, MessageSquare, Bookmark, BookmarkCheck, Share2, MapPin, Megaphone } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { CATEGORY_BY_ID, SEVERITY_BY_ID, STATUS } from '../data/constants'
import { formatDateTime, formatPhone, timeAgo } from '../utils/phone'

function Fact({ label, value, sub }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right">
        <span className="font-semibold text-ink">{value}</span>
        {sub && <span className="block text-sm text-ink-soft">{sub}</span>}
      </dd>
    </div>
  )
}

function CategoryBars({ categories, barClass }) {
  if (!categories.length) return null
  return (
    <div>
      <h3 className="mb-3 font-semibold text-ink">Golpes mais ligados a este número</h3>
      <ul className="space-y-3">
        {categories.map((c) => {
          const cat = CATEGORY_BY_ID[c.id]
          const Icon = cat.icon
          return (
            <li key={c.id}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[15px]">
                <span className="flex items-center gap-2 text-ink">
                  <Icon className="size-4 text-ink-soft" />
                  {cat.label}
                </span>
                <span className="text-sm text-ink-soft tabular-nums">{c.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper ring-1 ring-line">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(c.pct, 4)}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PhoneResult({ result, onReport, saved, onToggleSave, onShare }) {
  const meta = STATUS[result.status]
  const Icon = meta.icon
  const { severity } = result

  return (
    <article className={`animate-rise overflow-hidden rounded-2xl border bg-white ${meta.border}`} aria-live="polite">
      {/* Faixa de status: a primeira coisa que a pessoa lê */}
      <div className={`${meta.tint} px-5 py-5 sm:px-6`}>
        <div className="flex items-start gap-4">
          <Icon className={`mt-1 size-10 shrink-0 ${meta.text}`} strokeWidth={2.2} />
          <div className="min-w-0">
            <p className={`text-[1.75rem] leading-tight font-extrabold ${meta.text}`}>{meta.label}</p>
            <p className="mt-0.5 font-mono text-xl text-ink">{formatPhone(result.phone)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[15px] text-ink-soft">
              <MapPin className="size-4 shrink-0" />
              {result.telemarketingPrefix
                ? 'Prefixo 0303, de telemarketing'
                : `DDD ${result.phone.slice(0, 2)}${result.uf ? `, ${result.uf}` : ''}`}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[17px] leading-relaxed text-ink">{meta.advice}</p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {result.telemarketingPrefix && (
          <p className="mb-5 flex gap-3 rounded-xl bg-warn-tint p-4 text-[15px] text-ink">
            <Megaphone className="mt-0.5 size-5 shrink-0 text-warn" />
            Números que começam com 0303 são reservados pela Anatel para telemarketing. Desde 2025 o uso não é obrigatório, então telemarketing também pode ligar de números comuns.
          </p>
        )}

        {result.total > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            <dl>
              <Fact label="Denúncias" value={result.total} sub={`de ${result.reporters} ${result.reporters === 1 ? 'pessoa' : 'pessoas diferentes'}`} />
              <Fact label="Última denúncia" value={timeAgo(result.lastAt)} sub={formatDateTime(result.lastAt)} />
              <Fact label="Marcadas como gravidade alta" value={`${Math.round((severity.alto / result.total) * 100)}%`} />
              <Fact label="Primeiro registro" value={timeAgo(result.firstAt)} />
            </dl>
            <CategoryBars categories={result.categories} barClass={meta.bar} />
          </div>
        )}

        {result.recent?.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-semibold text-ink">O que as pessoas contaram</h3>
            <ul className="divide-y divide-line">
              {result.recent.map((r) => (
                <li key={r.id} className="flex gap-3 py-3">
                  <MessageSquare className="mt-1 size-4 shrink-0 text-ink-soft" />
                  <div>
                    <p className="text-[15px] leading-relaxed text-ink">“{r.description}”</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {CATEGORY_BY_ID[r.category].label}, gravidade {SEVERITY_BY_ID[r.severity].label.toLowerCase()}, {timeAgo(r.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          <button type="button" onClick={onToggleSave} aria-pressed={saved} className={`btn ${saved ? 'btn-secondary text-brand' : 'btn-secondary'}`}>
            {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
            {saved ? 'Salvo na minha lista' : 'Salvar na minha lista'}
          </button>
          {result.total > 0 && (
            <button type="button" onClick={onShare} className="btn btn-secondary">
              <Share2 className="size-5" /> Avisar família e amigos
            </button>
          )}
          <button type="button" onClick={() => onReport(result.phone)} className="btn btn-secondary">
            <Flag className="size-5 text-danger" /> Denunciar este número
          </button>
        </div>
      </div>
    </article>
  )
}

function DDDResult({ result }) {
  return (
    <article className="animate-rise rounded-2xl border border-line bg-white p-5 sm:p-6" aria-live="polite">
      <p className="text-ink-soft">Panorama da região</p>
      <h2 className="mt-1 text-[1.75rem] leading-tight font-extrabold text-ink">
        DDD {result.ddd}, {result.uf}
      </h2>
      <p className="mt-2 text-[17px] text-ink">
        {result.total > 0
          ? `${result.total} denúncias de ${result.numbersCount} números. ${result.dangerousCount} ${result.dangerousCount === 1 ? 'está marcado' : 'estão marcados'} como perigoso.`
          : 'Ainda não há denúncias registradas neste DDD.'}
      </p>

      {result.total > 0 && (
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <CategoryBars categories={result.categories} barClass="bg-brand" />
          <div>
            <h3 className="mb-3 font-semibold text-ink">Números mais denunciados</h3>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {result.topNumbers.map((n) => (
                <li key={n.masked} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-ink">{n.masked}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm text-ink-soft tabular-nums">{n.total} denúncias</span>
                    <StatusBadge status={n.status} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-ink-soft">Digite o número completo para ver os detalhes.</p>
          </div>
        </div>
      )}
    </article>
  )
}

export function ResultSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-6" aria-busy="true">
      <div className="absolute inset-y-0 left-0 w-1/3 animate-scan bg-gradient-to-r from-transparent via-brand-tint to-transparent" />
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-paper" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-paper" />
          <div className="h-5 w-56 rounded bg-paper" />
        </div>
      </div>
      <p className="mt-5 text-ink-soft">Procurando denúncias deste número…</p>
    </div>
  )
}

export default function ResultCard({ result, ...props }) {
  if (!result) return null
  return result.type === 'ddd' ? <DDDResult result={result} /> : <PhoneResult result={result} {...props} />
}

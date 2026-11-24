import { TriangleAlert, BadgeCheck, LockKeyhole, UserRoundX, PhoneIncoming, Sparkles, Clock } from 'lucide-react'
import { TRIAL_DAYS } from '../data/plans'
import SearchPanel from '../components/SearchPanel'
import ResultCard, { ResultSkeleton } from '../components/ResultCard'
import RecentFeed from '../components/RecentFeed'

const TRUST = [
  { icon: BadgeCheck, text: 'Grátis e sem anúncios' },
  { icon: UserRoundX, text: 'Não precisa de cadastro' },
  { icon: LockKeyhole, text: 'Nunca pedimos senhas ou códigos' },
]

function PlanBanner({ planInfo, onTrial, go }) {
  const { isPremium, isTrial, planName, daysLeft, canTrial } = planInfo
  if (isPremium && !isTrial) return null
  const title = isTrial
    ? `Você está testando o plano ${planName}`
    : canTrial
      ? `Teste os recursos pagos de graça por ${TRIAL_DAYS} dias`
      : 'Planos para escolas e empresas'
  const text = isTrial
    ? `Faltam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}. Golpes extras no simulador, relatório do treino e lista sem limite estão liberados.`
    : canTrial
      ? 'Golpes extras no simulador, relatório do seu treino e lista sem limite. Sem pagar e sem cadastro.'
      : 'Treine uma turma ou uma equipe inteira, com painel e relatório.'
  return (
    <section className="flex flex-col gap-5 rounded-3xl border-2 border-brand/30 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-tint text-brand">
        {isTrial ? <Clock className="size-7" /> : <Sparkles className="size-7" />}
      </span>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-ink-soft">{text}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {canTrial && (
          <button type="button" onClick={onTrial} className="btn btn-primary">
            Começar teste grátis
          </button>
        )}
        {isTrial ? (
          <button type="button" onClick={() => go('simulador')} className="btn btn-primary">
            Ver golpes extras
          </button>
        ) : (
          <button type="button" onClick={() => go('planos')} className="btn btn-secondary">
            Ver planos
          </button>
        )}
      </div>
    </section>
  )
}

export default function HomeView({ search, result, feed, isDemo, onReport, go, planInfo, onTrial }) {
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Quem ligou pra você?</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">
          Digite o número e veja se outras pessoas já denunciaram. Dá para consultar só o DDD também.
        </p>

        <div className="mt-6">
          <SearchPanel
            value={search.query}
            onChange={search.setQuery}
            onSearch={search.run}
            loading={search.loading}
            recent={search.recent}
            onClearRecent={search.clearRecent}
            showExamples={isDemo}
          />
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {TRUST.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-[15px] text-ink-soft">
              <Icon className="size-5 text-safe" /> {text}
            </li>
          ))}
        </ul>

        <div ref={search.resultRef} className="mt-8 scroll-mt-28 empty:hidden">
          {search.loading && <ResultSkeleton />}
          {search.error && (
            <p className="animate-rise flex items-start gap-3 rounded-2xl border border-danger/25 bg-danger-tint p-4 text-danger">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />
              {search.error}
            </p>
          )}
          {!search.loading && <ResultCard {...result} onReport={onReport} />}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl bg-brand-tint p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-white">
          <PhoneIncoming className="size-7" />
        </span>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-ink">Você cairia numa ligação de golpe?</h2>
          <p className="mt-1 text-ink-soft">
            Atenda uma ligação de golpe de mentira, responda como faria de verdade e veja o resultado. Leva 2 minutos.
          </p>
        </div>
        <button type="button" onClick={() => go('simulador')} className="btn btn-primary shrink-0">
          Fazer o teste
        </button>
      </section>

      <PlanBanner planInfo={planInfo} onTrial={onTrial} go={go} />

      <RecentFeed reports={feed.recent} stats={feed.stats} error={feed.error} onReport={onReport} />
    </div>
  )
}

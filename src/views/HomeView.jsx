import { TriangleAlert, BadgeCheck, LockKeyhole, UserRoundX, PhoneIncoming } from 'lucide-react'
import SearchPanel from '../components/SearchPanel'
import ResultCard, { ResultSkeleton } from '../components/ResultCard'
import RecentFeed from '../components/RecentFeed'

const TRUST = [
  { icon: BadgeCheck, text: 'Grátis e sem anúncios' },
  { icon: UserRoundX, text: 'Não precisa de cadastro' },
  { icon: LockKeyhole, text: 'Nunca pedimos senhas ou códigos' },
]

export default function HomeView({ search, result, feed, isDemo, onReport, go }) {
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

      <RecentFeed reports={feed.recent} stats={feed.stats} error={feed.error} onReport={onReport} />
    </div>
  )
}

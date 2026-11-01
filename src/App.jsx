import { useCallback, useMemo, useRef, useState } from 'react'
import { TriangleAlert, ShieldCheck } from 'lucide-react'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import ResultCard, { ResultSkeleton } from './components/ResultCard'
import RecentFeed from './components/RecentFeed'
import SafetyTips from './components/SafetyTips'
import ReportModal from './components/ReportModal'
import StatsStrip from './components/StatsStrip'
import Toast from './components/Toast'
import { useReports } from './hooks/useReports'
import { globalStats } from './services/stats'
import { formatAsTyped, formatPhone } from './utils/phone'

export default function App() {
  const { allReports, recent, search, addReport } = useReports()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, phone: '' })
  const [toast, setToast] = useState('')
  const resultRef = useRef(null)

  const stats = useMemo(() => globalStats(allReports), [allReports])

  const runSearch = useCallback(
    async (term) => {
      setQuery(formatAsTyped(term))
      setLoading(true)
      setError('')
      setResult(null)
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
      try {
        setResult(await search(term))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [search]
  )

  const openReport = useCallback((phone = '') => setModal({ open: true, phone }), [])
  const closeReport = useCallback(() => setModal({ open: false, phone: '' }), [])
  const closeToast = useCallback(() => setToast(''), [])

  const submitReport = async (form) => {
    const report = await addReport(form)
    setToast(`Denúncia de ${formatPhone(report.phone)} enviada. Obrigado por proteger a comunidade!`)
    return report
  }

  return (
    <div className="min-h-dvh">
      <Header onReport={openReport} />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Hero + busca */}
        <section id="consulta" className="scroll-mt-24 pt-12 pb-8 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-medium text-cyan-200">
              <ShieldCheck className="size-3.5" />
              Proteção colaborativa contra golpes
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              Quem ligou pra você?
            </h1>
            <p className="mt-4 text-base text-pretty text-slate-400 sm:text-lg">
              Consulte qualquer número antes de atender ou retornar. Veja denúncias da comunidade e saiba se é golpe.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchPanel value={query} onChange={setQuery} onSearch={runSearch} loading={loading} />
          </div>

          <div ref={resultRef} className="mx-auto mt-8 max-w-4xl scroll-mt-24">
            {loading && <ResultSkeleton />}
            {error && (
              <div className="animate-rise flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}
            <ResultCard result={result} onReport={openReport} />
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            <StatsStrip stats={stats} />
          </div>
        </section>

        {/* Feed + dicas */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <RecentFeed reports={recent} />
          <SafetyTips />
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>AlertaGolpe · versão de demonstração com dados fictícios.</p>
        <p className="mt-1">As denúncias são relatos de usuários e não constituem acusação formal.</p>
      </footer>

      <ReportModal
        open={modal.open}
        initialPhone={modal.phone}
        onClose={closeReport}
        onSubmit={submitReport}
        onViewNumber={(phone) => {
          closeReport()
          runSearch(phone)
        }}
      />
      <Toast message={toast} onClose={closeToast} />
    </div>
  )
}

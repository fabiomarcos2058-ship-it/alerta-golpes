import { useCallback, useEffect, useRef, useState } from 'react'
import Header, { BottomNav } from './components/Header'
import ReportModal from './components/ReportModal'
import FeedbackModal from './components/FeedbackModal'
import LoginModal from './components/LoginModal'
import CallSimulator from './components/CallSimulator'
import Toast from './components/Toast'
import { LogoMark } from './components/Logo'
import HomeView from './views/HomeView'
import SimulatorView from './views/SimulatorView'
import MessageView from './views/MessageView'
import TipsView from './views/TipsView'
import AccountView from './views/AccountView'
import { useReports } from './hooks/useReports'
import { useStored, KEYS } from './hooks/useStored'
import { useView } from './hooks/useView'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { SCENARIOS } from './data/scamScenarios'
import { STATUS } from './data/constants'
import { formatAsTyped, formatPhone } from './utils/phone'

const RANK = { scammed: 1, partial: 2, safe: 3 }

function shareText(result) {
  const status = STATUS[result.status].label
  return `Alerta Golpe: o número ${formatPhone(result.phone)} tem ${result.total} ${result.total === 1 ? 'denúncia' : 'denúncias'} e está marcado como "${status}". Consulte antes de atender:`
}

function Site() {
  const { mode, demoCode, recent, stats, feedError, search, addReport, sendFeedback, loadMyReports } = useReports()
  const isDemo = mode === 'demo'
  const { user, signOut } = useAuth()
  const [view, go] = useView()

  // Consulta
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  // Dados salvos neste aparelho
  const [recentSearches, setRecentSearches] = useStored(KEYS.recent, [])
  const [watchlist, setWatchlist] = useStored(KEYS.watchlist, [])
  const [training, setTraining] = useStored(KEYS.training, {})
  const [textSize, setTextSize] = useStored(KEYS.textSize, 'normal')

  // Janelas
  const [reportModal, setReportModal] = useState({ open: false, phone: '' })
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [simScenario, setSimScenario] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.dataset.text = textSize
  }, [textSize])

  const runSearch = useCallback(
    async (term) => {
      go('consultar')
      setQuery(formatAsTyped(term))
      setLoading(true)
      setError('')
      setResult(null)
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      try {
        const res = await search(term)
        setResult(res)
        const key = res.type === 'ddd' ? res.ddd : res.phone
        setRecentSearches((prev) => [key, ...prev.filter((v) => v !== key)].slice(0, 6))
        if (res.type === 'phone') {
          // mantém o status da minha lista atualizado
          setWatchlist((prev) => prev.map((w) => (w.phone === res.phone ? { ...w, status: res.status } : w)))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [go, search, setRecentSearches, setWatchlist]
  )

  const saved = result?.type === 'phone' && watchlist.some((w) => w.phone === result.phone)
  const toggleSave = () => {
    if (!result) return
    if (saved) {
      setWatchlist((prev) => prev.filter((w) => w.phone !== result.phone))
      setToast('Número removido da sua lista.')
    } else {
      setWatchlist((prev) => [{ phone: result.phone, status: result.status, savedAt: Date.now() }, ...prev])
      setToast('Número salvo na sua lista. Veja em Minha área.')
    }
  }

  const share = async () => {
    const text = shareText(result)
    const url = window.location.href.split('#')[0]
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Alerta Golpe', text, url })
        return
      }
    } catch {
      return // a pessoa cancelou
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener')
  }

  const openReport = useCallback((phone = '') => setReportModal({ open: true, phone }), [])
  const closeReport = useCallback(() => setReportModal({ open: false, phone: '' }), [])
  const closeToast = useCallback(() => setToast(''), [])

  const submitReport = async (form) => {
    const report = await addReport(form)
    setToast(`Denúncia de ${formatPhone(report.phone)} enviada. Obrigado!`)
    return report
  }

  const finishTraining = useCallback(
    (id, outcome) => setTraining((prev) => (RANK[outcome] >= (RANK[prev[id]] ?? 0) ? { ...prev, [id]: outcome } : prev)),
    [setTraining]
  )

  const openScenario = (id) => setSimScenario(SCENARIOS.find((s) => s.id === id))

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        view={view}
        go={go}
        user={user}
        onReport={openReport}
        onLogin={() => setLoginOpen(true)}
        bigText={textSize === 'grande'}
        onToggleText={() => setTextSize((t) => (t === 'grande' ? 'normal' : 'grande'))}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-32 sm:pt-12 md:pb-20">
        {view === 'consultar' && (
          <HomeView
            isDemo={isDemo}
            go={go}
            onReport={openReport}
            search={{
              query,
              setQuery,
              run: runSearch,
              loading,
              error,
              resultRef,
              recent: recentSearches,
              clearRecent: () => setRecentSearches([]),
            }}
            result={{ result, saved, onToggleSave: toggleSave, onShare: share }}
            feed={{ recent, stats, error: feedError }}
          />
        )}
        {view === 'simulador' && <SimulatorView training={training} onStart={openScenario} />}
        {view === 'mensagem' && <MessageView />}
        {view === 'dicas' && <TipsView onReport={openReport} />}
        {view === 'minha-area' && (
          <AccountView
            user={user}
            isDemo={isDemo}
            onLogin={() => setLoginOpen(true)}
            onLogout={async () => {
              await signOut()
              setToast('Você saiu da sua conta.')
            }}
            watchlist={watchlist}
            onRemove={(phone) => setWatchlist((prev) => prev.filter((w) => w.phone !== phone))}
            onCheck={(phone) => runSearch(phone)}
            loadMyReports={loadMyReports}
            training={training}
            onReport={openReport}
            onFeedback={() => setFeedbackOpen(true)}
            go={go}
          />
        )}
      </main>

      <footer className="hidden border-t border-line bg-white md:block">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-6 px-4 py-8 text-[15px] text-ink-soft">
          <div className="flex max-w-md gap-3">
            <LogoMark className="size-8 shrink-0" />
            <p>
              O Alerta Golpe nunca liga para você e nunca pede senhas, códigos ou dados bancários. As denúncias são relatos de usuários e não são acusação formal.
              {isDemo && ' Versão de demonstração: os números da base são fictícios.'}
            </p>
          </div>
          <button type="button" onClick={() => setFeedbackOpen(true)} className="btn btn-secondary">Enviar feedback</button>
        </div>
      </footer>

      <BottomNav view={view} />

      <ReportModal
        open={reportModal.open}
        initialPhone={reportModal.phone}
        onClose={closeReport}
        onSubmit={submitReport}
        onViewNumber={(phone) => {
          closeReport()
          runSearch(phone)
        }}
      />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} isDemo={isDemo} onSubmit={sendFeedback} />
      <LoginModal
        open={loginOpen}
        demoCode={demoCode}
        onClose={(ok) => {
          setLoginOpen(false)
          if (ok) setToast('Pronto, você entrou com seu número.')
        }}
      />
      {simScenario && (
        <CallSimulator
          key={simScenario.id}
          scenario={simScenario}
          onClose={() => setSimScenario(null)}
          onPickAnother={() => {
            setSimScenario(null)
            go('simulador')
          }}
          onFinish={finishTraining}
        />
      )}
      <Toast message={toast} onClose={closeToast} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Site />
    </AuthProvider>
  )
}

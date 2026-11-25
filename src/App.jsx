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
import PlansView from './views/PlansView'
import ModerationView from './views/ModerationView'
import LegalView from './views/LegalView'
import SubscribeModal from './components/SubscribeModal'
import { UpgradeModal } from './components/UpgradePrompt'
import NotificationsModal from './components/NotificationsModal'
import OnboardingModal from './components/OnboardingModal'
import ReviewModal from './components/ReviewModal'
import { useNotifications } from './hooks/useNotifications'
import { useInstall, showSystemNotification } from './hooks/useInstall'
import { reportNotifications, watchNotifications, reviewNotifications, reviewDecisionNotification } from './lib/notifications'
import { backend } from './services/backend'
import { PLAN_BY_ID, LIST_LIMIT, TRIAL_DAYS, TRIAL_PLAN } from './data/plans'
import { usePlan } from './hooks/usePlan'
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
  const [attempts, setAttempts] = useStored(KEYS.attempts, [])
  const [subscribeId, setSubscribeId] = useState(null)

  // Janelas
  const [reportModal, setReportModal] = useState({ open: false, phone: '' })
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [simScenario, setSimScenario] = useState(null)
  const [toast, setToast] = useState('')
  const [upgrade, setUpgrade] = useState(null) // { title, text } quando bate num limite
  const [notifOpen, setNotifOpen] = useState(false)
  const [reviewPhone, setReviewPhone] = useState(null)
  const [onboarded, setOnboarded] = useStored(KEYS.onboarded, false)
  const [tutorialOpen, setTutorialOpen] = useState(!onboarded)

  const pushRef = useRef(false)
  const onArrive = useCallback((n) => {
    setToast({ text: n.title, bell: true, actionLabel: 'Ver notificação', onAction: () => setNotifOpen(true) })
    if (pushRef.current) showSystemNotification(n.title, n.text, n.id)
  }, [])
  const center = useNotifications({ onArrive })
  pushRef.current = center.prefs.push
  const installer = useInstall()

  const onTrialEnded = useCallback(() => setToast('Seu teste grátis terminou. Você voltou para o plano Gratuito.'), [])
  const planInfo = usePlan({ onTrialEnded })
  const { isPremium, startTrial, subscribe, cancel } = planInfo
  const beginTrial = useCallback(
    (planId = TRIAL_PLAN) => {
      startTrial(planId)
      setToast(`Teste grátis do plano ${PLAN_BY_ID[planId].name} ativado por ${TRIAL_DAYS} dias.`)
    },
    [startTrial]
  )

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
    } else if (!isPremium && watchlist.length >= LIST_LIMIT) {
      setUpgrade({
        title: `Sua lista já tem ${LIST_LIMIT} números`,
        text: `No plano Gratuito, a lista guarda até ${LIST_LIMIT} números. Remova um em Minha área ou libere a lista sem limite.`,
      })
    } else {
      setWatchlist((prev) => [{ phone: result.phone, status: result.status, savedAt: Date.now() }, ...prev])
      if (isPremium) center.schedule(watchNotifications(result.phone))
      setToast(isPremium ? 'Número salvo. Avisamos quando ele receber novas denúncias.' : 'Número salvo na sua lista. Veja em Minha área.')
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
    center.schedule(reportNotifications(report.phone))
    setToast(`Denúncia de ${formatPhone(report.phone)} enviada. Obrigado!`)
    return report
  }

  const finishTraining = useCallback(
    (id, outcome) => {
      setTraining((prev) => (RANK[outcome] >= (RANK[prev[id]] ?? 0) ? { ...prev, [id]: outcome } : prev))
      setAttempts((prev) => [...prev, { id, outcome, at: Date.now() }].slice(-200))
    },
    [setTraining, setAttempts]
  )

  const openScenario = (id) => {
    const sc = SCENARIOS.find((s) => s.id === id)
    if (sc.premium && !isPremium && attempts.some((a) => a.id === sc.id)) {
      setUpgrade({ title: 'Você já usou o treino grátis deste golpe', text: 'Para treinar os golpes extras quantas vezes quiser, use um plano pago, a partir do Plus.' })
      return
    }
    setSimScenario(sc)
  }
  const reviewDays = isPremium ? 2 : 7
  const submitReview = async (phone, reason) => {
    await backend.pedirRevisao({ phone, reason })
    center.schedule(reviewNotifications(phone, reviewDays))
  }

  const access = { isPremium, canTrial: planInfo.canTrial, onTrial: () => beginTrial(), onPlans: () => go('planos') }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        view={view}
        go={go}
        user={user}
        planInfo={planInfo}
        unread={center.unread}
        onBell={() => setNotifOpen(true)}
        onReport={openReport}
        onLogin={() => setLoginOpen(true)}
        bigText={textSize === 'grande'}
        onToggleText={() => setTextSize((t) => (t === 'grande' ? 'normal' : 'grande'))}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-12 sm:pt-12 md:pb-20">
        {view === 'consultar' && (
          <HomeView
            isDemo={isDemo}
            planInfo={planInfo}
            onTrial={() => beginTrial()}
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
            result={{ result, saved, onToggleSave: toggleSave, onShare: share, onReview: setReviewPhone }}
            feed={{ recent, stats, error: feedError }}
          />
        )}
        {view === 'simulador' && <SimulatorView training={training} attempts={attempts} onStart={openScenario} access={access} />}
        {view === 'mensagem' && <MessageView />}
        {view === 'moderacao' && (
          <ModerationView
            isDemo={isDemo}
            user={user}
            onLogin={() => setLoginOpen(true)}
            onCheck={(phone) => runSearch(phone)}
            onDecision={(req, approved) => {
              if (!req.sample) center.schedule([reviewDecisionNotification(req.phone, approved)])
              setToast(approved ? 'Revisão aceita: as denúncias do número foram apagadas.' : 'Revisão recusada: as denúncias foram mantidas.')
            }}
          />
        )}
        {(view === 'termos' || view === 'privacidade') && <LegalView doc={view} go={go} />}
        {view === 'planos' && (
          <PlansView
            planInfo={planInfo}
            onTrial={beginTrial}
            onChoose={(id) => {
              if (id === 'gratuito') {
                cancel()
                setToast('Você voltou para o plano Gratuito.')
              } else setSubscribeId(id)
            }}
          />
        )}
        {view === 'dicas' && <TipsView onReport={openReport} onTutorial={() => setTutorialOpen(true)} />}
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
            attempts={attempts}
            notifications={center.visible}
            onClearData={() => {
              Object.keys(localStorage)
                .filter((k) => k.startsWith('alerta-golpe:'))
                .forEach((k) => localStorage.removeItem(k))
              window.location.hash = 'consultar'
              window.location.reload()
            }}
            installer={installer}
            onTutorial={() => setTutorialOpen(true)}
            onReport={openReport}
            onFeedback={() => setFeedbackOpen(true)}
            planInfo={planInfo}
            onTrial={(id) => beginTrial(id)}
            onEndPlan={() => {
              cancel()
              setToast('Simulação encerrada. Você está no plano Gratuito.')
            }}
            go={go}
          />
        )}
      </main>

      <footer className="mb-[76px] border-t border-line bg-white md:mb-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 text-[15px] text-ink-soft">
          <div className="flex max-w-2xl gap-3">
            <LogoMark className="size-8 shrink-0" />
            <p>
              O Alerta Golpe nunca liga para você e nunca pede senhas, códigos ou dados bancários. As denúncias são relatos de usuários e não são acusação formal.
              {isDemo && ' Versão de demonstração: os números da base são fictícios.'}
            </p>
          </div>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5 gap-y-2 font-semibold text-ink">
            <button type="button" onClick={() => setTutorialOpen(true)} className="hover:text-brand">Como usar</button>
            <a href="#planos" className="hover:text-brand">Planos</a>
            <a href="#termos" className="hover:text-brand">Termos de uso</a>
            <a href="#privacidade" className="hover:text-brand">Privacidade</a>
            <a href="#moderacao" className="hover:text-brand">Moderação</a>
            {installer.canInstall && (
              <button type="button" onClick={installer.install} className="hover:text-brand">Instalar app</button>
            )}
            <button type="button" onClick={() => setFeedbackOpen(true)} className="hover:text-brand">Enviar feedback</button>
          </nav>
        </div>
      </footer>

      <BottomNav view={view} planInfo={planInfo} />

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
      {subscribeId && (
        <SubscribeModal
          key={subscribeId}
          planId={subscribeId}
          onClose={() => setSubscribeId(null)}
          onActivate={(sub) => {
            subscribe(sub)
            setToast(`Plano ${PLAN_BY_ID[sub.plan].name} ativado na simulação.`)
          }}
        />
      )}
      <UpgradeModal
        open={Boolean(upgrade)}
        onClose={() => setUpgrade(null)}
        title={upgrade?.title}
        text={planInfo.canTrial ? `${upgrade?.text ?? ''} Teste grátis por ${TRIAL_DAYS} dias, sem pagar.` : upgrade?.text}
        canTrial={planInfo.canTrial}
        onTrial={() => beginTrial()}
        onPlans={() => go('planos')}
      />
      <NotificationsModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        center={center}
        isPremium={isPremium}
        onCheck={(phone) => runSearch(phone)}
        onPlans={() => go('planos')}
      />
      <OnboardingModal
        open={tutorialOpen}
        onClose={() => {
          setTutorialOpen(false)
          setOnboarded(true)
        }}
        onStartSearch={() => {
          go('consultar')
          setTimeout(() => document.querySelector('main input')?.focus(), 80)
        }}
      />
      {reviewPhone && <ReviewModal phone={reviewPhone} days={reviewDays} onClose={() => setReviewPhone(null)} onSubmit={submitReview} />}
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

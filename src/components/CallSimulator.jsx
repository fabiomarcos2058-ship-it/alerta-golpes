import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Phone, PhoneOff, PhoneIncoming, X, Volume2, VolumeX, ShieldCheck, ShieldAlert, ShieldX,
  CircleCheck, TriangleAlert, Info, RotateCcw, LayoutGrid, Music, FastForward, Siren,
  ListChecks, Workflow, Lightbulb,
} from 'lucide-react'
import { COMMON_ENDINGS, HANGUP_WHY, TACTICS } from '../data/scamScenarios'
import { useSpeech } from '../hooks/useSpeech'
import {
  playHangupTone, playHoldMusic, setMuted, startLineNoise, startRingtone, stopAllSounds,
  stopLineNoise, stopRingtone, unlockAudio,
} from '../lib/callAudio'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const TEXT_CPS = 42 // velocidade do texto quando não há voz (caracteres por segundo)

const OUTCOME = {
  safe: { icon: ShieldCheck, text: 'text-emerald-400', ring: 'ring-emerald-500/30 bg-emerald-500/10' },
  partial: { icon: ShieldAlert, text: 'text-amber-300', ring: 'ring-amber-400/30 bg-amber-400/10' },
  scammed: { icon: ShieldX, text: 'text-red-400', ring: 'ring-red-500/30 bg-red-500/10' },
}

const VERDICT = {
  true: { icon: CircleCheck, label: 'Atitude segura', text: 'text-emerald-300', dot: 'bg-emerald-400', box: 'border-emerald-500/25 bg-emerald-500/[0.07]' },
  false: { icon: TriangleAlert, label: 'Atitude arriscada', text: 'text-red-300', dot: 'bg-red-400', box: 'border-red-500/25 bg-red-500/[0.07]' },
  null: { icon: Info, label: 'Fique atento', text: 'text-amber-200', dot: 'bg-amber-300', box: 'border-amber-400/25 bg-amber-400/[0.06]' },
}

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const lineText = (l) => (typeof l === 'string' ? l : l.text)
const lineSpeaker = (l) => (typeof l === 'string' ? 'a' : l.speaker ?? 'a')

function SimBadge() {
  return (
    <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 ring-1 ring-amber-400/30">
      Simulação
    </span>
  )
}

function Avatar({ scenario, size = 'lg', ringing = false }) {
  const Icon = scenario.icon
  const big = size === 'lg'
  return (
    <div className={`relative grid place-items-center ${big ? 'size-28' : 'size-10'}`}>
      {ringing && (
        <>
          <span className="absolute inset-0 rounded-full bg-emerald-400/20 motion-safe:animate-ping" />
          <span className="absolute -inset-3 rounded-full ring-1 ring-emerald-400/20 motion-safe:animate-pulse" />
        </>
      )}
      <span className="relative grid size-full place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-1 ring-white/10">
        <Icon className={big ? 'size-12 text-slate-200' : 'size-5 text-slate-200'} strokeWidth={1.5} />
      </span>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="size-4 text-cyan-300" /> {title}
      </h3>
      {children}
    </section>
  )
}

/** Análise final: o que aconteceu, por quê, e como se proteger. */
function Debrief({ scenario, ending, picks, tactics, seconds, onRetry, onReplay, onPickAnother }) {
  const outcome = OUTCOME[ending.outcome]
  const safeCount = picks.filter((p) => p.safe === true).length
  const mistakes = picks.filter((p) => p.safe === false).length
  const attention = picks.filter((p) => p.safe === null).length

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
      <p className="text-center text-xs text-slate-500">
        Chamada encerrada{seconds > 0 ? ` · ${formatTime(seconds)}` : ''}
      </p>

      <div className="animate-rise mt-5 flex flex-col items-center text-center">
        <span className={`grid size-16 place-items-center rounded-full ring-8 ${outcome.ring}`}>
          <outcome.icon className={`size-8 ${outcome.text}`} />
        </span>
        <h2 className={`mt-5 font-display text-2xl font-bold ${outcome.text}`}>{ending.title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">{ending.text}</p>

        {picks.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex gap-1.5" aria-hidden="true">
              {picks.map((p, i) => (
                <span key={i} className={`h-1.5 w-8 rounded-full ${VERDICT[String(p.safe)].dot}`} />
              ))}
            </div>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                {safeCount} {safeCount === 1 ? 'segura' : 'seguras'}
              </span>
              {attention > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-300" />
                  {attention} de atenção
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-400" />
                {mistakes} {mistakes === 1 ? 'erro' : 'erros'}
              </span>
            </p>
          </div>
        )}
      </div>

      {picks.length > 0 && (
        <Section icon={ListChecks} title="Suas respostas, uma por uma">
          <ol className="space-y-3">
            {picks.map((p, i) => {
              const v = VERDICT[String(p.safe)]
              return (
                <li key={i} className={`rounded-2xl border p-4 ${v.box}`}>
                  <p className="text-xs font-medium text-slate-400">{p.moment}</p>
                  <p className="mt-1 font-medium text-white">“{p.label}”</p>
                  <p className={`mt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${v.text}`}>
                    <v.icon className="size-3.5" /> {v.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{p.why}</p>
                </li>
              )
            })}
          </ol>
        </Section>
      )}

      {tactics.length > 0 && (
        <Section icon={Siren} title="Os truques que o golpista usou">
          <ul className="grid gap-2 sm:grid-cols-2">
            {tactics.map((id) => (
              <li key={id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <p className="text-sm font-semibold text-red-200">{TACTICS[id].title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{TACTICS[id].text}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section icon={Workflow} title="Como esse golpe funciona">
        <ol className="space-y-2.5">
          {scenario.howItWorks.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-300">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/[0.06] font-mono text-[11px] font-semibold text-slate-300 ring-1 ring-white/10">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={Lightbulb} title="Se acontecer com você de verdade">
        <ul className="space-y-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
          {scenario.realLife.map((tip) => (
            <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-slate-200">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-7 grid gap-2 sm:grid-cols-2">
        {ending.id === 'recusou' ? (
          <button
            type="button"
            onClick={onReplay}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
          >
            <Phone className="size-4" /> Ver como seria a ligação
          </button>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
          >
            <RotateCcw className="size-4" /> Tentar de novo
          </button>
        )}
        <button
          type="button"
          onClick={onPickAnother}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
        >
          <LayoutGrid className="size-4" /> Treinar outro golpe
        </button>
      </div>
    </div>
  )
}

export default function CallSimulator({ scenario, onClose, onPickAnother }) {
  const [phase, setPhase] = useState('ringing') // ringing | talking | ended
  const [transcript, setTranscript] = useState([])
  const [choices, setChoices] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [onHold, setOnHold] = useState(false)
  const [ending, setEnding] = useState(null)
  const [tactics, setTactics] = useState([])
  const [picks, setPicks] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [training, setTraining] = useState(false)
  const { speak, stop, unlock, supported } = useSpeech()

  const runId = useRef(0)
  const skipRef = useRef(false)
  const voiceOk = useRef(null) // null = ainda não sabemos se o aparelho tem voz
  const soundRef = useRef(soundOn)
  const nodeRef = useRef(null)
  const scrollRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  soundRef.current = soundOn

  const push = (item) => {
    const id = `${Date.now()}-${Math.random()}`
    setTranscript((t) => [...t, { id, ...item }])
    return id
  }
  const reveal = (id, shown) => setTranscript((t) => t.map((x) => (x.id === id && x.shown !== shown ? { ...x, shown } : x)))

  /** Mostra o texto palavra por palavra (quando não há voz). */
  const streamText = async (id, text, token) => {
    const words = text.split(' ')
    let shown = 0
    for (const w of words) {
      if (skipRef.current || token !== runId.current) break
      shown += w.length + 1
      reveal(id, Math.min(shown, text.length))
      await sleep(((w.length + 1) / TEXT_CPS) * 1000)
    }
    reveal(id, text.length)
  }

  const sayLine = async (line, token) => {
    if (line.hold) {
      if (skipRef.current) return
      setOnHold(true)
      push({ type: 'hold' })
      if (soundRef.current) playHoldMusic(line.hold)
      const until = Date.now() + line.hold
      while (Date.now() < until && !skipRef.current && token === runId.current) await sleep(100)
      setOnHold(false)
      return
    }
    const text = lineText(line)
    const speaker = lineSpeaker(line)
    const id = push({ type: 'them', speaker, text, shown: skipRef.current ? text.length : 0 })
    if (skipRef.current) return

    if (soundRef.current && supported && voiceOk.current !== false) {
      const ok = await speak(text, {
        speaker,
        pitch: scenario.voices?.[speaker]?.pitch ?? 1,
        onProgress: (n) => token === runId.current && reveal(id, n),
      })
      if (token !== runId.current) return
      if (ok) {
        voiceOk.current = true
      } else if (!skipRef.current) {
        voiceOk.current = false // aparelho sem voz: segue só com texto, sem esperar de novo
        await streamText(id, text, token)
      }
    } else {
      await streamText(id, text, token)
    }
    reveal(id, text.length)
  }

  const finish = useCallback(
    (endId) => {
      const wasTalking = runId.current
      runId.current += 1
      stop()
      stopAllSounds()
      if (wasTalking && soundRef.current) playHangupTone()
      setChoices(null)
      setSpeaking(false)
      setOnHold(false)
      setEnding({ id: endId, ...(scenario.endings[endId] ?? COMMON_ENDINGS[endId]) })
      setPhase('ended')
    },
    [scenario, stop]
  )

  const playNode = useCallback(
    async (id) => {
      const token = runId.current
      if (scenario.endings[id] || COMMON_ENDINGS[id]) {
        await sleep(450)
        if (token === runId.current) finish(id)
        return
      }
      const node = scenario.nodes[id]
      nodeRef.current = node
      setTactics((t) => [...t, ...(node.tactics ?? []).filter((x) => !t.includes(x))])
      skipRef.current = false
      setSpeaking(true)

      for (const line of node.lines) {
        await sayLine(line, token)
        if (token !== runId.current) return
        if (!skipRef.current) await sleep(140)
      }

      skipRef.current = false
      setSpeaking(false)
      if (node.choices) setChoices(node.choices)
      else playNode(node.next)
    },
    // sayLine depende só de refs e do cenário
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario, finish]
  )

  const reset = useCallback(() => {
    runId.current += 1
    stop()
    stopAllSounds()
    skipRef.current = false
    setTranscript([])
    setChoices(null)
    setSpeaking(false)
    setOnHold(false)
    setEnding(null)
    setTactics([])
    setPicks([])
    setSeconds(0)
  }, [stop])

  const answer = () => {
    unlockAudio()
    if (soundRef.current) unlock()
    reset()
    setPhase('talking')
    playNode(scenario.start)
  }

  const choose = async (choice) => {
    const token = runId.current
    const node = nodeRef.current
    setChoices(null)
    setPicks((p) => [...p, { moment: node.moment, label: choice.label, safe: choice.safe, why: choice.why }])
    push({ type: 'me', text: choice.label })
    if (training && choice.feedback) {
      await sleep(250)
      if (token !== runId.current) return
      push({ type: 'feedback', safe: choice.safe, text: choice.feedback })
      await sleep(1200)
    } else {
      await sleep(350)
    }
    if (token === runId.current) playNode(choice.next)
  }

  const hangUp = () => {
    if (phase === 'ringing') {
      stopRingtone()
      setPicks([{ moment: 'Quando o telefone tocou', label: 'Recusar a ligação', safe: true, why: 'Não atender números desconhecidos já evita muitos golpes. Se for importante, a pessoa ou a empresa vai encontrar outro jeito de falar com você.' }])
      setEnding({ id: 'recusou', ...COMMON_ENDINGS.recusou })
      setPhase('ended')
      return
    }
    setPicks((p) => [...p, { moment: nodeRef.current?.moment ?? 'Durante a ligação', label: 'Desligar a ligação', safe: true, why: HANGUP_WHY }])
    finish('desligou')
  }

  const skip = () => {
    skipRef.current = true
    stop()
  }

  const close = useCallback(() => {
    runId.current += 1
    stop()
    stopAllSounds()
    onCloseRef.current()
  }, [stop])

  // Som liga/desliga tudo (voz e efeitos)
  useEffect(() => {
    setMuted(!soundOn)
    if (!soundOn) stop()
  }, [soundOn, stop])

  // Toque enquanto chama · chiado de linha durante a ligação
  useEffect(() => {
    if (phase === 'ringing') startRingtone()
    if (phase === 'talking') startLineNoise()
    return () => {
      stopRingtone()
      stopLineNoise()
    }
  }, [phase])

  // Cronômetro da ligação
  useEffect(() => {
    if (phase !== 'talking') return undefined
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  // Rola a conversa até o fim
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript, choices])

  // Esc fecha
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  // Trava a rolagem do fundo; ao fechar, cancela conversa, voz e sons
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      runId.current += 1
      window.speechSynthesis?.cancel()
      stopAllSounds()
      setMuted(false)
      document.body.style.overflow = prev
    }
  }, [])

  const soundButton = (
    <button
      type="button"
      onClick={() => setSoundOn((v) => !v)}
      aria-label={soundOn ? 'Desligar o som' : 'Ligar o som'}
      aria-pressed={soundOn}
      className="rounded-xl p-2.5 text-slate-300 ring-1 ring-white/10 hover:bg-white/5"
    >
      {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Simulação: ${scenario.title}`}>
      <button type="button" aria-label="Fechar simulação" onClick={close} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className={`animate-rise relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-ink-850 to-ink-950 transition-[max-width] sm:h-[min(820px,94dvh)] sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-2xl ${
          phase === 'ended' ? 'sm:max-w-2xl' : 'sm:max-w-sm'
        }`}
      >
        {/* Barra superior */}
        <div className="flex items-center justify-between px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pb-2">
          <SimBadge />
          <button type="button" onClick={close} aria-label="Fechar simulação" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* ───────── Recebendo ligação ───────── */}
        {phase === 'ringing' && (
          <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
            <div className="mt-4 flex flex-col items-center">
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <PhoneIncoming className="size-4 motion-safe:animate-pulse" /> Chamada recebida
              </p>
              <div className="mt-8">
                <Avatar scenario={scenario} ringing />
              </div>
              <h2 className="mt-8 font-display text-2xl font-semibold text-white">{scenario.caller.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{scenario.caller.detail}</p>
              <p className="mt-1 font-mono text-sm text-slate-500">{scenario.caller.number}</p>
            </div>

            <div className="mt-8 w-full space-y-4">
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-500">
                Ligação de golpe de mentira, para treinar. Responda como você responderia de verdade: no final você vê o que deu certo e o que deu errado.
              </p>
              <div className="mx-auto flex w-fit flex-col items-start gap-2 text-sm text-slate-300">
                <label htmlFor="sim-sound" className="flex cursor-pointer items-center gap-2">
                  <input id="sim-sound" type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} className="size-4 accent-cyan-400" />
                  Som e voz do golpista
                </label>
                <label htmlFor="sim-training" className="flex cursor-pointer items-center gap-2">
                  <input id="sim-training" type="checkbox" checked={training} onChange={(e) => setTraining(e.target.checked)} className="size-4 accent-cyan-400" />
                  Modo treino: dicas durante a ligação
                </label>
              </div>
              <div className="flex items-start justify-center gap-16 pt-2">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={hangUp}
                    aria-label="Recusar"
                    className="grid size-16 place-items-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400"
                  >
                    <PhoneOff className="size-7" />
                  </button>
                  <span className="text-xs text-slate-400">Recusar</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={answer}
                    aria-label="Atender"
                    className="grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 motion-safe:animate-bounce"
                  >
                    <Phone className="size-7" />
                  </button>
                  <span className="text-xs text-slate-400">Atender</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────── Em ligação ───────── */}
        {phase === 'talking' && (
          <>
            <div className="flex items-center gap-3 border-b border-white/5 px-4 pb-3">
              <Avatar scenario={scenario} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{scenario.caller.name}</p>
                <p className={`flex items-center gap-1.5 font-mono text-xs tabular-nums ${onHold ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {onHold ? (
                    <>
                      <Music className="size-3" /> Em espera…
                    </>
                  ) : (
                    formatTime(seconds)
                  )}
                </p>
              </div>
              {soundButton}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4" aria-live="polite">
              {transcript.map((item) => {
                if (item.type === 'them') {
                  const isB = item.speaker === 'b'
                  return (
                    <div
                      key={item.id}
                      className={`max-w-[88%] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[15px] leading-relaxed text-slate-100 ${
                        isB ? 'bg-violet-400/[0.12] ring-1 ring-violet-400/20' : 'bg-white/[0.07]'
                      }`}
                    >
                      {item.text.slice(0, item.shown)}
                      {item.shown < item.text.length && (
                        <span className="text-slate-500/0" aria-hidden="true">
                          {item.text.slice(item.shown)}
                        </span>
                      )}
                    </div>
                  )
                }
                if (item.type === 'hold') {
                  return (
                    <p key={item.id} className="flex items-center justify-center gap-2 py-1 text-xs text-amber-200/80">
                      <Music className="size-3.5" /> Ligação em espera
                    </p>
                  )
                }
                if (item.type === 'me') {
                  return (
                    <div key={item.id} className="animate-rise ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-cyan-400 px-3.5 py-2.5 text-[15px] leading-relaxed font-medium text-ink-950">
                      {item.text}
                    </div>
                  )
                }
                const v = VERDICT[String(item.safe)]
                return (
                  <div key={item.id} className={`animate-rise rounded-2xl border px-3.5 py-2.5 ${v.box}`}>
                    <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${v.text}`}>
                      <v.icon className="size-3.5" /> {v.label}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-200">{item.text}</p>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-white/5 bg-ink-950/60 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {choices && (
                <div className="animate-rise mb-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">O que você responde?</p>
                  {choices.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => choose(c)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left text-sm leading-snug text-slate-100 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 focus-visible:outline-2 focus-visible:outline-cyan-400"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                {speaking && (
                  <button
                    type="button"
                    onClick={skip}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
                  >
                    <FastForward className="size-4" /> Pular
                  </button>
                )}
                <button
                  type="button"
                  onClick={hangUp}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-400"
                >
                  <PhoneOff className="size-4" /> Desligar
                </button>
              </div>
            </div>
          </>
        )}

        {/* ───────── Análise final ───────── */}
        {phase === 'ended' && ending && (
          <Debrief
            scenario={scenario}
            ending={ending}
            picks={picks}
            tactics={tactics}
            seconds={seconds}
            onRetry={() => {
              reset()
              setPhase('ringing')
            }}
            onReplay={answer}
            onPickAnother={onPickAnother}
          />
        )}
      </div>
    </div>
  )
}

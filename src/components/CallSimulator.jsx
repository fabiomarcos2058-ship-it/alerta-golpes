import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Phone, PhoneOff, PhoneIncoming, X, Volume2, VolumeX, ShieldCheck, ShieldAlert, ShieldX,
  CircleCheck, TriangleAlert, Info, RotateCcw, LayoutGrid, Flag,
} from 'lucide-react'
import { COMMON_ENDINGS } from '../data/scamScenarios'
import { useSpeech } from '../hooks/useSpeech'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const OUTCOME = {
  safe: { icon: ShieldCheck, text: 'text-emerald-400', ring: 'ring-emerald-500/30 bg-emerald-500/10' },
  partial: { icon: ShieldAlert, text: 'text-amber-300', ring: 'ring-amber-400/30 bg-amber-400/10' },
  scammed: { icon: ShieldX, text: 'text-red-400', ring: 'ring-red-500/30 bg-red-500/10' },
}

const FEEDBACK = {
  true: { icon: CircleCheck, label: 'Atitude segura', box: 'border-emerald-500/25 bg-emerald-500/[0.07]', text: 'text-emerald-300' },
  false: { icon: TriangleAlert, label: 'Cuidado', box: 'border-red-500/25 bg-red-500/[0.07]', text: 'text-red-300' },
  null: { icon: Info, label: 'Fique atento', box: 'border-amber-400/25 bg-amber-400/[0.06]', text: 'text-amber-200' },
}

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

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
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20 motion-reduce:hidden" />
          <span className="absolute -inset-3 animate-pulse rounded-full ring-1 ring-emerald-400/20 motion-reduce:hidden" />
        </>
      )}
      <span
        className={`relative grid size-full place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-1 ring-white/10`}
      >
        <Icon className={big ? 'size-12 text-slate-200' : 'size-5 text-slate-200'} strokeWidth={1.5} />
      </span>
    </div>
  )
}

export default function CallSimulator({ scenario, onClose, onPickAnother }) {
  const [phase, setPhase] = useState('ringing') // ringing | talking | ended
  const [transcript, setTranscript] = useState([])
  const [choices, setChoices] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [ending, setEnding] = useState(null)
  const [flags, setFlags] = useState([])
  const [picks, setPicks] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [voiceOn, setVoiceOn] = useState(true)
  const { speak, stop, unlock, supported } = useSpeech(voiceOn && phase === 'talking')
  const runId = useRef(0)
  const scrollRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const voiceRef = useRef(voiceOn)
  voiceRef.current = voiceOn && supported

  const push = (item) => setTranscript((t) => [...t, { id: `${Date.now()}-${Math.random()}`, ...item }])

  const finish = useCallback(
    (endId) => {
      runId.current += 1
      stop()
      setChoices(null)
      setSpeaking(false)
      setEnding({ id: endId, ...(scenario.endings[endId] ?? COMMON_ENDINGS[endId]) })
      setPhase('ended')
    },
    [scenario, stop]
  )

  const playNode = useCallback(
    async (id) => {
      const token = runId.current
      if (scenario.endings[id] || COMMON_ENDINGS[id]) {
        await sleep(700)
        if (token === runId.current) finish(id)
        return
      }
      const node = scenario.nodes[id]
      setFlags((f) => [...f, ...node.flags.filter((x) => !f.includes(x))])

      for (const line of node.lines) {
        setSpeaking(true)
        await sleep(voiceRef.current ? 450 : Math.min(500 + line.length * 16, 2000))
        if (token !== runId.current) return
        setSpeaking(false)
        push({ type: 'them', text: line })
        if (voiceRef.current) await speak(line)
        else await sleep(450)
        if (token !== runId.current) return
      }

      if (node.choices) setChoices(node.choices)
      else playNode(node.next)
    },
    [scenario, finish, speak]
  )

  const reset = useCallback(() => {
    runId.current += 1
    stop()
    setTranscript([])
    setChoices(null)
    setSpeaking(false)
    setEnding(null)
    setFlags([])
    setPicks([])
    setSeconds(0)
  }, [stop])

  const start = useCallback(() => {
    if (voiceRef.current) unlock()
    reset()
    setPhase('talking')
    playNode(scenario.start)
  }, [playNode, scenario, unlock, reset])

  const choose = async (choice) => {
    const token = runId.current
    setChoices(null)
    push({ type: 'me', text: choice.label })
    setPicks((p) => [...p, choice.safe])
    if (choice.feedback) {
      await sleep(350)
      if (token !== runId.current) return
      push({ type: 'feedback', safe: choice.safe, text: choice.feedback })
    }
    await sleep(choice.feedback ? 1100 : 500)
    if (token === runId.current) playNode(choice.next)
  }

  const hangUp = () => finish(phase === 'ringing' ? 'recusou' : 'desligou')

  const close = useCallback(() => {
    runId.current += 1
    stop()
    onCloseRef.current()
  }, [stop])

  // Cronômetro da ligação
  useEffect(() => {
    if (phase !== 'talking') return undefined
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  // Rola a conversa até o fim
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [transcript, choices, speaking])

  // Esc fecha
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  // Trava a rolagem do fundo e cancela a conversa só quando a simulação é fechada
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      runId.current += 1
      document.body.style.overflow = prev
    }
  }, [])

  const rated = picks.filter((p) => p !== null)
  const safeCount = rated.filter(Boolean).length
  const outcome = ending ? OUTCOME[ending.outcome] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Simulação: ${scenario.title}`}>
      <button type="button" aria-label="Fechar simulação" onClick={close} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="animate-rise relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-ink-850 to-ink-950 sm:h-[min(800px,94dvh)] sm:max-w-sm sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-2xl">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pb-2">
          <SimBadge />
          <button type="button" onClick={close} aria-label="Fechar simulação" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* ───────── Recebendo ligação ───────── */}
        {phase === 'ringing' && (
          <div className="flex flex-1 flex-col items-center justify-between px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
            <div className="mt-6 flex flex-col items-center">
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

            <div className="w-full space-y-5">
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-500">
                Ligação fictícia para treinar. Ouça o que o golpista diz, escolha o que responder e veja os sinais de golpe.
              </p>
              {supported && (
                <label htmlFor="sim-voice" className="mx-auto flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input
                    id="sim-voice"
                    type="checkbox"
                    checked={voiceOn}
                    onChange={(e) => setVoiceOn(e.target.checked)}
                    className="size-4 accent-cyan-400"
                  />
                  Ouvir a voz do golpista
                </label>
              )}
              <div className="flex items-start justify-center gap-16">
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
                    onClick={start}
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
                <p className="font-mono text-xs text-emerald-300 tabular-nums">{formatTime(seconds)}</p>
              </div>
              {supported && (
                <button
                  type="button"
                  onClick={() => setVoiceOn((v) => !v)}
                  aria-label={voiceOn ? 'Desligar a voz' : 'Ligar a voz'}
                  aria-pressed={voiceOn}
                  className="rounded-xl p-2.5 text-slate-300 ring-1 ring-white/10 hover:bg-white/5"
                >
                  {voiceOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {transcript.map((item) => {
                if (item.type === 'them') {
                  return (
                    <div key={item.id} className="animate-rise max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.07] px-3.5 py-2.5 text-[15px] leading-relaxed text-slate-100">
                      {item.text}
                    </div>
                  )
                }
                if (item.type === 'me') {
                  return (
                    <div key={item.id} className="animate-rise ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-cyan-400 px-3.5 py-2.5 text-[15px] leading-relaxed font-medium text-ink-950">
                      {item.text}
                    </div>
                  )
                }
                const fb = FEEDBACK[String(item.safe)]
                const Icon = fb.icon
                return (
                  <div key={item.id} className={`animate-rise rounded-2xl border px-3.5 py-3 ${fb.box}`}>
                    <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${fb.text}`}>
                      <Icon className="size-3.5" /> {fb.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{item.text}</p>
                  </div>
                )
              })}

              {speaking && (
                <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-md bg-white/[0.07] px-4 py-3.5" aria-label="Falando">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
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
              <div className="flex justify-center">
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

        {/* ───────── Resultado ───────── */}
        {phase === 'ended' && ending && (
          <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <p className="text-center text-xs text-slate-500">
              Chamada encerrada{seconds > 0 ? ` · ${formatTime(seconds)}` : ''}
            </p>

            <div className="animate-rise mt-6 flex flex-col items-center text-center">
              <span className={`grid size-16 place-items-center rounded-full ring-8 ${outcome.ring}`}>
                <outcome.icon className={`size-8 ${outcome.text}`} />
              </span>
              <h2 className={`mt-5 font-display text-2xl font-bold ${outcome.text}`}>{ending.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{ending.text}</p>
              {rated.length > 0 && (
                <p className="mt-4 rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10">
                  Atitudes seguras: <strong className="text-white">{safeCount}</strong> de {rated.length}
                </p>
              )}
            </div>

            {flags.length > 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Flag className="size-3.5 text-red-400" /> Sinais de golpe nesta ligação
                </p>
                <ul className="space-y-2">
                  {flags.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-slate-200">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto space-y-2 pt-6">
              {ending.id === 'recusou' ? (
                <button
                  type="button"
                  onClick={start}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
                >
                  <Phone className="size-4" /> Ver como seria a ligação
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setPhase('ringing')
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
                >
                  <RotateCcw className="size-4" /> Tentar de novo
                </button>
              )}
              <button
                type="button"
                onClick={onPickAnother}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                <LayoutGrid className="size-4" /> Treinar outro golpe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

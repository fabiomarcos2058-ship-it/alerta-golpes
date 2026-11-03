import { Phone, PhoneOff, PhoneIncoming, Landmark, ArrowDown } from 'lucide-react'

/** Mini celular "tocando" usado como chamariz do simulador. */
function RingingPhone({ onAnswer }) {
  return (
    <button
      type="button"
      onClick={onAnswer}
      aria-label="Atender a ligação simulada"
      className="group relative flex w-44 shrink-0 flex-col items-center rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-ink-800 to-ink-950 px-4 pt-4 pb-5 shadow-2xl shadow-emerald-950/50 transition hover:-translate-y-1 hover:border-emerald-400/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
    >
      <span className="h-1 w-10 rounded-full bg-white/10" />
      <span className="mt-4 flex items-center gap-1 text-[10px] font-medium text-emerald-300">
        <PhoneIncoming className="size-3 motion-safe:animate-pulse" /> Chamada recebida
      </span>
      <span className="relative mt-4 grid size-16 place-items-center">
        <span className="absolute inset-0 rounded-full bg-emerald-400/25 motion-safe:animate-ping" />
        <span className="relative grid size-full place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-1 ring-white/10">
          <Landmark className="size-7 text-slate-200" strokeWidth={1.5} />
        </span>
      </span>
      <span className="mt-3 text-sm font-semibold text-white">Central de Segurança</span>
      <span className="text-[11px] text-slate-500">Banco Horizonte</span>
      <span className="mt-5 flex w-full items-center justify-around">
        <span className="grid size-10 place-items-center rounded-full bg-red-500/90 text-white">
          <PhoneOff className="size-4" />
        </span>
        <span className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition group-hover:scale-110 motion-safe:animate-bounce">
          <Phone className="size-4" />
        </span>
      </span>
    </button>
  )
}

export default function SimulatorSpotlight({ onStart }) {
  return (
    <section
      aria-labelledby="spotlight-title"
      className="relative overflow-hidden rounded-3xl border border-emerald-400/25 bg-ink-900/90 shadow-2xl shadow-emerald-950/30"
    >
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-24 size-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between sm:gap-8 sm:p-8">
        <div className="text-center sm:text-left">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-ink-950">Novo</span>
            Simulador de golpe
          </p>
          <h2 id="spotlight-title" className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Você atenderia essa ligação?
          </h2>
          <p className="mt-3 max-w-md text-pretty text-slate-300">
            Receba uma ligação de golpe <strong className="font-semibold text-white">de mentira</strong>, escolha o que
            responder e descubra se você cairia. Leva 2 minutos e ensina a reconhecer os sinais.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onStart()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 sm:w-auto"
            >
              <Phone className="size-5" />
              Atender ligação simulada
            </button>
            <a
              href="#simulador"
              className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-emerald-200 hover:text-white"
            >
              Ver os 4 tipos de golpe <ArrowDown className="size-4" />
            </a>
          </div>
        </div>

        <div className="hidden sm:block">
          <RingingPhone onAnswer={() => onStart()} />
        </div>
      </div>
    </section>
  )
}

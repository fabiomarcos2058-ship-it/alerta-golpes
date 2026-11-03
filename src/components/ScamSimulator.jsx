import { PhoneIncoming, ChevronRight } from 'lucide-react'
import { SCENARIOS } from '../data/scamScenarios'

export default function ScamSimulator({ onStart }) {
  return (
    <section
      id="simulador"
      className="mb-6 scroll-mt-24 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.07] via-ink-900/80 to-ink-900/80 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xl">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <PhoneIncoming className="size-3.5" /> Simulador de golpe
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold text-white">Escolha qual golpe treinar</h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Cada ligação mostra um golpe comum no Brasil. Depois de cada resposta, você vê o sinal de golpe que estava ali.
          </p>
        </div>
        <span className="text-xs text-slate-500">Tudo fictício · cerca de 2 minutos cada</span>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon
          return (
            <li key={sc.id}>
              <button
                type="button"
                onClick={() => onStart(sc.id)}
                className="group flex h-full w-full items-center gap-4 rounded-2xl border border-white/10 bg-ink-950/40 p-4 text-left transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.06] focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10 transition group-hover:bg-emerald-400/10 group-hover:ring-emerald-400/30">
                  <Icon className="size-5 text-slate-200" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{sc.title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-slate-400">{sc.summary}</span>
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <ChevronRight className="size-5" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

import { ShieldCheck, Flag, MessageSquareHeart, PhoneIncoming } from 'lucide-react'

const NAV = [
  { href: '#consulta', label: 'Consultar' },
  { href: '#feed', label: 'Denúncias' },
  { href: '#dicas', label: 'Dicas' },
]

export default function Header({ onReport, onFeedback, onSimulate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#consulta" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30">
            <ShieldCheck className="size-5 text-cyan-300" />
          </span>
          <span className="hidden font-display text-lg font-bold tracking-tight text-white min-[400px]:inline">
            Alerta<span className="text-cyan-300">Golpe</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Seções">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onFeedback}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <MessageSquareHeart className="size-4" />
            Feedback
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSimulate()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:px-3.5"
          >
            <PhoneIncoming className="size-4" />
            <span>Simular<span className="hidden sm:inline"> golpe</span></span>
          </button>
          <button
            type="button"
            onClick={() => onReport()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:px-3.5"
          >
            <Flag className="size-4" />
            <span>Denunciar<span className="hidden sm:inline"> número</span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

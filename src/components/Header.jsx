import { Search, PhoneIncoming, MessageSquareText, Lightbulb, UserRound, Flag, Type, LogIn, Layers } from 'lucide-react'
import Logo from './Logo'
import { formatPhone } from '../utils/phone'

export const NAV = [
  { id: 'consultar', label: 'Consultar', short: 'Consultar', icon: Search },
  { id: 'simulador', label: 'Simular golpe', short: 'Simular', icon: PhoneIncoming },
  { id: 'mensagem', label: 'Analisar mensagem', short: 'Mensagem', icon: MessageSquareText },
  { id: 'dicas', label: 'Dicas', short: 'Dicas', icon: Lightbulb },
  { id: 'minha-area', label: 'Minha área', short: 'Minha área', icon: UserRound },
  { id: 'planos', label: 'Planos', short: 'Planos', icon: Layers, desktopOnly: true },
]

export default function Header({ view, go, onReport, onLogin, user, bigText, onToggleText }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <a href="#consultar" aria-label="Alerta Golpe, página inicial">
          <Logo compact />
        </a>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleText}
            aria-pressed={bigText}
            title={bigText ? 'Voltar o texto ao tamanho normal' : 'Aumentar o texto'}
            className={`btn btn-ghost px-2.5 ${bigText ? 'bg-brand-tint text-brand' : ''}`}
          >
            <Type className="size-5" />
            <span className="hidden sm:inline">{bigText ? 'Texto normal' : 'Texto maior'}</span>
          </button>

          {user ? (
            <button type="button" onClick={() => go('minha-area')} className="btn btn-ghost hidden px-3 md:inline-flex">
              <UserRound className="size-5" />
              <span className="font-mono text-sm">{formatPhone(user.phone).replace(/\d{4}-/, '••••-')}</span>
            </button>
          ) : (
            <button type="button" onClick={onLogin} className="btn btn-ghost hidden px-3 md:inline-flex">
              <LogIn className="size-5" /> Entrar
            </button>
          )}

          <button type="button" onClick={() => onReport()} className="btn btn-secondary px-3" aria-label="Denunciar um número">
            <Flag className="size-[18px] text-danger" />
            <span className={bigText ? 'hidden min-[440px]:inline' : ''}>Denunciar</span>
          </button>
        </div>
      </div>

      {/* Abas no computador */}
      <nav className="mx-auto hidden max-w-5xl gap-1 px-4 md:flex" aria-label="Seções do site">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-2 px-3 pt-2 pb-3 text-[15px] font-semibold transition ${
                active ? 'text-brand' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon className="size-[18px]" />
              {label}
              {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-brand" />}
            </a>
          )
        })}
      </nav>
    </header>
  )
}

/** Barra de navegação fixa embaixo, no celular. */
export function BottomNav({ view }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Seções do site"
    >
      <div className="grid grid-cols-5">
        {NAV.filter((n) => !n.desktopOnly).map(({ id, short, icon: Icon }) => {
          const active = view === id
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-[12px] leading-tight font-semibold ${
                active ? 'text-brand' : 'text-ink-soft'
              }`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-brand-tint' : ''}`}>
                <Icon className="size-[20px]" />
              </span>
              <span className="text-center">{short}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

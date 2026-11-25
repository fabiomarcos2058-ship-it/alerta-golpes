import { Search, PhoneIncoming, MessageSquareText, Lightbulb, UserRound, Flag, Type, LogIn, Sparkles, Bell } from 'lucide-react'
import Logo from './Logo'
import { formatPhone } from '../utils/phone'

export const NAV = [
  { id: 'consultar', label: 'Consultar', short: 'Consultar', icon: Search },
  { id: 'simulador', label: 'Simular golpe', short: 'Simular', icon: PhoneIncoming },
  { id: 'mensagem', label: 'Analisar mensagem', short: 'Mensagem', icon: MessageSquareText },
  { id: 'dicas', label: 'Ajuda e dicas', short: 'Ajuda', icon: Lightbulb },
  { id: 'minha-area', label: 'Minha área', short: 'Conta', icon: UserRound },
  { id: 'planos', label: 'Planos', short: 'Planos', icon: Sparkles, desktopOnly: true },
]

function planTag({ isPremium, isTrial, daysLeft, canTrial }) {
  if (isTrial) return `${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
  if (isPremium) return 'Ativo'
  if (canTrial) return 'Teste grátis'
  return null
}

export default function Header({ view, go, onReport, onLogin, user, bigText, onToggleText, planInfo, unread, onBell }) {
  const tag = planTag(planInfo)
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

          <button
            type="button"
            onClick={onBell}
            className="btn btn-ghost relative px-2.5"
            aria-label={unread ? `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Notificações'}
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[11px] leading-none font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

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
          if (id === 'planos')
            return (
              <a
                key={id}
                href="#planos"
                aria-current={active ? 'page' : undefined}
                className={`relative ml-auto flex items-center gap-2 px-3 pt-2 pb-3 text-[15px] font-semibold transition ${active ? 'text-brand' : 'text-brand hover:text-brand-dark'}`}
              >
                <Icon className="size-[18px]" />
                {label}
                {tag && <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">{tag}</span>}
                {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-brand" />}
              </a>
            )
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
export function BottomNav({ view, planInfo }) {
  // No celular, os planos ficam dentro de Conta: a aba ganha um ponto quando há teste grátis ou teste em andamento
  const dot = planInfo.isTrial || planInfo.canTrial
  const dotLabel = planInfo.isTrial ? `, teste grátis: faltam ${planInfo.daysLeft} dias` : planInfo.canTrial ? ', teste grátis disponível' : ''
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Seções do site"
    >
      <div className="grid grid-cols-5">
        {NAV.filter((n) => !n.desktopOnly).map(({ id, short, icon: Icon }) => {
          const active = view === id || (id === 'minha-area' && view === 'planos')
          const withDot = id === 'minha-area' && dot
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active ? 'page' : undefined}
              aria-label={withDot ? `${short}${dotLabel}` : undefined}
              className={`flex flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-[12px] leading-tight font-semibold ${active ? 'text-brand' : 'text-ink-soft'}`}
            >
              <span className={`relative grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-brand-tint' : ''}`}>
                <Icon className="size-[20px]" />
                {withDot && <span className="absolute top-0.5 right-2.5 size-2.5 rounded-full bg-brand ring-2 ring-white" aria-hidden="true" />}
              </span>
              <span className="text-center">{short}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

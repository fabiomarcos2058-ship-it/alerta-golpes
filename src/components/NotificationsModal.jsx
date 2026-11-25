import { useEffect, useState } from 'react'
import { Bell, BellOff, Flag, Users, Ban, Trash2, Archive, Bookmark, Scale, BadgeCheck, Settings, CheckCheck, Search, ArrowLeft, Info } from 'lucide-react'
import Modal from './Modal'
import { timeAgo } from '../utils/phone'
import { askNotificationPermission, showSystemNotification } from '../hooks/useInstall'

export const KIND = {
  welcome: { icon: Bell, cls: 'bg-brand-tint text-brand' },
  received: { icon: Flag, cls: 'bg-brand-tint text-brand' },
  confirmed: { icon: Users, cls: 'bg-warn-tint text-warn' },
  blocked: { icon: Ban, cls: 'bg-safe-tint text-safe' },
  removed: { icon: Trash2, cls: 'bg-paper text-ink-soft' },
  expired: { icon: Archive, cls: 'bg-paper text-ink-soft' },
  list: { icon: Bookmark, cls: 'bg-brand-tint text-brand' },
  review: { icon: Scale, cls: 'bg-brand-tint text-brand' },
  'review-done': { icon: BadgeCheck, cls: 'bg-safe-tint text-safe' },
  'review-denied': { icon: Scale, cls: 'bg-paper text-ink-soft' },
}

function Toggle({ id, label, hint, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-[15px] text-ink-soft">{hint}</span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none disabled:opacity-50 ${checked ? 'bg-brand' : 'bg-line'}`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

export default function NotificationsModal({ open, onClose, center, onCheck, isPremium, onPlans }) {
  const { visible, prefs, setPrefs, markAllRead, clear } = center
  const [settings, setSettings] = useState(false)
  const [pushMsg, setPushMsg] = useState('')

  const togglePush = async (v) => {
    setPushMsg('')
    if (!v) return setPrefs({ ...prefs, push: false })
    const result = await askNotificationPermission()
    if (result === 'granted') {
      setPrefs({ ...prefs, push: true })
      showSystemNotification('Avisos ligados', 'Assim vão aparecer os avisos do Alerta Golpe no seu aparelho.', 'teste')
    } else {
      setPushMsg(
        result === 'unsupported'
          ? 'Este navegador não mostra avisos do sistema. Instale o app ou use o Chrome.'
          : 'O navegador bloqueou os avisos. Libere nas configurações do site (ícone de cadeado ao lado do endereço).'
      )
    }
  }

  useEffect(() => {
    if (!open) setSettings(false)
  }, [open])

  const close = () => {
    markAllRead()
    onClose()
  }

  return (
    <Modal open={open} onClose={close} icon={Bell} title={settings ? 'Configurar avisos' : 'Notificações'} subtitle="Demonstração: os avisos são simulados" labelledBy="notif-title">
      {settings ? (
        <div className="overflow-y-auto px-5 py-4 sm:px-6">
          <button type="button" onClick={() => setSettings(false)} className="btn btn-ghost -ml-3 px-3">
            <ArrowLeft className="size-5" /> Voltar aos avisos
          </button>
          <div className="mt-2 divide-y divide-line">
            <Toggle id="pref-reports" label="Minhas denúncias" hint="Quando forem confirmadas, bloqueadas ou apagadas." checked={prefs.reports} onChange={(v) => setPrefs({ ...prefs, reports: v })} />
            <Toggle
              id="pref-list"
              label="Números da minha lista"
              hint={isPremium ? 'Quando receberem novas denúncias.' : 'Disponível nos planos pagos.'}
              checked={isPremium && prefs.list}
              disabled={!isPremium}
              onChange={(v) => setPrefs({ ...prefs, list: v })}
            />
            <Toggle id="pref-push" label="Avisar no celular" hint="Mostrar os avisos do Alerta Golpe na tela do aparelho." checked={prefs.push} onChange={togglePush} />
          </div>
          {pushMsg && <p role="alert" className="mt-2 rounded-xl bg-warn-tint p-3 text-[15px] text-warn">{pushMsg}</p>}
          {!isPremium && (
            <button type="button" onClick={() => { close(); onPlans() }} className="btn btn-secondary mt-3">Ver planos</button>
          )}
          <p className="mt-4 flex gap-3 rounded-xl bg-brand-tint p-4 text-[15px] text-ink">
            <Info className="mt-0.5 size-5 shrink-0 text-brand" />
            <span>
              Os avisos aparecem no aparelho enquanto o site ou o app estiver aberto, mesmo em segundo plano. Nesta demonstração, as novidades das denúncias são simuladas e chegam em segundos. Com o banco de dados ligado, poderão chegar com o app fechado.
            </span>
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-2.5 sm:px-6">
            <button type="button" onClick={markAllRead} disabled={!visible.some((n) => !n.read)} className="btn btn-ghost -ml-3 px-3 text-[15px] disabled:opacity-40">
              <CheckCheck className="size-5" /> Marcar como lidas
            </button>
            <div className="flex gap-1">
              <button type="button" onClick={clear} disabled={visible.length === 0} className="btn btn-ghost px-3 text-[15px] disabled:opacity-40">Limpar</button>
              <button type="button" onClick={() => setSettings(true)} className="btn btn-ghost px-3" aria-label="Configurar avisos">
                <Settings className="size-5" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <BellOff className="size-10 text-line" />
                <p className="mt-3 font-semibold text-ink">Nenhum aviso por enquanto</p>
                <p className="mt-1 max-w-xs text-ink-soft">Quando você denunciar um número, contamos aqui o que aconteceu com ele.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((n) => {
                  const k = KIND[n.kind] ?? KIND.welcome
                  return (
                    <li key={n.id} className={`flex gap-3 px-5 py-4 sm:px-6 ${n.read ? '' : 'bg-brand-tint/50'}`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full ${k.cls}`}>
                        <k.icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-start justify-between gap-2">
                          <span className="font-bold text-ink">{n.title}</span>
                          {!n.read && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-brand" aria-label="Não lida" />}
                        </p>
                        <p className="mt-0.5 text-[15px] text-ink">{n.text}</p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
                          {timeAgo(n.at)}
                          {n.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                close()
                                onCheck(n.phone)
                              }}
                              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                            >
                              <Search className="size-4" /> Consultar número
                            </button>
                          )}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}

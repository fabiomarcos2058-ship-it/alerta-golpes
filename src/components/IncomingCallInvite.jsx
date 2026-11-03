import { useEffect, useState } from 'react'
import { Phone, PhoneOff, Landmark } from 'lucide-react'

const SEEN_KEY = 'alerta-golpe:convite-simulador'
const DELAY_MS = 8000

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* sem armazenamento: o convite pode voltar na próxima visita */
  }
}

/**
 * "Ligação recebida" que aparece uma vez por visita, alguns segundos depois de a
 * pessoa entrar, convidando para o simulador. Não aparece se outra janela estiver aberta.
 */
export default function IncomingCallInvite({ onAnswer, blocked }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (alreadySeen()) return undefined
    const t = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  // Se a pessoa já abriu o simulador por outro caminho, o convite não é mais necessário.
  useEffect(() => {
    if (blocked && visible) {
      setVisible(false)
      markSeen()
    }
  }, [blocked, visible])

  if (!visible || blocked) return null

  const dismiss = () => {
    setVisible(false)
    markSeen()
  }

  return (
    <div
      role="dialog"
      aria-label="Ligação simulada recebida"
      className="animate-rise fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
    >
      <div className="flex items-center gap-2.5 rounded-3xl border border-emerald-400/30 bg-ink-850/95 p-3 pr-3.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <span className="relative grid size-11 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 motion-safe:animate-ping" />
          <span className="relative grid size-full place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-1 ring-white/10">
            <Landmark className="size-5 text-slate-200" strokeWidth={1.5} />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Ligação simulada</p>
          <p className="truncate text-[15px] font-semibold text-white">Central do banco</p>
          <p className="truncate text-xs text-slate-400">Você cairia nesse golpe?</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Recusar convite"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-red-500 text-white transition hover:bg-red-400"
        >
          <PhoneOff className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            dismiss()
            onAnswer()
          }}
          aria-label="Atender ligação simulada"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
        >
          <Phone className="size-5" />
        </button>
      </div>
    </div>
  )
}

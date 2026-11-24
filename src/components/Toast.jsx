import { useEffect } from 'react'
import { Bell, CircleCheck, X } from 'lucide-react'

/** Aviso rápido. `message` pode ser um texto ou { text, bell, actionLabel, onAction }. */
export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const id = setTimeout(onClose, typeof message === 'string' ? 4500 : 6500)
    return () => clearTimeout(id)
  }, [message, onClose])

  if (!message) return null
  const m = typeof message === 'string' ? { text: message } : message
  const Icon = m.bell ? Bell : CircleCheck
  return (
    <div className="fixed inset-x-4 bottom-24 z-40 flex justify-center md:inset-x-auto md:right-6 md:bottom-6" role="status">
      <div className="animate-rise flex max-w-sm items-start gap-3 rounded-2xl bg-ink p-4 text-white shadow-2xl">
        <Icon className={`mt-0.5 size-5 shrink-0 ${m.bell ? 'text-amber-300' : 'text-emerald-300'}`} />
        <div className="text-[15px]">
          <p>{m.text}</p>
          {m.onAction && (
            <button
              type="button"
              onClick={() => {
                m.onAction()
                onClose()
              }}
              className="mt-1.5 font-semibold text-sky-200 underline-offset-2 hover:underline"
            >
              {m.actionLabel}
            </button>
          )}
        </div>
        <button type="button" onClick={onClose} className="text-white/70 hover:text-white" aria-label="Fechar aviso">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

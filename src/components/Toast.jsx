import { useEffect } from 'react'
import { CircleCheck, X } from 'lucide-react'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const id = setTimeout(onClose, 4500)
    return () => clearTimeout(id)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6" role="status">
      <div className="animate-rise flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-500/30 bg-ink-850 p-4 shadow-2xl shadow-black/50">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
        <p className="text-sm text-slate-200">{message}</p>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Fechar aviso">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

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
    <div className="fixed inset-x-4 bottom-24 z-40 flex justify-center md:inset-x-auto md:right-6 md:bottom-6" role="status">
      <div className="animate-rise flex max-w-sm items-start gap-3 rounded-2xl bg-ink p-4 text-white shadow-2xl">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" />
        <p className="text-[15px]">{message}</p>
        <button type="button" onClick={onClose} className="text-white/70 hover:text-white" aria-label="Fechar aviso">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

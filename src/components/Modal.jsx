import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/** Janela sobre a página. No celular sobe de baixo, no computador fica no centro. */
export default function Modal({ open, onClose, title, subtitle, icon: Icon, busy = false, children, labelledBy = 'modal-title' }) {
  const panel = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setTimeout(() => panel.current?.querySelector('input, textarea, select, button[data-autofocus]')?.focus(), 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, busy])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Fechar" onClick={() => !busy && onClose()} className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="animate-rise relative flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                <Icon className="size-5" />
              </span>
            )}
            <div>
              <h2 id={labelledBy} className="text-xl font-bold text-ink">{title}</h2>
              {subtitle && <p className="text-[15px] text-ink-soft">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Fechar" className="btn btn-ghost -mr-2 p-2">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
    </div>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-sm font-medium text-danger">{children}</p>
}

import { FlaskConical } from 'lucide-react'

/** Aviso curto de que os dados mostrados são da base de demonstração. */
export default function DemoNote({ children, className = '' }) {
  return (
    <p className={`flex gap-2 text-sm text-ink-soft ${className}`}>
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

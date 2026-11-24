import { Lock, Sparkles, Layers } from 'lucide-react'
import Modal from './Modal'
import { TRIAL_DAYS } from '../data/plans'

/** Aviso de recurso do plano pago, com o teste grátis em destaque. */
export default function UpgradePrompt({ title, text, canTrial, onTrial, onPlans, className = '' }) {
  return (
    <div className={`rounded-2xl border border-brand/25 bg-brand-tint p-5 ${className}`}>
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand">
          <Lock className="size-5" />
        </span>
        <div>
          <p className="font-bold text-ink">{title}</p>
          <p className="mt-0.5 text-ink-soft">{text}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {canTrial && (
          <button type="button" onClick={onTrial} className="btn btn-primary">
            <Sparkles className="size-5" /> Testar grátis por {TRIAL_DAYS} dias
          </button>
        )}
        <button type="button" onClick={onPlans} className={`btn ${canTrial ? 'btn-secondary' : 'btn-primary'}`}>
          <Layers className="size-5" /> Ver planos
        </button>
      </div>
    </div>
  )
}

/** A mesma oferta numa janela, para quando a pessoa bate num limite. */
export function UpgradeModal({ open, onClose, ...props }) {
  return (
    <Modal open={open} onClose={onClose} icon={Lock} title="Recurso do plano pago" subtitle="Simulação: nada é cobrado" labelledBy="upgrade-title">
      <div className="px-5 py-5 sm:px-6">
        <UpgradePrompt
          {...props}
          onTrial={() => {
            props.onTrial()
            onClose()
          }}
          onPlans={() => {
            props.onPlans()
            onClose()
          }}
        />
      </div>
    </Modal>
  )
}

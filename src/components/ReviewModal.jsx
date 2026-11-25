import { useState } from 'react'
import { Scale, CircleCheck, Info } from 'lucide-react'
import Modal from './Modal'
import { formatPhone } from '../utils/phone'

const REASONS = [
  { id: 'meu', label: 'O número é meu e nunca liguei para aplicar golpe' },
  { id: 'clonado', label: 'Meu número foi clonado ou usado por outra pessoa' },
  { id: 'novo', label: 'Comprei este número há pouco tempo' },
  { id: 'empresa', label: 'É o número de uma empresa de verdade' },
]

/**
 * Pedido de revisão (simulação). Protege quem teve o número denunciado por engano.
 * Não pede nenhum dado: só o motivo.
 */
export default function ReviewModal({ phone, days, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  if (!phone) return null

  return (
    <Modal open onClose={onClose} icon={Scale} title="Pedir revisão do número" subtitle={formatPhone(phone)} labelledBy="review-title">
      {done ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <CircleCheck className="size-14 text-safe" strokeWidth={1.8} />
          <h3 className="mt-4 text-2xl font-bold text-ink">Pedido enviado</h3>
          <p className="mt-2 max-w-sm text-ink-soft">Vamos analisar as denúncias em até {days} dias. O resultado aparece nas suas notificações.</p>
          <button type="button" onClick={onClose} className="btn btn-primary mt-7">Fechar</button>
        </div>
      ) : (
        <form
          className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!reason || sending) return
            setSending(true)
            setError('')
            try {
              await onSubmit(phone, reason)
              setDone(true)
            } catch (err) {
              setError(err.message || 'Não foi possível enviar o pedido. Tente de novo.')
            } finally {
              setSending(false)
            }
          }}
        >
          <p className="text-ink">
            Denúncias erradas prejudicam pessoas inocentes. Se este número é seu ou foi usado sem você saber, peça para a gente revisar.
          </p>
          <fieldset>
            <legend className="label">Qual é o motivo?</legend>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r.id} className="block cursor-pointer">
                  <input type="radio" name="reason" value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="peer sr-only" />
                  <span className="block rounded-xl border border-line px-4 py-3 text-ink transition peer-checked:border-brand peer-checked:bg-brand-tint peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p role="alert" className="rounded-xl bg-danger-tint p-3 text-[15px] text-danger">{error}</p>
          )}
          <p className="flex gap-3 rounded-xl bg-paper p-4 text-[15px] text-ink-soft">
            <Info className="mt-0.5 size-5 shrink-0 text-brand" />
            Não pedimos documento nem nenhum dado pessoal: só o motivo. Uma pessoa da moderação confere as denúncias e decide.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" disabled={!reason || sending} className="btn btn-primary disabled:opacity-50">{sending ? 'Enviando…' : 'Enviar pedido'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Star, MessageSquareHeart, LoaderCircle, CircleCheck, TriangleAlert, Lightbulb, Bug, Heart, CircleHelp, Send } from 'lucide-react'
import Modal, { FieldError } from './Modal'

const KINDS = [
  { id: 'sugestao', label: 'Sugestão', icon: Lightbulb },
  { id: 'problema', label: 'Problema', icon: Bug },
  { id: 'elogio', label: 'Elogio', icon: Heart },
  { id: 'outro', label: 'Outro', icon: CircleHelp },
]
const RATING_LABELS = ['', 'Muito ruim', 'Ruim', 'Ok', 'Bom', 'Excelente']
const PLACEHOLDERS = {
  sugestao: 'O que você gostaria que o site tivesse?',
  problema: 'O que deu errado? Em qual parte do site?',
  elogio: 'O que você mais gostou?',
  outro: 'Escreva sua mensagem…',
}
const MIN_MSG = 10
const MAX_MSG = 1000
const EMPTY = { rating: 0, kind: '', message: '', contact: '' }

function validate(form) {
  const errors = {}
  if (!form.rating) errors.rating = 'Dê uma nota de 1 a 5 estrelas.'
  if (!form.kind) errors.kind = 'Escolha sobre o que é o feedback.'
  if (form.message.trim().length < MIN_MSG) errors.message = `Escreva pelo menos ${MIN_MSG} letras.`
  return errors
}

export default function FeedbackModal({ open, onClose, onSubmit, isDemo }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState('form')
  const [submitError, setSubmitError] = useState('')
  const [hover, setHover] = useState(0)

  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setErrors({})
    setSubmitted(false)
    setSubmitError('')
    setState('form')
  }, [open])

  const update = (field, value) => {
    const next = { ...form, [field]: value }
    setForm(next)
    if (submitted) setErrors(validate(next))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return
    setState('sending')
    try {
      await onSubmit(form)
      setState('success')
    } catch (err) {
      setSubmitError(err.message)
      setState('form')
    }
  }

  const shown = hover || form.rating

  return (
    <Modal open={open} onClose={onClose} busy={state === 'sending'} icon={MessageSquareHeart} title="Enviar feedback" subtitle="Ajude a melhorar o Alerta Golpe" labelledBy="feedback-title">
      {state === 'success' ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <CircleCheck className="size-14 text-safe" strokeWidth={1.8} />
          <h3 className="mt-4 text-2xl font-bold text-ink">Feedback enviado</h3>
          <p className="mt-2 max-w-sm text-ink-soft">Obrigado por ajudar a melhorar o site.</p>
          {isDemo && <p className="mt-2 max-w-sm text-sm text-ink-soft">Modo demonstração: o feedback ficou salvo só neste aparelho.</p>}
          <button type="button" onClick={onClose} className="btn btn-primary mt-7">Fechar</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            <fieldset>
              <legend className="label">Como está sendo sua experiência?</legend>
              <div role="radiogroup" aria-label="Nota de 1 a 5" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={form.rating === n}
                    aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}: ${RATING_LABELS[n]}`}
                    onClick={() => update('rating', n)}
                    onMouseEnter={() => setHover(n)}
                    className="rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <Star className={`size-9 ${n <= shown ? 'fill-amber-400 text-amber-500' : 'text-line'}`} strokeWidth={1.6} />
                  </button>
                ))}
                <span className="ml-2 font-semibold text-ink-soft">{RATING_LABELS[shown]}</span>
              </div>
              <FieldError>{errors.rating}</FieldError>
            </fieldset>

            <fieldset>
              <legend className="label">Sobre o quê?</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {KINDS.map(({ id, label, icon: Icon }) => (
                  <label key={id} className="cursor-pointer">
                    <input type="radio" name="fb-kind" value={id} checked={form.kind === id} onChange={() => update('kind', id)} className="peer sr-only" />
                    <span className="flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 font-semibold text-ink transition hover:border-ink-soft/40 peer-checked:border-brand peer-checked:bg-brand-tint peer-checked:text-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                      <Icon className="size-4" /> {label}
                    </span>
                  </label>
                ))}
              </div>
              <FieldError>{errors.kind}</FieldError>
            </fieldset>

            <div>
              <label htmlFor="fb-message" className="label">Sua mensagem</label>
              <textarea
                id="fb-message"
                rows={4}
                maxLength={MAX_MSG}
                placeholder={PLACEHOLDERS[form.kind] ?? 'Conte o que você achou…'}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                className={`field resize-none leading-relaxed ${errors.message ? 'field-error' : ''}`}
              />
              <FieldError>{errors.message}</FieldError>
            </div>

            <div>
              <label htmlFor="fb-contact" className="label">
                E-mail ou WhatsApp <span className="font-normal text-ink-soft">(opcional)</span>
              </label>
              <input id="fb-contact" type="text" maxLength={120} autoComplete="email" placeholder="Só se quiser receber resposta" value={form.contact} onChange={(e) => update('contact', e.target.value)} className="field" />
              <p className="hint mt-1.5">Usado só para responder este feedback. Não aparece no site.</p>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="flex items-start gap-2 border-t border-danger/20 bg-danger-tint px-5 py-3 text-[15px] text-danger sm:px-6">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />
              {submitError}
            </p>
          )}
          <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} disabled={state === 'sending'} className="btn btn-secondary">Cancelar</button>
            <button type="submit" disabled={state === 'sending'} className="btn btn-primary">
              {state === 'sending' ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
              {state === 'sending' ? 'Enviando…' : 'Enviar feedback'}
            </button>
          </footer>
        </form>
      )}
    </Modal>
  )
}

import { useEffect, useRef, useState } from 'react'
import {
  X, Star, MessageSquareHeart, LoaderCircle, CircleCheck, TriangleAlert,
  Lightbulb, Bug, Heart, CircleHelp, Send,
} from 'lucide-react'

const KINDS = [
  { id: 'sugestao', label: 'Sugestão', icon: Lightbulb },
  { id: 'problema', label: 'Problema', icon: Bug },
  { id: 'elogio', label: 'Elogio', icon: Heart },
  { id: 'outro', label: 'Outro', icon: CircleHelp },
]

const RATING_LABELS = ['', 'Muito ruim', 'Ruim', 'Ok', 'Bom', 'Excelente']

const PLACEHOLDERS = {
  sugestao: 'O que você gostaria que o site tivesse?',
  problema: 'O que deu errado? Em qual parte do site? Se puder, conte o que você fez antes.',
  elogio: 'O que você mais gostou?',
  outro: 'Escreva sua mensagem…',
}

const MIN_MSG = 10
const MAX_MSG = 1000
const EMPTY = { rating: 0, kind: '', message: '', contact: '' }

function validate(form) {
  const errors = {}
  if (!form.rating) errors.rating = 'Dê uma nota de 1 a 5 estrelas.'
  if (!form.kind) errors.kind = 'Escolha o tipo de feedback.'
  if (form.message.trim().length < MIN_MSG) errors.message = `Escreva pelo menos ${MIN_MSG} caracteres.`
  return errors
}

function FieldError({ children }) {
  if (!children) return null
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-300">
      <TriangleAlert className="size-3.5" />
      {children}
    </p>
  )
}

function StarRating({ value, onChange, invalid }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Nota de 1 a 5"
        aria-invalid={invalid}
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}: ${RATING_LABELS[n]}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            className="rounded-lg p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-400"
          >
            <Star
              className={`size-8 transition ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
              strokeWidth={1.5}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-slate-300" aria-live="polite">
          {RATING_LABELS[shown]}
        </span>
      </div>
    </div>
  )
}

export default function FeedbackModal({ open, onClose, onSubmit, isDemo }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState('form') // form | sending | success
  const [submitError, setSubmitError] = useState('')
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setErrors({})
    setSubmitted(false)
    setSubmitError('')
    setState('form')
    setTimeout(() => dialogRef.current?.querySelector('[role=radio]')?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && state !== 'sending' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, state])

  if (!open) return null

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
    setSubmitError('')
    try {
      await onSubmit(form)
      setState('success')
    } catch (err) {
      setSubmitError(err.message)
      setState('form')
    }
  }

  const inputBase =
    'w-full rounded-xl border bg-ink-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 transition focus:outline-none focus:ring-4'
  const inputState = (field) =>
    errors[field]
      ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/10'
      : 'border-white/10 focus:border-cyan-400/60 focus:ring-cyan-400/10'

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => state !== 'sending' && onClose()}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="animate-rise relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30">
              <MessageSquareHeart className="size-4 text-cyan-300" />
            </span>
            <div>
              <h2 id="feedback-title" className="font-display text-lg font-semibold text-white">Enviar feedback</h2>
              <p className="text-xs text-slate-500">Ajude a melhorar o AlertaGolpe</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={state === 'sending'}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </header>

        {state === 'success' ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="animate-rise grid size-16 place-items-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/5">
              <CircleCheck className="size-8 text-emerald-400" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-white">Feedback enviado!</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Obrigado por ajudar a melhorar o site.
              {form.contact.trim() ? ' Se precisarmos de mais detalhes, entraremos em contato.' : ''}
            </p>
            {isDemo && (
              <p className="mt-3 max-w-sm text-xs text-slate-500">
                Modo demonstração: o feedback ficou salvo só neste navegador.
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-7 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-200">Como está sendo sua experiência?</legend>
                <StarRating value={form.rating} onChange={(n) => update('rating', n)} invalid={Boolean(errors.rating)} />
                <FieldError>{errors.rating}</FieldError>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-200">Sobre o quê?</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {KINDS.map(({ id, label, icon: Icon }) => (
                    <label key={id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="fb-kind"
                        value={id}
                        checked={form.kind === id}
                        onChange={() => update('kind', id)}
                        className="peer sr-only"
                      />
                      <span className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-950/50 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/25 peer-checked:border-cyan-400 peer-checked:bg-cyan-400/10 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-cyan-400/20">
                        <Icon className="size-4" />
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError>{errors.kind}</FieldError>
              </fieldset>

              <div>
                <label htmlFor="fb-message" className="mb-1.5 block text-sm font-medium text-slate-200">
                  Sua mensagem
                </label>
                <textarea
                  id="fb-message"
                  rows={4}
                  maxLength={MAX_MSG}
                  placeholder={PLACEHOLDERS[form.kind] ?? 'Conte pra gente o que você achou…'}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  className={`${inputBase} ${inputState('message')} resize-none leading-relaxed`}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <FieldError>{errors.message}</FieldError>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-slate-500">
                    {form.message.length}/{MAX_MSG}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="fb-contact" className="mb-1.5 block text-sm font-medium text-slate-200">
                  E-mail ou WhatsApp <span className="font-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  id="fb-contact"
                  type="text"
                  maxLength={120}
                  autoComplete="email"
                  placeholder="Só se quiser receber resposta"
                  value={form.contact}
                  onChange={(e) => update('contact', e.target.value)}
                  className={`${inputBase} ${inputState('contact')}`}
                />
                <p className="mt-1.5 text-[11px] text-slate-500">Usado apenas para responder este feedback. Não aparece no site.</p>
              </div>
            </div>

            {submitError && (
              <p role="alert" className="flex items-start gap-2 border-t border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-200 sm:px-6">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                {submitError}
              </p>
            )}

            <footer className="flex flex-col-reverse gap-2 border-t border-white/5 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                disabled={state === 'sending'}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {state === 'sending' ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                {state === 'sending' ? 'Enviando…' : 'Enviar feedback'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  )
}

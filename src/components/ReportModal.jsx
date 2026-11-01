import { useEffect, useRef, useState } from 'react'
import { X, Flag, LoaderCircle, CircleCheck, Search, Phone, TriangleAlert } from 'lucide-react'
import { CATEGORIES, SEVERITIES } from '../data/constants'
import { formatAsTyped, formatPhone, isValidPhone, normalizePhone } from '../utils/phone'

const MIN_DESC = 20
const MAX_DESC = 600
const EMPTY = { phone: '', category: '', severity: '', description: '' }

function validate(form) {
  const errors = {}
  const digits = normalizePhone(form.phone)
  if (!digits) errors.phone = 'Informe o número que entrou em contato.'
  else if (!isValidPhone(digits)) errors.phone = 'Número inválido. Use DDD + número, ex.: (11) 98765-4321.'
  if (!form.category) errors.category = 'Escolha o tipo de contato.'
  if (!form.severity) errors.severity = 'Escolha o nível de periculosidade.'
  const len = form.description.trim().length
  if (len < MIN_DESC) errors.description = `Conte um pouco mais (mínimo de ${MIN_DESC} caracteres).`
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

export default function ReportModal({ open, initialPhone = '', onClose, onSubmit, onViewNumber }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState('form') // form | sending | success
  const [sentPhone, setSentPhone] = useState('')
  const firstField = useRef(null)

  // Reinicia o formulário sempre que o modal abre.
  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY, phone: initialPhone ? formatAsTyped(initialPhone) : '' })
    setErrors({})
    setSubmitted(false)
    setState('form')
    setTimeout(() => firstField.current?.focus(), 50)
  }, [open, initialPhone])

  // Fecha com Esc e trava a rolagem do fundo.
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
    const report = await onSubmit(form)
    setSentPhone(report.phone)
    setState('success')
  }

  const descLen = form.description.length
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="animate-rise relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-red-500/15 ring-1 ring-red-500/30">
              <Flag className="size-4 text-red-300" />
            </span>
            <div>
              <h2 id="report-title" className="font-display text-lg font-semibold text-white">Nova denúncia</h2>
              <p className="text-xs text-slate-500">Seu relato ajuda a proteger outras pessoas</p>
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
            <h3 className="mt-5 font-display text-xl font-semibold text-white">Denúncia registrada!</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Obrigado. O número <span className="font-mono text-slate-200">{formatPhone(sentPhone)}</span> já
              aparece no feed e nas consultas da comunidade.
            </p>
            <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => onViewNumber(sentPhone)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
              >
                <Search className="size-4" /> Ver situação do número
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Número */}
              <div>
                <label htmlFor="r-phone" className="mb-1.5 block text-sm font-medium text-slate-200">
                  Número do telefone
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    ref={firstField}
                    id="r-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(11) 98765-4321"
                    value={form.phone}
                    onChange={(e) => update('phone', formatAsTyped(e.target.value))}
                    aria-invalid={Boolean(errors.phone)}
                    className={`${inputBase} ${inputState('phone')} pl-10 font-mono`}
                  />
                </div>
                <FieldError>{errors.phone}</FieldError>
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="r-category" className="mb-1.5 block text-sm font-medium text-slate-200">
                  Tipo de golpe / contato
                </label>
                <select
                  id="r-category"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  aria-invalid={Boolean(errors.category)}
                  className={`${inputBase} ${inputState('category')} appearance-none ${form.category ? '' : 'text-slate-500'}`}
                >
                  <option value="" disabled>Selecione…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-ink-900 text-white">{c.label}</option>
                  ))}
                </select>
                <FieldError>{errors.category}</FieldError>
              </div>

              {/* Periculosidade */}
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-200">Nível de periculosidade</legend>
                <div className="grid grid-cols-3 gap-2">
                  {SEVERITIES.map((s) => (
                    <label key={s.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value={s.id}
                        checked={form.severity === s.id}
                        onChange={() => update('severity', s.id)}
                        className="peer sr-only"
                      />
                      <span
                        className={`flex h-full flex-col rounded-xl border border-white/10 bg-ink-950/50 p-3 transition hover:border-white/25 peer-focus-visible:ring-4 peer-focus-visible:ring-cyan-400/20 ${s.ring}`}
                      >
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                          <span className={`size-2 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        <span className="mt-1 text-[11px] leading-snug text-slate-500">{s.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError>{errors.severity}</FieldError>
              </fieldset>

              {/* Relato */}
              <div>
                <label htmlFor="r-desc" className="mb-1.5 block text-sm font-medium text-slate-200">
                  O que aconteceu?
                </label>
                <textarea
                  id="r-desc"
                  rows={4}
                  maxLength={MAX_DESC}
                  placeholder="Ex.: Disseram ser do meu banco, sabiam meu CPF e pediram o código que chegou por SMS…"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  className={`${inputBase} ${inputState('description')} resize-none leading-relaxed`}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <FieldError>{errors.description}</FieldError>
                  <span className={`ml-auto shrink-0 font-mono text-[11px] ${descLen < MIN_DESC ? 'text-slate-600' : 'text-slate-500'}`}>
                    {descLen}/{MAX_DESC}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Não inclua seus dados pessoais (CPF, senhas, endereço) no relato.
                </p>
              </div>
            </div>

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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 disabled:opacity-60"
              >
                {state === 'sending' ? <LoaderCircle className="size-4 animate-spin" /> : <Flag className="size-4" />}
                {state === 'sending' ? 'Enviando…' : 'Enviar denúncia'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  )
}

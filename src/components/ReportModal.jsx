import { useEffect, useState } from 'react'
import { Flag, LoaderCircle, CircleCheck, Search, TriangleAlert } from 'lucide-react'
import Modal, { FieldError } from './Modal'
import { CATEGORIES, SEVERITIES } from '../data/constants'
import { formatAsTyped, formatPhone, isValidPhone, normalizePhone, isOfficialNumber } from '../utils/phone'

const MIN_DESC = 20
const MAX_DESC = 600
const EMPTY = { phone: '', category: '', severity: '', description: '' }

function validate(form) {
  const errors = {}
  const digits = normalizePhone(form.phone)
  if (!digits) errors.phone = 'Informe o número que ligou ou mandou mensagem.'
  else if (isOfficialNumber(digits) || isOfficialNumber(form.phone.replace(/\D/g, '')))
    errors.phone = 'Números de emergência e de atendimento oficial (190, 0800, 4004…) não podem ser denunciados. Se alguém usou um deles para te enganar, o número pode ter sido falsificado: avise o seu banco.'
  else if (!isValidPhone(digits)) errors.phone = 'Número inválido. Use DDD e número, por exemplo (11) 98765-4321, ou um 0303.'
  if (!form.category) errors.category = 'Escolha o tipo de golpe ou contato.'
  if (!form.severity) errors.severity = 'Escolha o nível de perigo.'
  if (form.description.trim().length < MIN_DESC) errors.description = `Conte um pouco mais: pelo menos ${MIN_DESC} letras.`
  return errors
}

export default function ReportModal({ open, initialPhone = '', onClose, onSubmit, onViewNumber }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState('form') // form | sending | success
  const [sentPhone, setSentPhone] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY, phone: initialPhone ? formatAsTyped(initialPhone) : '' })
    setErrors({})
    setSubmitted(false)
    setSubmitError('')
    setState('form')
  }, [open, initialPhone])

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
      const report = await onSubmit(form)
      setSentPhone(report.phone)
      setState('success')
    } catch (err) {
      setSubmitError(err.message)
      setState('form')
    }
  }

  return (
    <Modal open={open} onClose={onClose} busy={state === 'sending'} icon={Flag} title="Denunciar um número" subtitle="Seu relato ajuda a proteger outras pessoas" labelledBy="report-title">
      {state === 'success' ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <CircleCheck className="size-14 text-safe" strokeWidth={1.8} />
          <h3 className="mt-4 text-2xl font-bold text-ink">Denúncia enviada</h3>
          <p className="mt-2 max-w-sm text-ink-soft">
            Obrigado. O número <span className="font-mono text-ink">{formatPhone(sentPhone)}</span> já aparece para quem consultar.
          </p>
          <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button type="button" onClick={() => onViewNumber(sentPhone)} className="btn btn-primary">
              <Search className="size-5" /> Ver como ficou o número
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Fechar</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            <div>
              <label htmlFor="r-phone" className="label">Número que entrou em contato</label>
              <input
                id="r-phone"
                type="tel"
                inputMode="tel"
                placeholder="(11) 98765-4321"
                value={form.phone}
                onChange={(e) => update('phone', formatAsTyped(e.target.value))}
                aria-invalid={Boolean(errors.phone)}
                className={`field font-mono text-lg ${errors.phone ? 'field-error' : ''}`}
              />
              <FieldError>{errors.phone}</FieldError>
            </div>

            <div>
              <label htmlFor="r-category" className="label">O que aconteceu?</label>
              <select
                id="r-category"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                aria-invalid={Boolean(errors.category)}
                className={`field ${errors.category ? 'field-error' : ''} ${form.category ? '' : 'text-ink-soft'}`}
              >
                <option value="" disabled>Escolha o tipo de golpe ou contato</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <FieldError>{errors.category}</FieldError>
            </div>

            <fieldset>
              <legend className="label">Quão perigoso foi?</legend>
              <div className="grid grid-cols-3 gap-2">
                {SEVERITIES.map((s) => (
                  <label key={s.id} className="cursor-pointer">
                    <input type="radio" name="severity" value={s.id} checked={form.severity === s.id} onChange={() => update('severity', s.id)} className="peer sr-only" />
                    <span className={`flex h-full flex-col rounded-xl border border-line bg-white p-3 transition hover:border-ink-soft/40 peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20 ${s.ring}`}>
                      <span className="flex items-center gap-1.5 font-semibold text-ink">
                        <span className={`size-2.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <span className="mt-1 text-sm leading-snug text-ink-soft">{s.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <FieldError>{errors.severity}</FieldError>
            </fieldset>

            <div>
              <label htmlFor="r-desc" className="label">Conte o que a pessoa disse ou pediu</label>
              <textarea
                id="r-desc"
                rows={4}
                maxLength={MAX_DESC}
                placeholder="Ex.: Disse ser do meu banco, sabia meu CPF e pediu o código que chegou por SMS."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                aria-invalid={Boolean(errors.description)}
                className={`field resize-none leading-relaxed ${errors.description ? 'field-error' : ''}`}
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <FieldError>{errors.description}</FieldError>
                <span className="ml-auto shrink-0 text-sm text-ink-soft tabular-nums">{form.description.length}/{MAX_DESC}</span>
              </div>
              <p className="hint mt-1">Não escreva seus dados pessoais (CPF, senhas, endereço).</p>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="flex items-start gap-2 border-t border-danger/20 bg-danger-tint px-5 py-3 text-[15px] text-danger sm:px-6">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />
              {submitError}
            </p>
          )}
          <p className="border-t border-line px-5 pt-3 text-sm text-ink-soft sm:px-6">
            Ao enviar, você confirma que o relato é verdadeiro e não tem dados pessoais, conforme os{' '}
            <a href="#termos" onClick={onClose} className="font-semibold text-brand underline">Termos de uso</a>.
          </p>
          <footer className="flex flex-col-reverse gap-2 px-5 pt-3 pb-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} disabled={state === 'sending'} className="btn btn-secondary">Cancelar</button>
            <button type="submit" disabled={state === 'sending'} className="btn btn-primary">
              {state === 'sending' ? <LoaderCircle className="size-5 animate-spin" /> : <Flag className="size-5" />}
              {state === 'sending' ? 'Enviando…' : 'Enviar denúncia'}
            </button>
          </footer>
        </form>
      )}
    </Modal>
  )
}

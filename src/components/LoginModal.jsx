import { useEffect, useState } from 'react'
import { Smartphone, LoaderCircle, ShieldCheck, KeyRound, TriangleAlert, Info } from 'lucide-react'
import Modal, { FieldError } from './Modal'
import { useAuth } from '../hooks/useAuth'
import { formatAsTyped, formatPhone, isTelemarketingPrefix, isValidPhone, normalizePhone } from '../utils/phone'

const RESEND_SECONDS = 30

/**
 * Login OPCIONAL com o número do celular. O código chega por SMS e a pessoa
 * digita aqui. O aviso de segurança fica sempre visível: é o mesmo código que
 * golpistas tentam pegar por telefone.
 */
export default function LoginModal({ open, onClose, demoCode }) {
  const { sendCode, verifyCode } = useAuth()
  const [step, setStep] = useState('phone') // phone | code
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (!open) return
    setStep('phone')
    setCode('')
    setError('')
    setBusy(false)
  }, [open])

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const digits = normalizePhone(phone)

  const requestCode = async (e) => {
    e?.preventDefault()
    if (!isValidPhone(digits) || isTelemarketingPrefix(digits)) {
      setError('Digite seu celular com DDD, por exemplo (11) 98765-4321.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await sendCode(digits)
      setStep('code')
      setWait(RESEND_SECONDS)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('O código tem 6 números.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await verifyCode(digits, code)
      onClose(true)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => onClose(false)} busy={busy} icon={Smartphone} title="Entrar com seu número" subtitle="Opcional: o site funciona sem entrar" labelledBy="login-title">
      {step === 'phone' ? (
        <form onSubmit={requestCode} noValidate className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <ul className="space-y-2 text-[15px] text-ink">
            <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-safe" /> Suas denúncias ficam ligadas a você e aparecem em qualquer aparelho.</li>
            <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-safe" /> Seu número nunca aparece para outras pessoas.</li>
            <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-safe" /> Não pedimos nome, e-mail, CPF nem senha.</li>
          </ul>
          <div>
            <label htmlFor="login-phone" className="label">Seu celular</label>
            <input
              id="login-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => {
                setPhone(formatAsTyped(e.target.value))
                setError('')
              }}
              className={`field font-mono text-lg ${error ? 'field-error' : ''}`}
            />
            <FieldError>{error}</FieldError>
          </div>
          <button type="submit" disabled={busy || !phone} className="btn btn-primary w-full py-3">
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <KeyRound className="size-5" />}
            {busy ? 'Enviando…' : 'Receber código por SMS'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirm} noValidate className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-[15px] text-ink">
            Enviamos um código de 6 números para <span className="font-mono font-semibold">{formatPhone(digits)}</span>.{' '}
            <button type="button" onClick={() => setStep('phone')} className="font-semibold text-brand underline-offset-2 hover:underline">
              Trocar número
            </button>
          </p>

          {/* O aviso mais importante da tela */}
          <div className="flex gap-3 rounded-xl border border-warn/30 bg-warn-tint p-4 text-[15px] text-ink">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" />
            <p>
              <b>Digite o código só aqui no site.</b> Ninguém do Alerta Golpe vai pedir esse código por ligação, SMS ou WhatsApp. Se alguém pedir, é golpe.
            </p>
          </div>

          {demoCode && (
            <p className="flex gap-2 rounded-xl bg-brand-tint p-3 text-sm text-ink">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                Modo demonstração: nenhum SMS é enviado. Use o código <b className="font-mono">{demoCode}</b>.
              </span>
            </p>
          )}

          <div>
            <label htmlFor="login-code" className="label">Código recebido</label>
            <input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              className={`field text-center font-mono text-3xl tracking-[0.4em] ${error ? 'field-error' : ''}`}
            />
            <FieldError>{error}</FieldError>
          </div>

          <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary w-full py-3">
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
            {busy ? 'Confirmando…' : 'Entrar'}
          </button>
          <button type="button" onClick={requestCode} disabled={wait > 0 || busy} className="btn btn-ghost w-full">
            {wait > 0 ? `Reenviar código em ${wait} s` : 'Reenviar código'}
          </button>
        </form>
      )}
    </Modal>
  )
}

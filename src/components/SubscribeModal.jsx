import { useState } from 'react'
import { CircleCheck, FlaskConical, Info, Minus, Plus } from 'lucide-react'
import Modal from './Modal'
import { PLAN_BY_ID, brl } from '../data/plans'

function Choice({ name, options, value, onChange }) {
  return (
    <div className={`grid gap-2 ${options.length > 2 ? 'sm:grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((o) => (
        <label key={o.id} className="cursor-pointer">
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="peer sr-only" />
          <span className="flex h-full flex-col rounded-xl border border-line p-3 transition peer-checked:border-brand peer-checked:bg-brand-tint peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
            <span className="font-semibold text-ink">{o.label}</span>
            <span className="text-sm text-ink-soft">{o.price}</span>
          </span>
        </label>
      ))}
    </div>
  )
}

/**
 * "Assinatura" de demonstração: só registra no aparelho qual plano a pessoa escolheu.
 * Não tem campo de cartão, CPF, e-mail nem nenhum outro dado, e nada é cobrado.
 */
export default function SubscribeModal({ planId, onClose, onActivate }) {
  const plan = PLAN_BY_ID[planId]
  const [billing, setBilling] = useState('mensal')
  const [schoolType, setSchoolType] = useState('particular')
  const [people, setPeople] = useState(plan?.minPeople ?? 20)
  const [tier, setTier] = useState('ate-100mil')
  const [done, setDone] = useState(false)

  if (!plan) return null

  const min = plan.minPeople ?? 1
  const clamp = (v) => Math.min(5000, Math.max(min, Math.round(Number(v) || min)))
  const n = clamp(people)

  let summary
  if (plan.monthly) {
    summary = billing === 'anual' ? `Anual, ${brl(plan.yearly)} por ano` : `Mensal, ${brl(plan.monthly)} por mês`
  } else if (plan.id === 'escolas') {
    summary = schoolType === 'publica' ? `Escola pública, ${brl(plan.yearlyPublic)} por ano` : `Escola particular, ${brl(plan.yearlyPrivate)} por ano`
  } else if (plan.id === 'empresas') {
    summary = `${n} pessoas, ${brl(n * plan.perPerson)} por mês`
  } else {
    const t = plan.tiers.find((x) => x.id === tier)
    summary = t.monthly ? `${t.label}, ${brl(t.monthly)} por mês` : `${t.label}, valor sob consulta`
  }

  const activate = () => {
    onActivate({ plan: plan.id, summary, people: plan.id === 'empresas' ? n : null, at: Date.now() })
    setDone(true)
  }

  return (
    <Modal open onClose={onClose} icon={FlaskConical} title={`Plano ${plan.name}`} subtitle="Assinatura de demonstração" labelledBy="subscribe-title">
      {done ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <CircleCheck className="size-14 text-safe" strokeWidth={1.8} />
          <h3 className="mt-4 text-2xl font-bold text-ink">Plano ativado na simulação</h3>
          <p className="mt-2 max-w-sm text-ink-soft">
            {summary}. Nenhuma cobrança foi feita e nenhum dado foi pedido. Você pode encerrar a simulação em Minha área.
          </p>
          <button type="button" onClick={onClose} className="btn btn-primary mt-7">Fechar</button>
        </div>
      ) : (
        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="flex gap-3 rounded-xl border border-brand/20 bg-brand-tint p-4 text-[15px] text-ink">
            <Info className="mt-0.5 size-5 shrink-0 text-brand" />
            <span>
              <b>Isto é uma simulação.</b> Não existe pagamento de verdade: não pedimos cartão, Pix, CPF nem nenhum outro dado. Serve só para mostrar como os planos funcionariam.
            </span>
          </p>

          {plan.monthly && (
            <fieldset>
              <legend className="label">Como prefere pagar?</legend>
              <Choice
                name="billing"
                value={billing}
                onChange={setBilling}
                options={[
                  { id: 'mensal', label: 'Mensal', price: `${brl(plan.monthly)} por mês` },
                  { id: 'anual', label: 'Anual', price: `${brl(plan.yearly)} por ano` },
                ]}
              />
            </fieldset>
          )}

          {plan.id === 'escolas' && (
            <fieldset>
              <legend className="label">Tipo de escola</legend>
              <Choice
                name="school"
                value={schoolType}
                onChange={setSchoolType}
                options={[
                  { id: 'particular', label: 'Particular', price: `${brl(plan.yearlyPrivate)} por ano` },
                  { id: 'publica', label: 'Pública', price: `${brl(plan.yearlyPublic)} por ano` },
                ]}
              />
            </fieldset>
          )}

          {plan.id === 'empresas' && (
            <div>
              <label htmlFor="people" className="label">Quantas pessoas vão usar?</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPeople((p) => clamp(Number(p) - 5))} className="btn btn-secondary px-3" aria-label="Menos 5 pessoas">
                  <Minus className="size-5" />
                </button>
                <input id="people" type="number" inputMode="numeric" min={min} max={5000} value={people} onChange={(e) => setPeople(e.target.value)} onBlur={(e) => setPeople(clamp(e.target.value))} className="field w-28 text-center text-lg tabular-nums" />
                <button type="button" onClick={() => setPeople((p) => clamp(Number(p) + 5))} className="btn btn-secondary px-3" aria-label="Mais 5 pessoas">
                  <Plus className="size-5" />
                </button>
              </div>
              <p className="hint mt-1.5">Mínimo de {min} pessoas. {brl(plan.perPerson)} por pessoa por mês.</p>
            </div>
          )}

          {plan.tiers && (
            <fieldset>
              <legend className="label">Quantos clientes a empresa tem?</legend>
              <Choice
                name="tier"
                value={tier}
                onChange={setTier}
                options={plan.tiers.map((t) => ({ id: t.id, label: t.label, price: t.monthly ? `${brl(t.monthly)} por mês` : 'Sob consulta' }))}
              />
            </fieldset>
          )}

          <div className="rounded-xl bg-paper p-4">
            <p className="text-sm text-ink-soft">Resumo</p>
            <p className="text-lg font-bold text-ink">{summary}</p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">Voltar</button>
            <button type="button" onClick={activate} className="btn btn-primary">
              <FlaskConical className="size-5" /> Ativar na simulação
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

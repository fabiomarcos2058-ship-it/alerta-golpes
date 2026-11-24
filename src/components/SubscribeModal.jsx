import { useEffect, useState } from 'react'
import { CircleCheck, FlaskConical, Info, Minus, Plus } from 'lucide-react'
import Modal from './Modal'
import { MIN_PEOPLE, PLAN_BY_ID, PRICE_PER_PERSON, SCHOOL_PRIVATE_YEAR, brl } from '../data/plans'

/**
 * "Assinatura" de demonstração: só registra no aparelho qual plano a pessoa escolheu.
 * Não tem campo de cartão, CPF, e-mail nem nenhum outro dado, e nada é cobrado.
 */
export default function SubscribeModal({ planId, onClose, onActivate }) {
  const plan = planId && PLAN_BY_ID[planId]
  const [schoolType, setSchoolType] = useState('publica')
  const [people, setPeople] = useState(25)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(false)
    setSchoolType('publica')
    setPeople(25)
  }, [planId])

  if (!plan) return null

  const clamp = (n) => Math.min(5000, Math.max(MIN_PEOPLE, Math.round(Number(n) || MIN_PEOPLE)))
  const n = clamp(people)
  const summary =
    plan.id === 'empresas'
      ? `${n} pessoas, ${brl(n * PRICE_PER_PERSON)} por mês`
      : plan.id === 'escolas'
        ? schoolType === 'publica'
          ? 'Escola pública, grátis'
          : `Escola particular, ${brl(SCHOOL_PRIVATE_YEAR)} por ano`
        : 'Grátis'

  const activate = () => {
    setPeople(n)
    onActivate({ plan: plan.id, summary, people: plan.id === 'empresas' ? n : null, schoolType: plan.id === 'escolas' ? schoolType : null, at: Date.now() })
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

          {plan.id === 'escolas' && (
            <fieldset>
              <legend className="label">Tipo de escola</legend>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'publica', label: 'Pública', price: 'Grátis' },
                  { id: 'particular', label: 'Particular', price: `${brl(SCHOOL_PRIVATE_YEAR)} por ano` },
                ].map((o) => (
                  <label key={o.id} className="cursor-pointer">
                    <input type="radio" name="school" value={o.id} checked={schoolType === o.id} onChange={() => setSchoolType(o.id)} className="peer sr-only" />
                    <span className="flex flex-col rounded-xl border border-line p-3 transition peer-checked:border-brand peer-checked:bg-brand-tint peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                      <span className="font-semibold text-ink">{o.label}</span>
                      <span className="text-sm text-ink-soft">{o.price}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {plan.id === 'empresas' && (
            <div>
              <label htmlFor="people" className="label">Quantas pessoas vão usar?</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPeople((p) => clamp(p - 5))} className="btn btn-secondary px-3" aria-label="Menos 5 pessoas">
                  <Minus className="size-5" />
                </button>
                <input id="people" type="number" inputMode="numeric" min={MIN_PEOPLE} max={5000} value={people} onChange={(e) => setPeople(e.target.value)} onBlur={(e) => setPeople(clamp(e.target.value))} className="field w-28 text-center text-lg tabular-nums" />
                <button type="button" onClick={() => setPeople((p) => clamp(Number(p) + 5))} className="btn btn-secondary px-3" aria-label="Mais 5 pessoas">
                  <Plus className="size-5" />
                </button>
              </div>
              <p className="hint mt-1.5">Mínimo de {MIN_PEOPLE} pessoas. {brl(PRICE_PER_PERSON)} por pessoa por mês.</p>
            </div>
          )}

          <div className="rounded-xl bg-paper p-4">
            <p className="text-sm text-ink-soft">Resumo</p>
            <p className="text-lg font-bold text-ink">{summary}</p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">Voltar</button>
            <button
              type="button"
              onClick={activate}
              className="btn btn-primary"
            >
              <FlaskConical className="size-5" /> Ativar na simulação
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

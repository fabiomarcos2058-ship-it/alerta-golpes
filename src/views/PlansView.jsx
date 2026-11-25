import { useState } from 'react'
import { Check, Minus, CircleCheck, Info, Sparkles, Clock } from 'lucide-react'
import { FEATURES, FREE_LIMITS, GROUPS, PLANS, TRIAL_DAYS, TRIAL_PLAN, PLAN_BY_ID } from '../data/plans'

function Value({ value }) {
  if (value === true)
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-safe">
        <Check className="size-5" /> Sim
      </span>
    )
  if (value === false)
    return (
      <span className="inline-flex items-center gap-1.5 text-ink-soft">
        <Minus className="size-5" /> Não
      </span>
    )
  return <span className="text-ink">{value}</span>
}

function PlanCard({ p, planInfo, onChoose, onTrial }) {
  const { plan: current, isTrial, canTrial } = planInfo
  const Icon = p.icon
  const active = current?.plan === p.id || (!current && p.id === 'gratuito')
  return (
    <li className={`relative flex flex-col rounded-2xl border bg-white p-6 ${active ? 'border-brand ring-2 ring-brand/15' : p.popular ? 'border-brand/40' : 'border-line'}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-tint text-brand">
          <Icon className="size-5" />
        </span>
        {active ? (
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">{isTrial ? 'Em teste' : 'Seu plano'}</span>
        ) : (
          p.popular && <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand">Mais escolhido</span>
        )}
      </div>
      <h3 className="mt-4 text-xl font-bold text-ink">{p.name}</h3>
      <p className="text-ink-soft">{p.audience}</p>
      <p className="mt-4">
        {p.id === 'bancos' && <span className="text-ink-soft">a partir de </span>}
        <span className="text-4xl font-extrabold tracking-tight text-ink">{p.price}</span>{' '}
        <span className="text-ink-soft">{p.period}</span>
      </p>
      <p className="mt-1 min-h-6 text-sm text-ink-soft">{p.priceNote}</p>
      <p className="mt-3 text-ink">{p.pitch}</p>
      <ul className="mt-4 flex-1 space-y-2">
        {p.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-[15px] text-ink">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-safe" /> {h}
          </li>
        ))}
      </ul>
      {p.id === 'gratuito' ? (
        <button type="button" disabled={!current} onClick={() => onChoose('gratuito')} className="btn btn-secondary mt-6">
          {current ? (isTrial ? 'Encerrar teste e voltar' : 'Voltar para o Gratuito') : 'Você já usa este plano'}
        </button>
      ) : (
        <div className="mt-6 grid gap-2">
          <button type="button" onClick={() => onChoose(p.id)} className={`btn ${active && !isTrial ? 'btn-secondary' : 'btn-primary'}`}>
            {active && !isTrial ? 'Alterar simulação' : p.id === 'bancos' ? 'Contratar (simulação)' : `Assinar ${p.name} (simulação)`}
          </button>
          {canTrial && p.id !== 'bancos' && (
            <button type="button" onClick={() => onTrial(p.id)} className="btn btn-secondary">
              <Sparkles className="size-5" /> Testar grátis por {TRIAL_DAYS} dias
            </button>
          )}
        </div>
      )}
    </li>
  )
}

export default function PlansView({ planInfo, onChoose, onTrial }) {
  const { plan: current, planName, isTrial, daysLeft, canTrial } = planInfo
  const currentGroup = current ? PLAN_BY_ID[current.plan]?.group : null
  const [group, setGroup] = useState(currentGroup ?? 'pessoas')
  const plans = PLANS.filter((p) => p.group === group)
  const features = FEATURES[group]

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Planos</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Consultar e denunciar números é grátis e sempre vai ser. Os planos pagos dão treino completo, avisos e proteção para a família, a escola ou a empresa.
        </p>
        {isTrial && (
          <p className="mt-4 flex max-w-2xl items-center gap-3 rounded-xl border border-brand bg-white p-4 text-ink">
            <Clock className="size-6 shrink-0 text-brand" />
            <span>
              <b>Seu teste grátis do plano {planName} termina em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.</b> Depois você volta sozinho para o Gratuito, sem cobrança.
            </span>
          </p>
        )}
        {canTrial && (
          <div className="mt-4 flex max-w-2xl flex-col gap-3 rounded-2xl bg-brand p-5 text-white sm:flex-row sm:items-center">
            <Sparkles className="size-8 shrink-0" />
            <div className="flex-1">
              <p className="text-lg font-bold">Teste o Plus grátis por {TRIAL_DAYS} dias</p>
              <p className="text-white/85">Golpes extras, relatório do treino e avisos da sua lista. Nada é cobrado e não pedimos cadastro.</p>
            </div>
            <button type="button" onClick={() => onTrial(TRIAL_PLAN)} className="btn shrink-0 bg-white text-brand hover:bg-brand-tint">
              Começar teste grátis
            </button>
          </div>
        )}
        <p className="mt-4 flex max-w-2xl gap-3 rounded-xl border border-brand/20 bg-brand-tint p-4 text-[15px] text-ink">
          <Info className="mt-0.5 size-5 shrink-0 text-brand" />
          <span>
            <b>Demonstração:</b> nenhuma compra é real e nenhum dado é pedido. Ao assinar, o plano só fica marcado neste aparelho para mostrar como funcionaria.
          </span>
        </p>
      </section>

      <section aria-label="Escolha o tipo de plano">
        <div role="tablist" aria-label="Tipo de plano" className="inline-flex w-full rounded-2xl border border-line bg-white p-1 sm:w-auto">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={group === g.id}
              onClick={() => setGroup(g.id)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition sm:flex-none ${group === g.id ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink'}`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} p={p} planInfo={planInfo} onChoose={onChoose} onTrial={onTrial} />
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-ink">O que o plano gratuito não tem</h2>
        <p className="mt-1 text-ink-soft">Nada disso impede você de consultar e denunciar. Faz diferença para quem quer treinar mais ou cuidar de outras pessoas.</p>
        <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {FREE_LIMITS.map((l) => (
            <li key={l} className="flex gap-2 text-ink">
              <Minus className="mt-0.5 size-5 shrink-0 text-ink-soft" /> {l}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Comparação: {GROUPS.find((g) => g.id === group).label.toLowerCase()}</h2>

        {/* Computador: tabela */}
        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-paper">
              <tr>
                <th scope="col" className="w-[34%] px-5 py-3 font-semibold text-ink">Recurso</th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className="px-5 py-3 font-semibold text-ink">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {features.map((f) => (
                <tr key={f.label}>
                  <th scope="row" className="px-5 py-3 font-normal text-ink">{f.label}</th>
                  {plans.map((p) => (
                    <td key={p.id} className="px-5 py-3"><Value value={f.values[p.id]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Celular: um recurso por bloco */}
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white md:hidden">
          {features.map((f) => (
            <li key={f.label} className="px-4 py-3">
              <p className="font-semibold text-ink">{f.label}</p>
              <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px]">
                {plans.map((p) => (
                  <div key={p.id} className="contents">
                    <dt className="text-ink-soft">{p.name}</dt>
                    <dd><Value value={f.values[p.id]} /></dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">Os valores são uma proposta, a validar com pessoas, escolas e empresas.</p>
      </section>
    </div>
  )
}

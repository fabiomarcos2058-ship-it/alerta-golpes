import { ShieldCheck, ShieldAlert, ShieldX, Shield, Phone, Award, Lock, Sparkles } from 'lucide-react'
import { FREE_SCENARIOS, PREMIUM_SCENARIOS } from '../data/scamScenarios'
import UpgradePrompt from '../components/UpgradePrompt'

const RESULT = {
  safe: { icon: ShieldCheck, text: 'Você se protegeu', ring: 'bg-safe-tint text-safe' },
  partial: { icon: ShieldAlert, text: 'Parou a tempo. Tente de novo', ring: 'bg-warn-tint text-warn' },
  scammed: { icon: ShieldX, text: 'Caiu no golpe. Tente de novo', ring: 'bg-danger-tint text-danger' },
}

function ScenarioCard({ sc, training, onStart, locked }) {
  const Icon = sc.icon
  const res = !locked && training[sc.id] && RESULT[training[sc.id]]
  return (
    <li className={`flex flex-col rounded-2xl border bg-white p-5 ${locked ? 'border-dashed border-line' : 'border-line'}`}>
      <div className="flex items-start gap-4">
        <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${sc.premium ? 'bg-brand-tint text-brand' : 'bg-paper text-ink'}`}>
          <Icon className="size-6" />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-ink">{sc.title}</h3>
          <p className="mt-1 text-ink-soft">{sc.summary}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        {locked ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <Lock className="size-4" /> Plano pago
          </span>
        ) : res ? (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${res.ring}`}>
            <res.icon className="size-4" /> {res.text}
          </span>
        ) : (
          <span className="text-sm text-ink-soft">Ainda não treinou</span>
        )}
        {!locked && (
          <button type="button" onClick={() => onStart(sc.id)} className="btn btn-primary">
            <Phone className="size-5" /> {res ? 'Treinar de novo' : 'Atender ligação'}
          </button>
        )}
      </div>
    </li>
  )
}

export default function SimulatorView({ training, onStart, access }) {
  const { isPremium, canTrial, onTrial, onPlans } = access
  const done = FREE_SCENARIOS.filter((s) => training[s.id] === 'safe').length
  const all = done === FREE_SCENARIOS.length

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Simulador de golpe</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Você recebe uma ligação de golpe de mentira, ouve o golpista e escolhe o que responder. No final, vê o que fez certo, o que fez errado e por quê.
        </p>
        <p className="mt-2 text-[15px] text-ink-soft">Tudo é fictício: nenhuma ligação de verdade é feita e nenhum dado é pedido.</p>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6" aria-label="Seu progresso">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-ink">
              {all ? 'Escudo completo!' : `Você se protegeu em ${done} de ${FREE_SCENARIOS.length} golpes`}
            </p>
            <p className="text-ink-soft">
              {all ? 'Você reconheceu os golpes principais. Que tal mandar o simulador para a sua família?' : 'Complete os quatro golpes principais para ganhar o escudo completo.'}
            </p>
          </div>
          <div className="flex gap-2" aria-hidden="true">
            {FREE_SCENARIOS.map((s) => (training[s.id] === 'safe' ? <ShieldCheck key={s.id} className="size-9 text-safe" /> : <Shield key={s.id} className="size-9 text-line" />))}
            {all && <Award className="size-9 text-amber-500" />}
          </div>
        </div>
      </section>

      <section aria-labelledby="principais">
        <h2 id="principais" className="text-xl font-bold text-ink">Os 4 golpes principais</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {FREE_SCENARIOS.map((sc) => (
            <ScenarioCard key={sc.id} sc={sc} training={training} onStart={onStart} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="extras">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id="extras" className="text-xl font-bold text-ink">Golpes extras</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-0.5 text-sm font-semibold text-brand">
            <Sparkles className="size-4" /> {isPremium ? 'Liberados no seu plano' : 'Planos pagos'}
          </span>
        </div>
        <p className="mt-1 text-ink-soft">Golpes que chegam a quem procura emprego e a quem cuida dos pagamentos de uma empresa.</p>
        {!isPremium && (
          <UpgradePrompt
            className="mt-4"
            title="Libere os golpes extras"
            text={canTrial ? 'Teste um plano pago por 7 dias, sem pagar nada e sem cadastro.' : 'Os golpes extras fazem parte dos planos Escolas e Empresas.'}
            canTrial={canTrial}
            onTrial={onTrial}
            onPlans={onPlans}
          />
        )}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {PREMIUM_SCENARIOS.map((sc) => (
            <ScenarioCard key={sc.id} sc={sc} training={training} onStart={onStart} locked={!isPremium} />
          ))}
        </ul>
      </section>
    </div>
  )
}

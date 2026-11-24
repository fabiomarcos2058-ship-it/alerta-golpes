import { ShieldCheck, ShieldAlert, ShieldX, Shield, Phone, Award } from 'lucide-react'
import { SCENARIOS } from '../data/scamScenarios'

const RESULT = {
  safe: { icon: ShieldCheck, text: 'Você se protegeu', cls: 'text-safe', ring: 'bg-safe-tint text-safe' },
  partial: { icon: ShieldAlert, text: 'Parou a tempo. Tente de novo', cls: 'text-warn', ring: 'bg-warn-tint text-warn' },
  scammed: { icon: ShieldX, text: 'Caiu no golpe. Tente de novo', cls: 'text-danger', ring: 'bg-danger-tint text-danger' },
}

export default function SimulatorView({ training, onStart }) {
  const done = SCENARIOS.filter((s) => training[s.id] === 'safe').length
  const all = done === SCENARIOS.length

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
              {all ? 'Escudo completo!' : `Você se protegeu em ${done} de ${SCENARIOS.length} golpes`}
            </p>
            <p className="text-ink-soft">
              {all ? 'Você reconheceu todos os golpes. Que tal mandar o simulador para a sua família?' : 'Complete os quatro para ganhar o escudo completo.'}
            </p>
          </div>
          <div className="flex gap-2" aria-hidden="true">
            {SCENARIOS.map((s) => (training[s.id] === 'safe' ? <ShieldCheck key={s.id} className="size-9 text-safe" /> : <Shield key={s.id} className="size-9 text-line" />))}
            {all && <Award className="size-9 text-amber-500" />}
          </div>
        </div>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon
          const res = training[sc.id] && RESULT[training[sc.id]]
          return (
            <li key={sc.id} className="flex flex-col rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                  <Icon className="size-6" />
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-ink">{sc.title}</h2>
                  <p className="mt-1 text-ink-soft">{sc.summary}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                {res ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${res.ring}`}>
                    <res.icon className="size-4" /> {res.text}
                  </span>
                ) : (
                  <span className="text-sm text-ink-soft">Ainda não treinou</span>
                )}
                <button type="button" onClick={() => onStart(sc.id)} className="btn btn-primary">
                  <Phone className="size-5" /> {res ? 'Treinar de novo' : 'Atender ligação'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

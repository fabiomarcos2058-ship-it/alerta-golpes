import { useEffect, useState } from 'react'
import { LogIn, LogOut, Bookmark, Trash2, Search, Flag, ShieldCheck, Shield, MessageSquareHeart, Smartphone, Layers, Sparkles, Clock, CircleHelp, HandHeart } from 'lucide-react'
import { LIST_LIMIT, TRIAL_DAYS } from '../data/plans'
import UpgradePrompt from '../components/UpgradePrompt'
import { reportStage, helpedBy } from '../lib/notifications'
import StatusBadge from '../components/StatusBadge'
import { CATEGORY_BY_ID } from '../data/constants'
import { SCENARIOS, FREE_SCENARIOS } from '../data/scamScenarios'
import { formatPhone, timeAgo } from '../utils/phone'

const STAGE = {
  received: { text: 'Recebida', cls: 'bg-paper text-ink-soft' },
  confirmed: { text: 'Confirmada por outras pessoas', cls: 'bg-warn-tint text-warn' },
  blocked: { text: 'Número bloqueado', cls: 'bg-safe-tint text-safe' },
  removed: { text: 'Denúncia apagada', cls: 'bg-paper text-ink-soft line-through decoration-1' },
  expired: { text: 'Alerta arquivado', cls: 'bg-paper text-ink-soft' },
}

const OUTCOME = { safe: 'Se protegeu', partial: 'Parou a tempo', scammed: 'Caiu no golpe' }
const OUTCOME_CLS = { safe: 'text-safe', partial: 'text-warn', scammed: 'text-danger' }

// Turma de exemplo do painel (nomes fictícios, só para mostrar como funciona)
const SAMPLE_FAMILY = [
  { name: 'Mãe', done: 4, last: 'safe' },
  { name: 'Pai', done: 2, last: 'scammed' },
  { name: 'Vó Lúcia', done: 1, last: 'partial' },
  { name: 'Júlia', done: 4, last: 'safe' },
  { name: 'Pedro', done: 0, last: null },
]
const SAMPLE_GROUP = [
  { name: 'Ana', done: 4, last: 'safe' },
  { name: 'Bruno', done: 3, last: 'partial' },
  { name: 'Carla', done: 4, last: 'safe' },
  { name: 'Diego', done: 1, last: 'scammed' },
  { name: 'Elisa', done: 2, last: 'safe' },
  { name: 'Felipe', done: 0, last: null },
]

function Section({ title, description, children, action, badge }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold text-ink">
            {title}
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-0.5 text-sm font-semibold text-brand">
                <Sparkles className="size-4" /> {badge}
              </span>
            )}
          </h2>
          {description && <p className="mt-0.5 text-ink-soft">{description}</p>}
        </div>
        {action}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}

function TrainingReport({ attempts }) {
  if (attempts.length === 0) return <p className="text-ink-soft">Faça um treino no simulador para ver seu relatório aqui.</p>
  const safe = attempts.filter((a) => a.outcome === 'safe').length
  const rate = Math.round((safe / attempts.length) * 100)
  const byScenario = SCENARIOS.map((sc) => {
    const list = attempts.filter((a) => a.id === sc.id)
    return { sc, count: list.length, last: list[list.length - 1]?.outcome }
  }).filter((r) => r.count > 0)
  const hardest = [...byScenario].sort((a, b) => attempts.filter((x) => x.id === b.sc.id && x.outcome !== 'safe').length - attempts.filter((x) => x.id === a.sc.id && x.outcome !== 'safe').length)[0]
  const hardestMisses = attempts.filter((x) => x.id === hardest.sc.id && x.outcome !== 'safe').length
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-paper p-4">
          <dt className="text-sm text-ink-soft">Treinos feitos</dt>
          <dd className="text-3xl font-extrabold text-ink">{attempts.length}</dd>
        </div>
        <div className="rounded-xl bg-paper p-4">
          <dt className="text-sm text-ink-soft">Vezes que se protegeu</dt>
          <dd className="text-3xl font-extrabold text-safe">{rate}%</dd>
        </div>
        <div className="col-span-2 rounded-xl bg-paper p-4 sm:col-span-1">
          <dt className="text-sm text-ink-soft">Golpe que mais enganou você</dt>
          <dd className="mt-1 font-bold text-ink">{hardestMisses ? hardest.sc.title : 'Nenhum até agora'}</dd>
        </div>
      </dl>
      <ul className="divide-y divide-line">
        {byScenario.map(({ sc, count, last }) => (
          <li key={sc.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <span className="text-ink">{sc.title}</span>
            <span className="text-[15px] text-ink-soft">
              {count} {count === 1 ? 'treino' : 'treinos'}, último: <b className={OUTCOME_CLS[last]}>{OUTCOME[last]}</b>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GroupPanel({ panel }) {
  return (
    <div>
      <p className="mb-3 rounded-lg bg-warn-tint px-3 py-2 text-[15px] text-warn">Exemplo com nomes fictícios. No plano de verdade, aparecem as pessoas da sua {panel}.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-[15px]">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th scope="col" className="py-2 font-semibold">Pessoa</th>
              <th scope="col" className="py-2 font-semibold">Golpes treinados</th>
              <th scope="col" className="py-2 font-semibold">Último resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(panel === 'família' ? SAMPLE_FAMILY : SAMPLE_GROUP).map((p) => (
              <tr key={p.name}>
                <th scope="row" className="py-2.5 font-normal text-ink">{p.name}</th>
                <td className="py-2.5 text-ink">{p.done} de {FREE_SCENARIOS.length}</td>
                <td className={`py-2.5 font-semibold ${p.last ? OUTCOME_CLS[p.last] : 'text-ink-soft'}`}>{p.last ? OUTCOME[p.last] : 'Ainda não começou'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AccountView({ user, onLogin, onLogout, watchlist, onRemove, onCheck, loadMyReports, training, attempts, onReport, onFeedback, go, isDemo, planInfo, onEndPlan, onTrial, notifications, onTutorial }) {
  const { plan, planName, isPremium, isTrial, daysLeft, canTrial, panel } = planInfo
  const upgrade = { canTrial, onTrial: () => onTrial(), onPlans: () => go('planos') }
  const [mine, setMine] = useState(null)

  useEffect(() => {
    let alive = true
    loadMyReports()
      .then((rows) => alive && setMine(rows))
      .catch(() => alive && setMine([]))
    return () => {
      alive = false
    }
  }, [loadMyReports, user])

  const myScenarios = isPremium ? SCENARIOS : FREE_SCENARIOS
  const done = myScenarios.filter((s) => training[s.id] === 'safe').length

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Minha área</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">Seus números salvos, suas denúncias e seu treino contra golpes.</p>
      </section>

      {user ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-safe/25 bg-safe-tint p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-8 text-safe" />
            <div>
              <p className="font-bold text-ink">Você entrou com seu número</p>
              <p className="font-mono text-ink-soft">{formatPhone(user.phone)}</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="btn btn-secondary">
            <LogOut className="size-5" /> Sair
          </button>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
            <Smartphone className="size-6" />
          </span>
          <div className="flex-1">
            <p className="text-lg font-bold text-ink">Entrar é opcional</p>
            <p className="text-ink-soft">
              Tudo funciona sem cadastro. Se entrar com seu celular, suas denúncias aparecem em qualquer aparelho.
            </p>
          </div>
          <button type="button" onClick={onLogin} className="btn btn-primary shrink-0">
            <LogIn className="size-5" /> Entrar com meu número
          </button>
        </section>
      )}

      <section className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:p-6 ${isPremium ? 'border-brand/30 bg-brand-tint' : 'border-line bg-white'}`}>
        <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${isPremium ? 'bg-white text-brand' : 'bg-brand-tint text-brand'}`}>
          {isTrial ? <Clock className="size-6" /> : <Layers className="size-6" />}
        </span>
        <div className="flex-1">
          <p className="text-lg font-bold text-ink">
            {isTrial ? `Teste grátis do plano ${planName}` : `Plano ${planName}`}
            {isPremium && !isTrial && ' (simulação)'}
          </p>
          <p className="text-ink-soft">
            {isTrial
              ? `Faltam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}. Depois, você volta sozinho para o Gratuito, sem cobrança.`
              : isPremium
                ? `${plan.summary}. Nenhuma cobrança é feita.`
                : canTrial
                  ? `Teste os recursos pagos por ${TRIAL_DAYS} dias, sem pagar e sem cadastro.`
                  : 'Tudo o que protege você, sem anúncios.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPremium && (
            <button type="button" onClick={onEndPlan} className="btn btn-ghost">{isTrial ? 'Encerrar teste' : 'Encerrar simulação'}</button>
          )}
          {canTrial && (
            <button type="button" onClick={() => onTrial()} className="btn btn-primary">
              <Sparkles className="size-5" /> Testar grátis
            </button>
          )}
          <button type="button" onClick={() => go('planos')} className="btn btn-secondary">
            Ver planos
          </button>
        </div>
      </section>

      <Section title="Minha lista" description={
          isPremium
            ? 'Números que você salvou para acompanhar. Ficam guardados neste aparelho.'
            : `Números que você salvou para acompanhar (${watchlist.length} de ${LIST_LIMIT} no plano Gratuito).`
        }
      >
        {watchlist.length === 0 ? (
          <p className="flex items-center gap-2 text-ink-soft">
            <Bookmark className="size-5" /> Consulte um número e toque em “Salvar na minha lista”.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {watchlist.map((item) => (
              <li key={item.phone} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-mono text-lg text-ink">{formatPhone(item.phone)}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
                    <StatusBadge status={item.status} /> salvo {timeAgo(item.savedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => onCheck(item.phone)} className="btn btn-secondary px-3">
                    <Search className="size-4" /> Consultar
                  </button>
                  <button type="button" onClick={() => onRemove(item.phone)} className="btn btn-ghost px-3" aria-label={`Remover ${formatPhone(item.phone)} da lista`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Minhas denúncias"
        description={user || isDemo ? 'Denúncias que você enviou.' : 'Denúncias enviadas deste aparelho. Entre com seu número para ver em qualquer aparelho.'}
        action={
          <button type="button" onClick={() => onReport()} className="btn btn-secondary">
            <Flag className="size-4 text-danger" /> Nova denúncia
          </button>
        }
      >
        {mine === null ? (
          <p className="text-ink-soft">Carregando…</p>
        ) : mine.length === 0 ? (
          <p className="text-ink-soft">Você ainda não denunciou nenhum número.</p>
        ) : (
          <>
          <p className="mb-3 flex items-center gap-3 rounded-xl bg-safe-tint p-4 text-ink">
            <HandHeart className="size-7 shrink-0 text-safe" />
            <span>
              Suas denúncias já ajudaram cerca de <b>{mine.reduce((sum, r) => sum + helpedBy(r.phone), 0)} pessoas</b> a não atender um golpe.
              <span className="block text-sm text-ink-soft">Estimativa da demonstração.</span>
            </span>
          </p>
          <ul className="divide-y divide-line">
            {mine.map((r) => {
              const stage = STAGE[reportStage(r.phone, notifications)]
              return (
              <li key={r.id} className="py-3">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-ink">{formatPhone(r.phone)}</span>
                  <span className="text-sm text-ink-soft">{timeAgo(r.createdAt)}</span>
                </p>
                <p className="mt-1">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold ${stage.cls}`}>{stage.text}</span>
                </p>
                <p className="text-sm text-ink-soft">{CATEGORY_BY_ID[r.category]?.label}</p>
                {r.description && <p className="mt-1 text-[15px] text-ink">“{r.description}”</p>}
              </li>
              )
            })}
          </ul>
          </>
        )}
      </Section>

      <Section
        title="Meu treino"
        description={`Você se protegeu em ${done} de ${myScenarios.length} golpes do simulador.`}
        action={
          <button type="button" onClick={() => go('simulador')} className="btn btn-secondary">
            Ir para o simulador
          </button>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {myScenarios.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-ink">
              {training[s.id] === 'safe' ? <ShieldCheck className="size-5 text-safe" /> : <Shield className="size-5 text-line" />}
              {s.title}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Meu relatório" badge="Plano pago" description="Como você foi em cada treino do simulador.">
        {isPremium ? (
          <TrainingReport attempts={attempts} />
        ) : (
          <UpgradePrompt title="Veja seu relatório de treino" text="Quantas vezes você treinou, quanto se protegeu e qual golpe mais enganou você." {...upgrade} />
        )}
      </Section>

      <Section
        title={panel ? `Painel da ${panel}` : 'Painel da família, turma ou equipe'}
        badge={panel ? null : 'Família, Escolas e Empresas'}
        description={panel ? `Acompanhe o treino de cada pessoa da sua ${panel}.` : 'Para acompanhar o treino de várias pessoas num lugar só.'}
      >
        {panel ? (
          <GroupPanel panel={panel} />
        ) : (
          <UpgradePrompt
            title="Proteja mais pessoas"
            text={isPremium ? 'Seu plano protege só você. O painel faz parte dos planos Família, Escolas e Empresas.' : 'Veja quem já treinou e quem precisa de ajuda, num painel só.'}
            {...upgrade}
            onTrial={() => onTrial('familia')}
          />
        )}
      </Section>

      <Section title="Ajuda e opinião" description="Reveja o tutorial ou conte para a gente o que achou.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onTutorial} className="btn btn-secondary">
            <CircleHelp className="size-5" /> Ver o tutorial
          </button>
          <button type="button" onClick={onFeedback} className="btn btn-secondary">
            <MessageSquareHeart className="size-5" /> Enviar feedback
          </button>
        </div>
      </Section>
    </div>
  )
}

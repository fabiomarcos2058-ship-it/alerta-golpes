import { useEffect, useState } from 'react'
import { LogIn, LogOut, Bookmark, Trash2, Search, Flag, ShieldCheck, Shield, MessageSquareHeart, Smartphone, Layers } from 'lucide-react'
import { PLAN_BY_ID } from '../data/plans'
import StatusBadge from '../components/StatusBadge'
import { CATEGORY_BY_ID } from '../data/constants'
import { SCENARIOS } from '../data/scamScenarios'
import { formatPhone, timeAgo } from '../utils/phone'

function Section({ title, description, children, action }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-ink-soft">{description}</p>}
        </div>
        {action}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}

export default function AccountView({ user, onLogin, onLogout, watchlist, onRemove, onCheck, loadMyReports, training, onReport, onFeedback, go, isDemo, plan, onEndPlan }) {
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

  const done = SCENARIOS.filter((s) => training[s.id] === 'safe').length

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

      <Section title="Minha lista" description="Números que você salvou para acompanhar. Ficam guardados neste aparelho.">
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
          <ul className="divide-y divide-line">
            {mine.map((r) => (
              <li key={r.id} className="py-3">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-ink">{formatPhone(r.phone)}</span>
                  <span className="text-sm text-ink-soft">{timeAgo(r.createdAt)}</span>
                </p>
                <p className="text-sm text-ink-soft">{CATEGORY_BY_ID[r.category]?.label}</p>
                {r.description && <p className="mt-1 text-[15px] text-ink">“{r.description}”</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Meu treino"
        description={`Você se protegeu em ${done} de ${SCENARIOS.length} golpes do simulador.`}
        action={
          <button type="button" onClick={() => go('simulador')} className="btn btn-secondary">
            Ir para o simulador
          </button>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-ink">
              {training[s.id] === 'safe' ? <ShieldCheck className="size-5 text-safe" /> : <Shield className="size-5 text-line" />}
              {s.title}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Meu plano"
        description={plan ? `${PLAN_BY_ID[plan.plan].name} (simulação): ${plan.summary}. Nenhuma cobrança é feita.` : 'Gratuito: tudo o que protege você, sem anúncios.'}
        action={
          <div className="flex gap-2">
            {plan && (
              <button type="button" onClick={onEndPlan} className="btn btn-ghost">Encerrar simulação</button>
            )}
            <button type="button" onClick={() => go('planos')} className="btn btn-secondary">
              <Layers className="size-4" /> Ver planos
            </button>
          </div>
        }
      />

      <Section title="Sua opinião" description="Encontrou um problema ou tem uma ideia? Conte para a gente.">
        <button type="button" onClick={onFeedback} className="btn btn-secondary">
          <MessageSquareHeart className="size-5" /> Enviar feedback
        </button>
      </Section>
    </div>
  )
}

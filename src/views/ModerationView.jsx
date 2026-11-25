import { useCallback, useEffect, useState } from 'react'
import { Scale, Trash2, Check, X, Search, Info, ShieldAlert, LogIn, RefreshCw } from 'lucide-react'
import { backend } from '../services/backend'
import { CATEGORY_BY_ID, SEVERITY_BY_ID } from '../data/constants'
import { formatPhone, timeAgo } from '../utils/phone'

const REASON = {
  meu: 'O número é meu e nunca liguei para aplicar golpe',
  clonado: 'Meu número foi clonado ou usado por outra pessoa',
  novo: 'Comprei este número há pouco tempo',
  empresa: 'É o número de uma empresa de verdade',
}
const STATUS = {
  pendente: { text: 'Em análise', cls: 'bg-warn-tint text-warn' },
  aprovado: { text: 'Aceito: denúncias apagadas', cls: 'bg-safe-tint text-safe' },
  recusado: { text: 'Recusado: denúncias mantidas', cls: 'bg-paper text-ink-soft' },
}

/** Sinais de que um relato pode ter dado pessoal ou ofensa e precisa de atenção. */
function flagsOf(text = '') {
  const flags = []
  if (/\d[\d.\-\s]{9,}\d/.test(text.replace(/\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g, ''))) flags.push('Pode ter CPF ou outro número')
  if (/@|\bhttps?:\/\//i.test(text)) flags.push('Tem e-mail ou link')
  if (/\b(idiota|burro|lixo|vagabund|desgraçad)/i.test(text)) flags.push('Linguagem ofensiva')
  return flags
}

const RULES = [
  'Aceite a revisão quando as denúncias forem poucas, antigas ou não tiverem relato que confirme o golpe.',
  'Recuse quando várias pessoas, em dias diferentes, relataram o mesmo golpe com detalhes.',
  'Apague relatos com dado pessoal (CPF, endereço, nome completo), ofensas ou que não falem de golpe.',
  'Na dúvida, proteja a pessoa que pode ser inocente: um número sem denúncias ainda pode ser denunciado de novo.',
]

export default function ModerationView({ onCheck, onDecision, onLogin, user, isDemo }) {
  const [state, setState] = useState({ loading: true, allowed: false, data: null, error: '' })
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(null)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try {
      const allowed = await backend.moderacao.souModerador()
      const data = allowed ? await backend.moderacao.listar() : null
      setState({ loading: false, allowed, data, error: '' })
    } catch (err) {
      setState({ loading: false, allowed: false, data: null, error: err.message || 'Não foi possível abrir a moderação.' })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, user])

  const decide = async (req, approve) => {
    setBusy(req.id)
    try {
      await backend.moderacao.decidirRevisao(req.id, approve)
      onDecision(req, approve)
      await load()
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }))
    } finally {
      setBusy(null)
    }
  }

  const remove = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    setBusy(id)
    try {
      await backend.moderacao.apagarDenuncia(id)
      setConfirmId(null)
      await load()
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }))
    } finally {
      setBusy(null)
    }
  }

  const { loading, allowed, data, error } = state
  const pending = data?.revisoes.filter((r) => r.status === 'pendente') ?? []
  const decided = data?.revisoes.filter((r) => r.status !== 'pendente') ?? []

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Moderação</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Aqui a equipe confere pedidos de revisão e apaga denúncias erradas, para que nenhuma pessoa inocente fique marcada como golpista.
        </p>
        {isDemo && (
          <p className="mt-4 flex max-w-2xl gap-3 rounded-xl border border-brand/20 bg-brand-tint p-4 text-[15px] text-ink">
            <Info className="mt-0.5 size-5 shrink-0 text-brand" />
            <span>
              <b>Demonstração:</b> qualquer pessoa pode abrir esta tela e as decisões valem só neste aparelho. Com o banco de dados ligado, só quem é moderador consegue entrar.
            </span>
          </p>
        )}
      </section>

      {error && <p role="alert" className="rounded-xl bg-danger-tint p-4 text-danger">{error}</p>}

      {loading && !data ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
      ) : !allowed ? (
        <section className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-white p-6">
          <ShieldAlert className="size-10 text-warn" />
          <div>
            <h2 className="text-xl font-bold text-ink">Área só para moderadores</h2>
            <p className="mt-1 text-ink-soft">Entre com o número cadastrado como moderador para ver os pedidos.</p>
          </div>
          {!user && (
            <button type="button" onClick={onLogin} className="btn btn-primary">
              <LogIn className="size-5" /> Entrar
            </button>
          )}
        </section>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-3">
            {[
              ['Em análise', pending.length, 'text-warn'],
              ['Aceitos', decided.filter((r) => r.status === 'aprovado').length, 'text-safe'],
              ['Recusados', decided.filter((r) => r.status === 'recusado').length, 'text-ink'],
            ].map(([label, value, cls]) => (
              <div key={label} className="rounded-2xl border border-line bg-white p-4">
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className={`text-3xl font-extrabold ${cls}`}>{value}</dd>
              </div>
            ))}
          </dl>

          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">Pedidos de revisão</h2>
              <button type="button" onClick={load} className="btn btn-ghost px-3">
                <RefreshCw className={`size-5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
              </button>
            </div>
            {data.revisoes.length === 0 ? (
              <p className="mt-3 text-ink-soft">Nenhum pedido por enquanto.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {[...pending, ...decided].map((r) => (
                  <li key={r.id} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-lg text-ink">{formatPhone(r.phone)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].text}</span>
                    </div>
                    <p className="mt-1 text-ink">{REASON[r.reason] ?? r.reason}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      Pedido {timeAgo(r.createdAt)}
                      {r.sample && ' (exemplo)'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => onCheck(r.phone)} className="btn btn-ghost px-3">
                        <Search className="size-5" /> Ver denúncias
                      </button>
                      {r.status === 'pendente' && (
                        <>
                          <button type="button" disabled={busy === r.id} onClick={() => decide(r, true)} className="btn btn-primary">
                            <Check className="size-5" /> Aceitar e apagar denúncias
                          </button>
                          <button type="button" disabled={busy === r.id} onClick={() => decide(r, false)} className="btn btn-secondary">
                            <X className="size-5" /> Manter denúncias
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-bold text-ink">Relatos recentes</h2>
            <p className="mt-1 text-ink-soft">Apague relatos com dados pessoais, ofensas ou que não falam de golpe. Os marcados em amarelo merecem atenção.</p>
            <ul className="mt-3 divide-y divide-line">
              {data.denuncias.map((d) => {
                const flags = flagsOf(d.description)
                return (
                  <li key={d.id} className={`py-4 ${flags.length ? '-mx-3 rounded-xl bg-warn-tint/60 px-3' : ''}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-ink">{formatPhone(d.phone)}</span>
                      <span className="text-sm text-ink-soft">{timeAgo(d.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ink-soft">
                      {CATEGORY_BY_ID[d.category]?.label ?? d.category}, gravidade {SEVERITY_BY_ID[d.severity]?.label?.toLowerCase() ?? d.severity}
                    </p>
                    <p className="mt-1 text-[15px] text-ink">“{d.description}”</p>
                    {flags.length > 0 && <p className="mt-1 text-sm font-semibold text-warn">{flags.join('. ')}.</p>}
                    <button
                      type="button"
                      disabled={busy === d.id}
                      onClick={() => remove(d.id)}
                      className={`btn mt-2 px-3 ${confirmId === d.id ? 'bg-danger text-white hover:bg-danger/90' : 'btn-ghost text-danger'}`}
                    >
                      <Trash2 className="size-5" /> {confirmId === d.id ? 'Confirmar: apagar relato' : 'Apagar relato'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <Scale className="size-5 text-brand" /> Regras da moderação
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink">
              {RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

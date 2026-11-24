import { useState } from 'react'
import { ArrowLeft, ArrowRight, Bell, Ban, Flag, PhoneIncoming, MessageSquareText, Search, Sparkles, Users, Heart, ShieldCheck } from 'lucide-react'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import { LogoMark } from './Logo'
import { TRIAL_DAYS } from '../data/plans'

function Frame({ children }) {
  return <div className="flex min-h-44 items-center justify-center rounded-2xl bg-paper p-5">{children}</div>
}

const STEPS = [
  {
    title: 'Descubra quem ligou e avise quem pode ser o próximo',
    text: 'O Alerta Golpe junta as denúncias de muita gente. Quanto mais pessoas denunciam, mais rápido todo mundo fica sabendo de um número de golpe.',
    art: (
      <Frame>
        <div className="flex flex-col items-center gap-3">
          <LogoMark className="size-16" />
          <p className="font-bold text-ink">Alerta Golpe</p>
        </div>
      </Frame>
    ),
  },
  {
    title: '1. Consulte o número que ligou',
    text: 'Digite o número na página inicial. Em segundos você vê se outras pessoas denunciaram e o que elas contaram.',
    art: (
      <Frame>
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 font-mono text-ink">
            <Search className="size-5 text-ink-soft" /> (11) 98765-4321
          </div>
          <div className="flex items-center justify-between rounded-xl border border-danger/25 bg-danger-tint px-3 py-2.5">
            <StatusBadge status="perigoso" />
            <span className="text-sm text-ink">23 denúncias</span>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: '2. Denuncie em menos de 1 minuto',
    text: 'Toque em "Denunciar" no topo da tela, escolha o tipo de golpe e a gravidade. Contar o que aconteceu é opcional, e você não precisa se cadastrar.',
    art: (
      <Frame>
        <div className="flex flex-col items-center gap-3">
          <span className="btn btn-secondary pointer-events-none">
            <Flag className="size-5 text-danger" /> Denunciar
          </span>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {['Falsa central de banco', 'Falso parente', 'Fraude de Pix'].map((c) => (
              <span key={c} className="chip bg-white">{c}</span>
            ))}
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: '3. Acompanhe o que aconteceu',
    text: 'No sino do topo da tela, avisamos quando outras pessoas confirmam sua denúncia, quando o número é bloqueado ou quando a denúncia é apagada.',
    art: (
      <Frame>
        <div className="w-full max-w-xs space-y-2">
          {[
            { icon: Users, cls: 'bg-warn-tint text-warn', t: 'Outras pessoas confirmaram' },
            { icon: Ban, cls: 'bg-safe-tint text-safe', t: 'Número bloqueado' },
          ].map(({ icon: I, cls, t }) => (
            <div key={t} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
              <span className={`grid size-8 place-items-center rounded-full ${cls}`}>
                <I className="size-4" />
              </span>
              <span className="text-[15px] font-semibold text-ink">{t}</span>
            </div>
          ))}
          <p className="flex items-center justify-center gap-1.5 pt-1 text-sm text-ink-soft">
            <Bell className="size-4" /> Avisos simulados nesta demonstração
          </p>
        </div>
      </Frame>
    ),
  },
  {
    title: '4. Treine para não cair',
    text: 'No simulador, você atende uma ligação de golpe de mentira e vê o que fez certo. Em "Mensagem", cola um texto suspeito e vê os sinais de golpe.',
    art: (
      <Frame>
        <div className="flex gap-4">
          {[
            { icon: PhoneIncoming, t: 'Simular golpe' },
            { icon: MessageSquareText, t: 'Analisar mensagem' },
          ].map(({ icon: I, t }) => (
            <div key={t} className="flex w-32 flex-col items-center gap-2 rounded-xl border border-line bg-white p-4 text-center">
              <I className="size-7 text-brand" />
              <span className="text-sm font-semibold text-ink">{t}</span>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    title: 'Grátis para sempre',
    text: `Consultar e denunciar não custa nada. Se quiser treino completo, avisos da sua lista ou proteger a família, há planos pagos, com ${TRIAL_DAYS} dias de teste grátis.`,
    art: (
      <Frame>
        <div className="space-y-2">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Heart className="size-5 text-danger" /> Consultar e denunciar: grátis
          </p>
          <p className="flex items-center gap-2 font-semibold text-ink">
            <ShieldCheck className="size-5 text-safe" /> Sem cadastro e sem anúncios
          </p>
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Sparkles className="size-5 text-brand" /> Planos pagos opcionais
          </p>
        </div>
      </Frame>
    ),
  },
]

/** Tutorial da primeira visita. Pode ser aberto de novo em Dicas e em Minha área. */
export default function OnboardingModal({ open, onClose, onStartSearch }) {
  const [i, setI] = useState(0)
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  const finish = (action) => {
    setI(0)
    onClose()
    action?.()
  }

  return (
    <Modal open={open} onClose={() => finish()} icon={Sparkles} title="Como usar o Alerta Golpe" subtitle={`Passo ${i + 1} de ${STEPS.length}`} labelledBy="onboarding-title">
      <div className="overflow-y-auto px-5 pt-5 pb-5 sm:px-6">
        <div key={i} className="animate-rise">
          {step.art}
          <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">{step.title}</h3>
          <p className="mt-2 text-[17px] leading-relaxed text-ink-soft">{step.text}</p>
        </div>

        <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, n) => (
            <span key={n} className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-brand' : 'w-2 bg-line'}`} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          {i === 0 ? (
            <button type="button" onClick={() => finish()} className="btn btn-ghost">Pular tutorial</button>
          ) : (
            <button type="button" onClick={() => setI(i - 1)} className="btn btn-ghost">
              <ArrowLeft className="size-5" /> Voltar
            </button>
          )}
          {last ? (
            <button type="button" data-autofocus onClick={() => finish(onStartSearch)} className="btn btn-primary">
              <Search className="size-5" /> Consultar um número
            </button>
          ) : (
            <button type="button" data-autofocus onClick={() => setI(i + 1)} className="btn btn-primary">
              Próximo <ArrowRight className="size-5" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

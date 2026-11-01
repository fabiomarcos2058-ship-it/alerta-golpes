import { KeyRound, Timer, Landmark, Users, PhoneOff, Lock, Lightbulb, LifeBuoy } from 'lucide-react'

const TIPS = [
  { icon: KeyRound, title: 'Nunca passe códigos por SMS', text: 'Nenhum banco, loja ou app pede o código que chegou no seu celular. Quem pede é golpista.' },
  { icon: Timer, title: 'Desconfie de urgência', text: '"Precisa ser agora" é a principal arma do golpe. Pare, desligue e pense com calma.' },
  { icon: Landmark, title: 'Banco não liga pedindo senha', text: 'Nem pede transferência para "conta segura" ou que você digite a senha durante a ligação.' },
  { icon: PhoneOff, title: 'Desligue e ligue você', text: 'Na dúvida, encerre e ligue para o número oficial que está no verso do cartão ou no app.' },
  { icon: Users, title: 'Confirme pedidos de parentes', text: 'Pedido de dinheiro de "número novo"? Ligue para o número antigo ou faça chamada de vídeo.' },
  { icon: Lock, title: 'Ative a verificação em duas etapas', text: 'No WhatsApp: Configurações › Conta › Confirmação em duas etapas. Isso impede a clonagem.' },
]

const IF_SCAMMED = [
  'Ligue para o seu banco imediatamente e peça o bloqueio.',
  'Se foi Pix, solicite o MED (Mecanismo Especial de Devolução) no seu banco.',
  'Registre um boletim de ocorrência (pode ser pela delegacia online do seu estado).',
  'Denuncie o número aqui para alertar outras pessoas.',
]

export default function SafetyTips() {
  return (
    <section id="dicas" className="scroll-mt-24 space-y-4">
      <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="size-5 text-cyan-300" />
          <h2 className="font-display text-lg font-semibold text-white">Dicas de segurança</h2>
        </div>
        <ul className="space-y-4">
          {TIPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                <Icon className="size-4 text-cyan-300" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <LifeBuoy className="size-5 text-amber-300" />
          <h2 className="font-display text-base font-semibold text-amber-100">Caiu num golpe? Faça agora:</h2>
        </div>
        <ol className="space-y-2.5">
          {IF_SCAMMED.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-amber-50/80">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-400/20 font-mono text-[11px] font-semibold text-amber-200">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

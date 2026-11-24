import { KeyRound, Timer, Landmark, PhoneOff, Users, Lock, Ban, Link2, Search, Flag, Bell, PhoneIncoming, Bookmark, CircleHelp } from 'lucide-react'

const TIPS = [
  { icon: KeyRound, title: 'Nunca passe códigos que chegam por SMS', text: 'Nenhum banco, loja ou aplicativo pede esse código. Quem pede é golpista.' },
  { icon: Timer, title: 'Desconfie de urgência', text: '"Tem que ser agora" é a principal arma do golpe. Pare, desligue e pense com calma.' },
  { icon: Landmark, title: 'Banco não liga pedindo senha nem Pix', text: 'Nem pede para transferir dinheiro para uma "conta segura" ou digitar a senha durante a ligação.' },
  { icon: PhoneOff, title: 'Desligue e ligue você', text: 'Na dúvida, encerre e ligue para o número oficial que está no verso do cartão ou no aplicativo.' },
  { icon: Users, title: 'Confirme pedidos de parentes', text: 'Pedido de dinheiro de um "número novo"? Ligue para o número antigo ou faça uma chamada de vídeo.' },
  { icon: Link2, title: 'Não clique em links de mensagens inesperadas', text: 'Entre sempre pelo aplicativo ou pelo site oficial, digitando o endereço você mesmo.' },
  { icon: Lock, title: 'Ative a verificação em duas etapas', text: 'No WhatsApp: Configurações › Conta › Confirmação em duas etapas. Isso impede a clonagem.' },
  { icon: Ban, title: 'Cadastre seu número no Não Me Perturbe', text: 'O cadastro no site naomeperturbe.com.br reduz ligações de telemarketing de bancos e operadoras.' },
]

const HOW_TO = [
  { icon: Search, title: 'Consulte o número', text: 'Na página inicial, digite o número que ligou. Você vê o selo (Sem denúncias, Suspeito ou Golpe), quantas pessoas denunciaram e o que contaram.' },
  { icon: Flag, title: 'Denuncie', text: 'Toque em "Denunciar" no topo. Escolha o tipo de golpe e a gravidade. Leva menos de 1 minuto e não precisa de cadastro.' },
  { icon: Bell, title: 'Acompanhe pelo sino', text: 'O sino mostra quando sua denúncia é confirmada, quando o número é bloqueado ou quando a denúncia é apagada.' },
  { icon: Bookmark, title: 'Salve números para acompanhar', text: 'No resultado, toque em "Salvar na minha lista". Seus números ficam em Minha área.' },
  { icon: PhoneIncoming, title: 'Treine no simulador', text: 'Atenda uma ligação de golpe de mentira e veja, no final, o que fez certo e o que fez errado.' },
]

const IF_SCAMMED = [
  { title: 'Ligue para o seu banco na hora', text: 'Peça o bloqueio da conta e dos cartões. Use o número do verso do cartão ou o aplicativo.' },
  { title: 'Se foi Pix, peça o MED', text: 'O Mecanismo Especial de Devolução é pedido ao seu banco. O prazo é de até 80 dias, mas quanto antes, maior a chance de recuperar.' },
  { title: 'Registre um boletim de ocorrência', text: 'Pode ser feito pela internet, na delegacia online do seu estado. Guarde prints e comprovantes.' },
  { title: 'Avise quem pode ser o próximo', text: 'Se clonaram seu WhatsApp, avise seus contatos por outro meio. E denuncie o número aqui no site.' },
]

export default function TipsView({ onReport, onTutorial }) {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-line bg-white p-6 sm:p-8" aria-labelledby="como-usar">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 id="como-usar" className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Como usar</h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">O Alerta Golpe em cinco passos.</p>
          </div>
          <button type="button" onClick={onTutorial} className="btn btn-secondary">
            <CircleHelp className="size-5" /> Ver o tutorial
          </button>
        </div>
        <ol className="mt-7 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {HOW_TO.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Icon className="size-5" />
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-xs font-bold text-brand ring-2 ring-brand">{i + 1}</span>
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">{title}</h2>
                <p className="mt-1 text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">Como se proteger</h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">Oito cuidados que evitam a maioria dos golpes por telefone e mensagem.</p>
        <ul className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {TIPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1 text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-warn/30 bg-warn-tint p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-ink">Caiu num golpe? Faça isto, nesta ordem</h2>
        <ol className="mt-6 space-y-5">
          {IF_SCAMMED.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-lg font-bold text-white">{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-0.5 text-ink">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => onReport()} className="btn btn-primary mt-7">Denunciar o número</button>
      </section>
    </div>
  )
}

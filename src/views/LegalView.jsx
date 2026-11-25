import { FileText, ShieldCheck } from 'lucide-react'

// Textos em linguagem simples. Antes de lançar com dados reais, peça para um advogado revisar.
const UPDATED = '25 de novembro de 2026'

const TERMS = [
  {
    title: 'O que é o Alerta Golpe',
    body: [
      'O Alerta Golpe é um serviço colaborativo e gratuito: as pessoas contam quais números ligaram ou mandaram mensagem tentando aplicar golpe, e quem recebe uma ligação pode consultar esses relatos antes de atender ou responder.',
      'As denúncias são relatos de usuários, não são acusação formal nem decisão da polícia ou da Justiça. O selo de um número (Sem denúncias, Suspeito ou Perigoso) é calculado pela quantidade de pessoas que denunciaram e pela gravidade que marcaram.',
      'O Alerta Golpe não substitui o boletim de ocorrência. Se você perdeu dinheiro, procure seu banco e a polícia.',
    ],
  },
  {
    title: 'Quem pode usar',
    body: [
      'Qualquer pessoa pode consultar números, sem cadastro. Para denunciar, o site cria uma sessão anônima no seu navegador; o login com número de telefone é opcional.',
      'Se você tem menos de 18 anos, use o site com a ajuda de um responsável.',
    ],
  },
  {
    title: 'Regras para denunciar',
    list: [
      'Denuncie só números que realmente entraram em contato com você ou com alguém próximo.',
      'Conte o que aconteceu sem colocar dados pessoais: nada de CPF, endereço, nome completo, foto ou dados bancários, nem seus nem de outras pessoas.',
      'Não use o site para vingança, brincadeira ou para prejudicar alguém. Denunciar uma pessoa inocente de propósito pode gerar responsabilidade civil e criminal.',
      'Não use robôs nem programas para denunciar em massa.',
      'Para evitar abuso, cada pessoa pode fazer até 10 denúncias por dia e denunciar o mesmo número uma vez a cada 30 dias. Cada rede de internet tem um limite de 30 denúncias por dia.',
      'Números de emergência e de atendimento oficial (190, 0800, 4004 e centrais cadastradas de bancos e órgãos públicos) não podem ser denunciados. Golpistas costumam falsificar esses números na tela.',
    ],
  },
  {
    title: 'Moderação e revisão',
    body: [
      'A equipe de moderação pode apagar relatos que tenham dados pessoais, ofensas, conteúdo que não fala de golpe ou sinais de denúncia falsa.',
      'Quem acredita que o próprio número foi denunciado por engano (por exemplo, porque a linha foi clonada ou trocou de dono) pode pedir revisão no resultado da consulta, em "Este número é seu?". O pedido não exige documento. Quando a revisão é aceita, as denúncias antigas do número são apagadas e ele aparece como "revisado".',
    ],
  },
  {
    title: 'Limites do serviço',
    body: [
      'Fazemos o possível para que as informações sejam úteis, mas elas podem estar incompletas ou erradas: um número sem denúncias não é garantia de segurança, e um número denunciado pode ter sido usado por golpistas sem o dono saber. A decisão de atender, responder ou bloquear é sua.',
      'Nunca passe senhas, códigos recebidos por SMS ou dados bancários para quem ligou, mesmo que o número pareça confiável. O Alerta Golpe nunca liga para você e nunca pede esses dados.',
    ],
  },
  {
    title: 'Planos',
    body: [
      'Consultar e denunciar números é gratuito. Nesta versão, os planos pagos e o teste grátis são apenas uma demonstração: nenhum pagamento é cobrado e nenhum dado de pagamento é pedido.',
    ],
  },
  {
    title: 'Mudanças e contato',
    body: [
      'Podemos atualizar estes termos. A data da última mudança fica no topo da página. Dúvidas, reclamações ou pedidos podem ser enviados pelo botão "Enviar feedback".',
    ],
  },
]

const PRIVACY = [
  {
    title: 'Resumo',
    list: [
      'Você consulta números sem cadastro e sem deixar seu nome.',
      'Quem denunciou nunca aparece para outras pessoas.',
      'Não vendemos dados, não mostramos anúncios e não usamos rastreadores de publicidade.',
      'Sua lista, seu treino, seus avisos e suas pesquisas recentes ficam só no seu aparelho.',
    ],
  },
  {
    title: 'Quais dados usamos',
    list: [
      'Ao consultar: o número digitado, só para fazer a busca. Não guardamos histórico das suas consultas no servidor.',
      'Ao denunciar: o número denunciado, o tipo de golpe, a gravidade, o seu relato, a data, um identificador anônimo da sua sessão e um código calculado a partir do endereço de internet (IP) da sua rede. Esse código não permite descobrir o IP. Os dois servem só para os limites contra abuso e nunca são mostrados.',
      'Login opcional: o seu número de telefone, para enviar o código de acesso por SMS e mostrar as suas denúncias em qualquer aparelho. Há limite de códigos por hora para evitar envio abusivo de SMS, e não guardamos o código depois de usado.',
      'Feedback: a nota, a mensagem, o contato (se você quiser informar), a página e o tipo de navegador.',
      'Pedido de revisão: o número e o motivo escolhido. Não pedimos documento.',
      'Analisador de mensagens: o texto que você cola é analisado no seu próprio aparelho e não é enviado para ninguém.',
    ],
  },
  {
    title: 'Para que usamos e com qual base legal',
    body: [
      'Usamos os dados para mostrar a outras pessoas os números denunciados, evitar fraudes e abusos no próprio site, moderar relatos e responder pedidos. A base legal é o legítimo interesse de prevenir golpes e proteger as pessoas (Lei Geral de Proteção de Dados, LGPD, art. 7º, IX). O login e o contato no feedback são opcionais e dependem do seu consentimento (art. 7º, I), que você pode retirar quando quiser.',
    ],
  },
  {
    title: 'O que fica visível',
    body: [
      'Na lista de denúncias recentes, os dois últimos dígitos do número ficam escondidos. Na consulta de um número, aparecem o selo, a quantidade de denúncias, os tipos de golpe e os relatos, sem identificar quem denunciou.',
    ],
  },
  {
    title: 'E se o número denunciado for o meu?',
    body: [
      'Um número de telefone pode ser um dado pessoal do dono da linha. Por isso você pode pedir revisão no resultado da consulta, ou pedir a correção ou a exclusão das denúncias pelo feedback. Quando o pedido é aceito, as denúncias antigas são apagadas da consulta.',
    ],
  },
  {
    title: 'Por quanto tempo guardamos',
    list: [
      'Denúncias: até 2 anos. Depois disso, são apagadas.',
      'Denúncias apagadas pela moderação ficam guardadas por até 6 meses, só para responder a contestações, e depois são eliminadas.',
      'Feedbacks e pedidos de revisão: até 1 ano.',
      'Conta de login: até você pedir a exclusão.',
    ],
  },
  {
    title: 'Com quem compartilhamos',
    body: [
      'Usamos serviços de terceiros para funcionar: o Supabase guarda o banco de dados, um provedor de SMS envia o código de login, o GitHub Pages hospeda o site e o Google Fonts entrega as fontes. Alguns desses serviços ficam fora do Brasil, com proteções previstas na LGPD. Não vendemos nem cedemos dados para publicidade.',
    ],
  },
  {
    title: 'Seus direitos',
    body: [
      'Pela LGPD (art. 18), você pode pedir para confirmar se usamos seus dados, acessar, corrigir, anonimizar ou apagar, saber com quem compartilhamos e retirar o consentimento. Peça pelo botão "Enviar feedback" e responderemos em até 15 dias. Os dados guardados só no seu aparelho você apaga sozinho em Minha área, no botão "Apagar meus dados deste aparelho".',
      'Se não ficar satisfeito, você também pode procurar a Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    title: 'Segurança',
    body: [
      'O banco de dados não permite leitura direta: tudo passa por funções que devolvem só o necessário. Usamos conexão segura (HTTPS) e limites contra abuso.',
    ],
  },
  {
    title: 'Armazenamento no aparelho',
    body: [
      'Não usamos cookies de rastreamento. O site guarda no armazenamento do navegador (localStorage) a sua lista, as pesquisas recentes, o treino, os avisos, o plano simulado e as suas preferências, para que continuem lá quando você voltar.',
    ],
  },
]

function Block({ title, body, list }) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {body?.map((p) => (
        <p key={p.slice(0, 30)} className="mt-3 text-ink">{p}</p>
      ))}
      {list && (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-ink">
          {list.map((li) => (
            <li key={li.slice(0, 30)}>{li}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function LegalView({ doc, go }) {
  const terms = doc === 'termos'
  const Icon = terms ? FileText : ShieldCheck
  return (
    <article className="mx-auto max-w-3xl space-y-6 leading-relaxed">
      <header>
        <span className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand">
          <Icon className="size-6" />
        </span>
        <h1 className="mt-4 text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
          {terms ? 'Termos de uso' : 'Política de privacidade'}
        </h1>
        <p className="mt-3 text-ink-soft">Atualizado em {UPDATED}.</p>
        <p className="mt-2 text-ink-soft">
          {terms ? 'Veja também a ' : 'Veja também os '}
          <button type="button" onClick={() => go(terms ? 'privacidade' : 'termos')} className="font-semibold text-brand underline">
            {terms ? 'Política de privacidade' : 'Termos de uso'}
          </button>
          .
        </p>
      </header>
      {(terms ? TERMS : PRIVACY).map((b) => (
        <Block key={b.title} {...b} />
      ))}
    </article>
  )
}

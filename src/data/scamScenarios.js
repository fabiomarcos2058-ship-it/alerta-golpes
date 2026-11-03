// Roteiros do Simulador de golpe.
// Todos os nomes, empresas, números e valores são FICTÍCIOS e servem só para treinar
// a identificar golpes comuns. "Banco Horizonte" e "Crédito Fácil" não existem.
//
// Estrutura de cada cenário:
//   nodes[id] = {
//     lines: ['fala do golpista', ...],
//     flags: ['sinal de golpe que aparece nesta fala'],
//     choices: [{ label, safe: true | false | null, feedback, next }],
//     next: 'id'                        // sem escolhas: segue direto
//   }
//   endings[id] = { outcome: 'safe' | 'partial' | 'scammed', title, text }
// safe: true = atitude segura · false = atitude arriscada · null = neutra
import { Landmark, Users, Banknote, MessageSquare } from 'lucide-react'

export const SCENARIOS = [
  {
    id: 'falso-banco',
    title: 'Falsa central do banco',
    summary: 'Uma "central de segurança" liga avisando de uma compra suspeita no seu cartão.',
    icon: Landmark,
    caller: { name: 'Central de Segurança', detail: 'Banco Horizonte', number: '0800 •••• ••••' },
    start: 'inicio',
    nodes: {
      inicio: {
        lines: [
          'Boa tarde, aqui é da Central de Segurança do Banco Horizonte.',
          'Identificamos uma compra de R$ 2.847,90 no seu cartão, numa loja de eletrônicos em Manaus. Você reconhece essa compra?',
        ],
        flags: ['Ligação inesperada dizendo ser do banco'],
        choices: [
          {
            label: 'Não fui eu! Cancela, por favor.',
            safe: null,
            feedback: 'Reação natural. É exatamente o susto que o golpista quer causar: com medo, a gente obedece sem pensar.',
            next: 'codigo',
          },
          {
            label: 'Como eu sei que você é do banco?',
            safe: null,
            feedback: 'Boa desconfiança! Mas repare: ele vai mostrar que sabe seus dados. Isso não prova nada, porque dados vazam o tempo todo.',
            next: 'sabe_dados',
          },
          {
            label: 'Vou desligar e ligar no número atrás do meu cartão.',
            safe: true,
            feedback: 'Atitude perfeita. Se a compra fosse real, o banco resolveria pelo número oficial.',
            next: 'fim_seguro',
          },
        ],
      },
      sabe_dados: {
        lines: [
          'Claro! Você é titular do cartão final 4821 e seu CPF começa com 123. Está tudo aqui no sistema.',
          'Agora preciso agir rápido para bloquear essa compra, tudo bem?',
        ],
        flags: ['Usa seus dados pessoais para parecer confiável'],
        choices: [
          {
            label: 'Tá bom, pode bloquear.',
            safe: null,
            feedback: 'Saber seu nome e parte do cartão convenceu. É assim que muita gente cai: esses dados são comprados de vazamentos.',
            next: 'codigo',
          },
          {
            label: 'Mesmo assim, vou desligar e ligar no número oficial.',
            safe: true,
            feedback: 'Isso! Saber seus dados não prova que é o banco.',
            next: 'fim_seguro',
          },
        ],
      },
      codigo: {
        lines: [
          'Certo, vou cancelar agora. Para confirmar sua identidade, vou enviar um código por SMS.',
          'Assim que chegar, me fala os 6 números, por favor.',
        ],
        flags: ['Pede o código que chegou por SMS'],
        choices: [
          {
            label: 'Chegou aqui: 4 8 2 9 1 5.',
            safe: false,
            feedback: 'Esse código autoriza o acesso à sua conta em outro celular. Banco nenhum pede esse código por telefone.',
            next: 'fim_codigo',
          },
          {
            label: 'Não vou passar código nenhum.',
            safe: true,
            feedback: 'Correto! Código de SMS é só seu. Agora veja como ele vai tentar te pressionar.',
            next: 'pressao',
          },
        ],
      },
      pressao: {
        lines: [
          'Se não confirmarmos agora, a compra será aprovada em 10 minutos e o banco não poderá devolver o dinheiro.',
          'Para proteger o seu saldo, vou transferir tudo para uma conta segura enquanto resolvemos. É só fazer um Pix para a chave que vou passar.',
        ],
        flags: ['Pressão com prazo curto', 'Pede transferência para uma "conta segura"'],
        choices: [
          {
            label: 'Tá, me passa a chave que eu faço o Pix.',
            safe: false,
            feedback: 'Não existe "conta segura". Todo dinheiro transferido vai direto para o golpista.',
            next: 'fim_pix',
          },
          {
            label: 'Vou desligar e resolver pelo aplicativo do banco.',
            safe: true,
            feedback: 'Perfeito. O aplicativo e o número do cartão são os canais em que você pode confiar.',
            next: 'fim_seguro',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Você se protegeu!',
        text: 'Desligar e ligar você mesmo para o número oficial (atrás do cartão ou no aplicativo) é a forma mais segura de conferir. Se houvesse mesmo uma compra estranha, o banco resolveria por lá.',
      },
      fim_codigo: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'Com o código, o golpista acessa sua conta pelo celular dele e faz transferências e empréstimos no seu nome. Em poucos minutos o saldo pode sumir.',
      },
      fim_pix: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'O dinheiro foi para a conta de um laranja e é espalhado em várias contas em minutos. Se acontecer de verdade, ligue para o banco na hora e peça o MED do Pix.',
      },
    },
  },

  {
    id: 'falso-parente',
    title: 'Falso parente',
    summary: 'Alguém liga de um número novo dizendo ser da família e precisando de dinheiro.',
    icon: Users,
    caller: { name: 'Número desconhecido', detail: 'Celular', number: '(••) 9••••-••••' },
    start: 'inicio',
    nodes: {
      inicio: {
        lines: [
          'Alô? Oi, sou eu! Tá me ouvindo? A ligação tá ruim…',
          'Meu celular caiu na água e eu tô com esse número novo. Salva aí, tá?',
        ],
        flags: ['"Número novo" de alguém conhecido'],
        choices: [
          {
            label: 'Quem tá falando?',
            safe: true,
            feedback: 'Boa! Deixe a pessoa dizer quem é. Repare como ela vai fugir da pergunta.',
            next: 'desvia',
          },
          {
            label: 'Oi, filho! Tudo bem?',
            safe: false,
            feedback: 'Cuidado: você acabou de dizer quem ele deve fingir ser. Golpistas esperam a gente falar um nome.',
            next: 'pedido',
          },
          {
            label: 'Vou desligar e ligar no seu número antigo pra confirmar.',
            safe: true,
            feedback: 'Excelente. Confirmar pelo número antigo ou por chamada de vídeo derruba esse golpe.',
            next: 'fim_seguro',
          },
        ],
      },
      desvia: {
        lines: [
          'Ah, não reconhece minha voz? É que eu tô gripado e o sinal aqui tá péssimo.',
          'Escuta, preciso de um favor rápido…',
        ],
        flags: ['Foge de dizer o próprio nome'],
        next: 'pedido',
      },
      pedido: {
        lines: [
          'Tô sem acesso ao banco no celular novo e preciso pagar um boleto hoje, senão vou ter problema.',
          'São R$ 1.890. Faz um Pix pra mim? Amanhã eu te devolvo, prometo.',
          'Ah, e não comenta com ninguém, tá? Depois eu te explico.',
        ],
        flags: ['Pedido de dinheiro com urgência', 'Pede segredo'],
        choices: [
          {
            label: 'Tá bom, me passa a chave.',
            safe: false,
            feedback: 'A chave Pix estaria no nome de outra pessoa, que é um sinal clássico. Mas na pressa muita gente nem repara.',
            next: 'fim_golpe',
          },
          {
            label: 'Antes, me diz uma coisa que só você saberia.',
            safe: true,
            feedback: 'Ótima ideia! Combinar uma pergunta ou palavra secreta com a família derruba esse golpe.',
            next: 'irritado',
          },
          {
            label: 'Vou ligar no seu número antigo pra confirmar.',
            safe: true,
            feedback: 'Isso! Se o celular antigo atender, o golpe acabou.',
            next: 'fim_seguro',
          },
        ],
      },
      irritado: {
        lines: [
          'Ai, para com isso, não tenho tempo pra brincadeira! É urgente!',
          'Se não pagar até as cinco da tarde vai dar problema sério.',
        ],
        flags: ['Fica irritado e aumenta a pressão'],
        choices: [
          {
            label: 'Desculpa, vou pagar então.',
            safe: false,
            feedback: 'A irritação é uma tática para fazer você se sentir culpado e pagar logo.',
            next: 'fim_golpe',
          },
          {
            label: 'Sem confirmar, não faço Pix.',
            safe: true,
            feedback: 'Firme e correto. Um parente de verdade entenderia.',
            next: 'fim_seguro',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Golpe evitado!',
        text: 'Ligar para o número antigo, fazer uma chamada de vídeo ou perguntar algo que só a pessoa sabe resolve. Vale combinar uma palavra secreta com a família.',
      },
      fim_golpe: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'Não era seu parente. Golpistas pegam nomes e fotos em redes sociais e ligam para vários contatos. O dinheiro vai para a conta de outra pessoa.',
      },
    },
  },

  {
    id: 'falso-emprestimo',
    title: 'Falso empréstimo',
    summary: 'Uma empresa oferece crédito fácil, mas pede uma taxa antes de liberar.',
    icon: Banknote,
    caller: { name: 'Crédito Fácil', detail: 'Correspondente bancário', number: '(••) ••••-••••' },
    start: 'inicio',
    nodes: {
      inicio: {
        lines: [
          'Olá! Aqui é da Crédito Fácil, correspondente autorizado.',
          'Você foi pré-aprovado para R$ 15.000 com juros de apenas 0,79% ao mês, mesmo com nome sujo. Posso liberar hoje?',
        ],
        flags: ['Oferta boa demais', 'Crédito garantido sem análise'],
        choices: [
          {
            label: 'Nossa, quero sim!',
            safe: null,
            feedback: 'Dá vontade mesmo. Mas repare: você nem pediu esse empréstimo.',
            next: 'taxa',
          },
          {
            label: 'Não pedi empréstimo nenhum. Não tenho interesse.',
            safe: true,
            feedback: 'Perfeito. Oferta de crédito que chega sem você pedir merece desconfiança.',
            next: 'fim_seguro',
          },
        ],
      },
      taxa: {
        lines: [
          'Ótimo! Já está tudo aprovado. Só falta pagar a taxa de liberação e o seguro do contrato.',
          'São R$ 389,90 via Pix. Assim que cair, os R$ 15.000 entram na sua conta em até uma hora.',
        ],
        flags: ['Cobra uma taxa antes de liberar o dinheiro'],
        choices: [
          {
            label: 'Faço o Pix agora.',
            safe: false,
            feedback: 'Empresa de verdade desconta as taxas do próprio valor emprestado. Pagar antes é sinal de golpe.',
            next: 'taxa2',
          },
          {
            label: 'Pode descontar a taxa do valor do empréstimo?',
            safe: true,
            feedback: 'Pergunta certeira! Veja como ele vai fugir.',
            next: 'desculpa',
          },
        ],
      },
      desculpa: {
        lines: [
          'Infelizmente não é possível, é uma exigência do Banco Central.',
          'Mas a oferta só vale até hoje, viu? Amanhã os juros sobem.',
        ],
        flags: ['Cita um órgão oficial para parecer legítimo', 'Prazo curto'],
        choices: [
          {
            label: 'Tá bom, vou pagar.',
            safe: false,
            feedback: 'O Banco Central não exige taxa antecipada. Usar o nome dele é só para passar confiança.',
            next: 'taxa2',
          },
          {
            label: 'Então não quero.',
            safe: true,
            feedback: 'Decisão certa.',
            next: 'fim_seguro',
          },
        ],
      },
      taxa2: {
        lines: [
          'Recebemos! Só que o sistema encontrou uma pendência no seu CPF.',
          'Para regularizar, é preciso mais uma taxa de R$ 640. Depois disso, liberamos tudo.',
        ],
        flags: ['Aparece uma taxa nova a cada passo'],
        choices: [
          {
            label: 'Pago essa também, já paguei a primeira mesmo.',
            safe: false,
            feedback: 'É assim que esse golpe funciona: sempre aparece mais uma taxa. O empréstimo nunca existiu.',
            next: 'fim_golpe',
          },
          {
            label: 'Não pago mais nada. Quero meu dinheiro de volta.',
            safe: true,
            feedback: 'Parar agora evita perder ainda mais.',
            next: 'fim_parcial',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Golpe evitado!',
        text: 'Empréstimo de verdade não cobra nada adiantado. Antes de contratar crédito, confira se a empresa é autorizada no site do Banco Central.',
      },
      fim_parcial: {
        outcome: 'partial',
        title: 'Você parou a tempo',
        text: 'A primeira taxa foi perdida, mas você evitou perder mais. Na vida real: registre um boletim de ocorrência e peça o MED do Pix no seu banco o quanto antes.',
      },
      fim_golpe: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'Foram R$ 1.029,90 em "taxas" e nenhum empréstimo. Depois que a pessoa para de pagar, o golpista some.',
      },
    },
  },

  {
    id: 'codigo-whatsapp',
    title: 'Código do WhatsApp',
    summary: 'Uma "pesquisa de satisfação" oferece um prêmio e pede um código de SMS.',
    icon: MessageSquare,
    caller: { name: 'Pesquisa de Satisfação', detail: 'Número desconhecido', number: '(••) ••••-••••' },
    start: 'inicio',
    nodes: {
      inicio: {
        lines: [
          'Olá, aqui é da pesquisa de satisfação do aplicativo de entregas.',
          'Você ganhou um cupom de R$ 100! Para ativar, vou mandar um código por SMS. É só me dizer os números.',
        ],
        flags: ['Prêmio que você não pediu', 'Pede o código que chegou por SMS'],
        choices: [
          {
            label: 'Chegou: 731-264.',
            safe: false,
            feedback: 'Esse era o código de ativação do seu WhatsApp. Com ele, o golpista coloca sua conta no celular dele.',
            next: 'fim_golpe',
          },
          {
            label: 'O SMS diz "Seu código do WhatsApp". É isso mesmo?',
            safe: true,
            feedback: 'Ótimo que você leu a mensagem! O próprio SMS avisa para não compartilhar o código.',
            next: 'insiste',
          },
          {
            label: 'Nenhuma empresa precisa do meu código. Tchau!',
            safe: true,
            feedback: 'Exatamente.',
            next: 'fim_seguro',
          },
        ],
      },
      insiste: {
        lines: [
          'Sim, sim, é normal! A gente usa o WhatsApp para enviar o cupom.',
          'Mas tem que ser rapidinho, senão o cupom expira.',
        ],
        flags: ['Explicação que não faz sentido', 'Urgência'],
        choices: [
          {
            label: 'Ah, tá. É 731-264.',
            safe: false,
            feedback: 'A urgência fez você ignorar o aviso do próprio SMS.',
            next: 'fim_golpe',
          },
          {
            label: 'Não vou passar.',
            safe: true,
            feedback: 'Correto!',
            next: 'fim_seguro',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Golpe evitado!',
        text: 'Nenhum código que chega por SMS deve ser passado para outra pessoa. Ative também a confirmação em duas etapas no WhatsApp: Configurações › Conta.',
      },
      fim_golpe: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'O golpista assumiu seu WhatsApp e agora manda mensagens para seus contatos pedindo dinheiro em seu nome. A confirmação em duas etapas impede isso.',
      },
    },
  },
]

/** Finais usados por todos os cenários. */
export const COMMON_ENDINGS = {
  desligou: {
    outcome: 'safe',
    title: 'Você desligou',
    text: 'Desligar é sempre uma opção segura. Se você ficou em dúvida, ligue você mesmo para o número oficial da empresa ou fale direto com a pessoa.',
  },
  recusou: {
    outcome: 'safe',
    title: 'Você não atendeu',
    text: 'Não atender número desconhecido já evita muitos golpes. Quer ver como seria a ligação?',
  },
}

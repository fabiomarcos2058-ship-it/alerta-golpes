// Roteiros do Simulador de golpe.
// Todos os nomes, empresas, números e valores são FICTÍCIOS e servem só para treinar a
// reconhecer golpes comuns. "Banco Horizonte" e "Crédito Fácil" não existem.
//
// Estrutura de cada cenário:
//   nodes[id] = {
//     moment: 'Quando ele …'            // título do momento na análise final
//     lines: ['fala', { text, speaker: 'b' }, { hold: 2500 }, …]
//                                        // speaker 'b' = segunda pessoa (outro atendente)
//                                        // hold = música de espera (ms)
//     tactics: ['urgencia', …]           // truques usados nesta fala (ver TACTICS)
//     choices: [{ label, safe, feedback, why, next }],
//     next: 'id'                         // sem escolhas: segue direto
//   }
//   endings[id] = { outcome: 'safe' | 'partial' | 'scammed', title, text }
// safe: true = atitude segura · false = arriscada · null = neutra
// feedback = dica curta (modo treino) · why = explicação completa (análise final)
import { Landmark, Users, Banknote, MessageSquare } from 'lucide-react'

/** Truques usados pelos golpistas, explicados na análise final. */
export const TACTICS = {
  autoridade: {
    title: 'Se passa por alguém confiável',
    text: 'Dizer que é do banco, de uma empresa conhecida ou de um órgão oficial faz a gente confiar e obedecer sem questionar.',
  },
  medo: {
    title: 'Provoca medo',
    text: 'Uma compra que você não fez ou um problema na sua conta assustam. Com medo, fica difícil pensar com calma.',
  },
  dados: {
    title: 'Usa seus dados pessoais',
    text: 'Nome, CPF e final do cartão circulam em vazamentos de dados. O golpista saber essas informações não prova que ele é quem diz ser.',
  },
  falsaSeguranca: {
    title: 'Encena um atendimento oficial',
    text: 'Número de protocolo, "ligação gravada", falar mal de golpistas e transferir para outro setor são encenações para parecer uma empresa de verdade.',
  },
  codigo: {
    title: 'Pede código de SMS',
    text: 'Códigos que chegam por SMS liberam o acesso às suas contas e aplicativos. Ninguém de verdade pede esse código por telefone.',
  },
  urgencia: {
    title: 'Cria urgência',
    text: 'Prazos curtos como "em 10 minutos" ou "só até hoje" servem para você não ter tempo de pensar nem de pedir ajuda.',
  },
  contaSegura: {
    title: 'Fala em "conta segura"',
    text: 'Não existe conta segura. Nenhum banco pede para você transferir dinheiro para proteger o seu saldo.',
  },
  numeroNovo: {
    title: 'Liga de um número novo',
    text: '"Troquei de número" é a desculpa para falar de um telefone que você não conhece.',
  },
  semNome: {
    title: 'Não diz quem é',
    text: 'O golpista espera você falar um nome para assumir aquela identidade.',
  },
  fuga: {
    title: 'Foge das perguntas',
    text: 'Quando você pergunta algo direto, ele desconversa, culpa o sinal ou muda de assunto.',
  },
  emocao: {
    title: 'Apela para a emoção',
    text: 'Usar alguém que você ama deixa você preocupado e com vontade de ajudar rápido, sem conferir.',
  },
  segredo: {
    title: 'Pede segredo',
    text: 'Pedir para não contar a ninguém impede que outra pessoa perceba o golpe e avise você.',
  },
  culpa: {
    title: 'Faz você se sentir culpado',
    text: 'Frases como "você vai me deixar na mão?" pressionam você a desistir de confirmar.',
  },
  ofertaBoaDemais: {
    title: 'Oferta boa demais',
    text: 'Juros baixíssimos, aprovação garantida e "mesmo com nome sujo": quando é bom demais, desconfie.',
  },
  taxaAntecipada: {
    title: 'Cobra para liberar',
    text: 'Pagar uma taxa para receber dinheiro é o centro desse golpe. O valor prometido nunca chega.',
  },
  nomeOficial: {
    title: 'Usa o nome de órgão oficial',
    text: 'Citar o Banco Central, a Receita ou a polícia dá aparência de legalidade a uma exigência falsa.',
  },
  escalada: {
    title: 'Pedidos que só aumentam',
    text: 'Depois do primeiro pagamento, sempre aparece mais uma cobrança. Quanto mais você paga, mais difícil fica parar.',
  },
  premio: {
    title: 'Prêmio que você não pediu',
    text: 'Sorteios e cupons surpresa servem para você baixar a guarda.',
  },
  desculpaSemSentido: {
    title: 'Explicação que não faz sentido',
    text: 'Quando a justificativa não combina com o pedido (um cupom que precisa do código do seu WhatsApp), é golpe.',
  },
}

const DESLIGAR_WHY =
  'Desligar e procurar você mesmo o canal oficial é a atitude mais segura que existe. Você sai do controle do golpista e confere a história por um caminho que você escolheu.'

export const SCENARIOS = [
  // ─────────────────────────────────────────────────────────────── Falsa central
  {
    id: 'falso-banco',
    title: 'Falsa central do banco',
    summary: 'Uma "central de segurança" liga avisando de uma compra suspeita no seu cartão.',
    icon: Landmark,
    caller: { name: 'Central de Segurança', detail: 'Banco Horizonte', number: '0800 •••• ••••' },
    voices: { a: { pitch: 0.95 }, b: { pitch: 1.15 } },
    start: 'inicio',
    nodes: {
      inicio: {
        moment: 'Quando ele avisou de uma compra suspeita',
        lines: [
          'Alô, boa tarde! Aqui é o Rodrigo, da central de segurança do Banco Horizonte, tudo bem?',
          'Estou entrando em contato porque o nosso sistema segurou uma compra de R$ 2.847,90 no seu cartão, numa loja de eletrônicos em Manaus.',
          'Você reconhece essa compra?',
        ],
        tactics: ['autoridade', 'medo'],
        choices: [
          {
            label: 'Não, não fui eu! Pode cancelar.',
            safe: null,
            feedback: 'Reação natural, e é exatamente o susto que o golpista quer causar.',
            why: 'É o que quase todo mundo responde, e o golpista conta com isso. A partir do susto, ele passa a conduzir a conversa e você passa a seguir instruções. Ainda não é um erro grave, mas o ideal seria não continuar a ligação.',
            next: 'protocolo',
          },
          {
            label: 'Como eu sei que você é mesmo do banco?',
            safe: null,
            feedback: 'Boa desconfiança! Mas cuidado com a "prova" que ele vai dar.',
            why: 'Desconfiar foi ótimo. O problema é aceitar a "prova" que vem depois: dados pessoais vazam o tempo todo. Nada que ele diga prova que é o banco. A única confirmação segura é você mesmo ligar para o número oficial.',
            next: 'sabe_dados',
          },
          {
            label: 'Vou desligar e ligar no número que está atrás do meu cartão.',
            safe: true,
            feedback: 'Atitude perfeita.',
            why: DESLIGAR_WHY + ' Se a compra fosse real, o banco resolveria por lá.',
            next: 'fim_seguro',
          },
        ],
      },
      sabe_dados: {
        moment: 'Quando ele "provou" que era do banco',
        lines: [
          'Claro, entendo perfeitamente. Hoje em dia tem muito golpe, né?',
          'Olha, aqui no sistema consta o seu cartão final 4821 e o CPF começando com 123. Confere?',
          'Pode ficar tranquilo que essa ligação é gravada. Vamos resolver isso rapidinho pra você não ter prejuízo.',
        ],
        tactics: ['dados', 'falsaSeguranca'],
        choices: [
          {
            label: 'Confere, sim. Pode seguir.',
            safe: null,
            feedback: 'Saber seus dados não prova nada: eles vêm de vazamentos.',
            why: 'Ele usou dois truques de uma vez: mostrou seus dados e falou mal de golpistas para parecer do seu lado. "Ligação gravada" e número de protocolo também são só encenação.',
            next: 'protocolo',
          },
          {
            label: 'Mesmo assim, vou desligar e ligar no número oficial.',
            safe: true,
            feedback: 'Isso! Saber seus dados não prova que é o banco.',
            why: DESLIGAR_WHY,
            next: 'fim_seguro',
          },
        ],
      },
      protocolo: {
        moment: 'Quando ele pediu o código do SMS',
        lines: [
          'Perfeito. Já abri aqui o protocolo de cancelamento, número 2026 1103 447.',
          'Agora, pra confirmar que é você mesmo, o sistema vai mandar um código de seis números por SMS. Chegou aí?',
          'Pode ler pra mim, por favor, que eu já finalizo o cancelamento.',
        ],
        tactics: ['falsaSeguranca', 'codigo'],
        choices: [
          {
            label: 'Chegou sim: 4 8 2 9 1 5.',
            safe: false,
            feedback: 'Esse código libera sua conta em outro celular.',
            why: 'Esse foi o erro decisivo. O código de SMS serve para autorizar o acesso à sua conta, por exemplo, para ativar o aplicativo do banco em outro celular. Com ele, o golpista entra na sua conta como se fosse você. Banco nenhum pede esse código por telefone.',
            next: 'fim_codigo',
          },
          {
            label: 'Não vou passar nenhum código.',
            safe: true,
            feedback: 'Correto! Agora ele vai partir para a pressão.',
            why: 'Correto. Código de SMS é como uma chave: só você usa. Repare que, quando ouviu "não", ele mudou de estratégia e partiu para a pressão.',
            next: 'transfere',
          },
        ],
      },
      transfere: {
        moment: 'Quando ele transferiu a ligação e falou em "conta segura"',
        lines: [
          'Tudo bem, sem problema. Só um momento que vou transferir você para o setor de contestação.',
          { hold: 2600 },
          { speaker: 'b', text: 'Boa tarde, aqui é a Juliana, do setor de contestação. O Rodrigo já me passou o seu caso.' },
          { speaker: 'b', text: 'Olha, a situação é séria: tem mais duas compras na fila pra serem aprovadas daqui a dez minutos.' },
          { speaker: 'b', text: 'Pra proteger o seu dinheiro, vamos mover o seu saldo pra uma conta segura do banco enquanto o cartão é trocado. Vou te passar a chave Pix.' },
        ],
        tactics: ['falsaSeguranca', 'urgencia', 'contaSegura'],
        choices: [
          {
            label: 'Tá bom, me passa a chave que eu faço agora.',
            safe: false,
            feedback: 'Não existe "conta segura". O dinheiro vai para o golpista.',
            why: 'Não existe "conta segura". Nenhum banco pede para você transferir dinheiro para proteger o saldo. A chave Pix seria de um "laranja", uma conta usada só para receber dinheiro de golpes. A transferência para outro setor, com outra voz, serviu para parecer uma empresa grande.',
            next: 'fim_pix',
          },
          {
            label: 'Não vou transferir nada. Vou resolver pelo aplicativo.',
            safe: true,
            feedback: 'Perfeito.',
            why: 'Perfeito. Mesmo sob pressão, você não fez nada do que o golpista pediu. O aplicativo e o número atrás do cartão são os canais em que dá para confiar.',
            next: 'fim_seguro',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Você se protegeu!',
        text: 'Você saiu da ligação sem passar nenhum dado. Se a compra fosse real, o banco resolveria pelo número oficial.',
      },
      fim_codigo: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'Com o código, o golpista ativou a sua conta no celular dele. Em poucos minutos, ele consegue fazer Pix, pegar empréstimos no seu nome e esvaziar seu saldo.',
      },
      fim_pix: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'O dinheiro foi parar na conta de um laranja e, em minutos, é espalhado por outras contas. Quanto antes você avisar o banco, maior a chance de recuperar alguma parte.',
      },
    },
    howItWorks: [
      'O golpista consegue dados vazados (nome, CPF, final do cartão) e liga fingindo ser da central do banco. O número que aparece na tela pode ser falsificado para parecer oficial.',
      'Ele inventa uma compra suspeita para te assustar. Com medo, a gente obedece sem pensar.',
      'Usa nome, protocolo e "ligação gravada" para parecer um atendimento de verdade.',
      'Pede o código que chegou por SMS dizendo que é para cancelar a compra. Na verdade, o código libera a sua conta no celular dele.',
      'Se você recusa, ele "transfere" para outro setor e pede para você mandar o dinheiro para uma "conta segura", que é dele.',
    ],
    realLife: [
      'Desligue. Ligue você mesmo para o número atrás do cartão ou fale pelo aplicativo do banco.',
      'Se passou código ou senha, avise o banco na hora e peça o bloqueio do acesso à conta.',
      'Se fez Pix, peça ao seu banco o MED (Mecanismo Especial de Devolução). O prazo é de até 80 dias, mas quanto antes, maior a chance de recuperar o dinheiro.',
      'Guarde comprovantes e prints e registre um boletim de ocorrência, que pode ser feito pela internet na delegacia online do seu estado.',
    ],
  },

  // ─────────────────────────────────────────────────────────────── Falso parente
  {
    id: 'falso-parente',
    title: 'Falso parente',
    summary: 'Alguém liga de um número novo dizendo ser da família e precisando de dinheiro.',
    icon: Users,
    caller: { name: 'Número desconhecido', detail: 'Celular', number: '(••) 9••••-••••' },
    voices: { a: { pitch: 1.1 } },
    start: 'inicio',
    nodes: {
      inicio: {
        moment: 'Quando a ligação começou',
        lines: [
          'Alô? Alô! Oi, sou eu! Tá me ouvindo?',
          'Nossa, que sufoco… Meu celular caiu na água e eu tive que pegar um chip novo.',
          'Salva esse número aí, tá? É o meu agora.',
        ],
        tactics: ['numeroNovo', 'semNome'],
        choices: [
          {
            label: 'Quem tá falando?',
            safe: true,
            feedback: 'Boa! Repare como ele vai fugir da pergunta.',
            why: 'Ótima pergunta. Golpistas quase nunca dizem o nome primeiro: esperam você dizer. Repare como ele fugiu da resposta.',
            next: 'desvia',
          },
          {
            label: 'Oi, filho! Tudo bem com você?',
            safe: false,
            feedback: 'Você acabou de dizer quem ele deve fingir ser.',
            why: 'Sem perceber, você entregou a identidade que o golpista precisava. A partir daí, ele só precisa fingir ser seu filho. Por isso, deixe sempre a pessoa dizer quem é.',
            next: 'pedido',
          },
          {
            label: 'Vou desligar e ligar no seu número antigo pra confirmar.',
            safe: true,
            feedback: 'Excelente.',
            why: 'Excelente. Se o número antigo atender, o golpe acaba na hora. ' + DESLIGAR_WHY,
            next: 'fim_seguro',
          },
        ],
      },
      desvia: {
        moment: 'Quando você perguntou quem era',
        lines: [
          'Ué, não reconhece minha voz? Tô gripado, e o sinal aqui tá horrível.',
          'Mas escuta, deixa eu te falar, é rapidinho…',
        ],
        tactics: ['fuga'],
        next: 'pedido',
      },
      pedido: {
        moment: 'Quando ele pediu o Pix',
        lines: [
          'Tô sem acesso ao banco nesse celular novo e preciso pagar um boleto hoje, senão vai dar um problemão.',
          'São R$ 1.890. Faz um Pix pra mim? Amanhã cedinho eu te devolvo, juro.',
          'Ah, e não fala nada pra ninguém, tá? Depois eu te explico tudo.',
        ],
        tactics: ['emocao', 'urgencia', 'segredo'],
        choices: [
          {
            label: 'Tá bom, me passa a chave que eu faço.',
            safe: false,
            feedback: 'A chave estaria no nome de um desconhecido.',
            why: 'A chave Pix estaria no nome de um desconhecido, um sinal claro, mas na pressa e na preocupação muita gente nem olha. O pedido de segredo serviu justamente para você não comentar com alguém que poderia desconfiar.',
            next: 'fim_golpe',
          },
          {
            label: 'Antes, me fala uma coisa que só você saberia.',
            safe: true,
            feedback: 'Ótima ideia! Veja como ele reage.',
            why: 'Perfeito. Uma pergunta pessoal, como o nome do primeiro bichinho ou onde vocês passaram as últimas férias, desmonta o golpe. Melhor ainda: combine uma palavra secreta com a família.',
            next: 'irritado',
          },
          {
            label: 'Vou ligar no seu número antigo pra confirmar.',
            safe: true,
            feedback: 'Isso! Se o celular antigo atender, o golpe acabou.',
            why: 'Isso! Confirmar por outro caminho é a melhor defesa. Se o celular antigo atender, o golpe acabou.',
            next: 'fim_seguro',
          },
        ],
      },
      irritado: {
        moment: 'Quando você pediu uma confirmação',
        lines: [
          'Ai, sério? Não tenho tempo pra isso agora! É urgente, tô te falando!',
          'Se não pagar até as cinco, vai dar ruim pra mim. Você vai me deixar na mão?',
        ],
        tactics: ['urgencia', 'culpa'],
        choices: [
          {
            label: 'Desculpa… vou pagar então.',
            safe: false,
            feedback: 'Irritação e culpa são táticas para você desistir de conferir.',
            why: 'A irritação e a culpa ("você vai me deixar na mão?") foram usadas para você abrir mão da confirmação. Um parente de verdade entenderia a pergunta.',
            next: 'fim_golpe',
          },
          {
            label: 'Sem confirmar, não faço Pix.',
            safe: true,
            feedback: 'Firme e certo.',
            why: 'Firme e certo. Quem está mesmo em apuros entende a desconfiança, e o golpista normalmente desliga e vai tentar outra pessoa.',
            next: 'fim_seguro',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Golpe evitado!',
        text: 'Você não mandou dinheiro sem confirmar quem era. Um parente de verdade entende a desconfiança.',
      },
      fim_golpe: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'Não era seu parente. O dinheiro foi para a conta de um desconhecido, e é comum o golpista ligar de novo pedindo mais.',
      },
    },
    howItWorks: [
      'O golpista liga ou manda mensagem de um número desconhecido dizendo que trocou de celular.',
      'Ele não diz o nome: espera você dizer e assume essa identidade. Às vezes usa nomes e fotos tirados de redes sociais.',
      'Inventa uma emergência (um boleto, uma conta, um acidente) e pede um Pix rápido, prometendo devolver.',
      'Pede segredo, para ninguém próximo perceber o golpe.',
    ],
    realLife: [
      'Ligue para o número antigo da pessoa ou faça uma chamada de vídeo.',
      'Faça uma pergunta que só a pessoa saberia, ou combine uma palavra secreta com a família.',
      'Confira o nome de quem vai receber o Pix antes de confirmar. Se não for o da pessoa, pare.',
      'Se já pagou, avise o banco e peça o MED o quanto antes, e registre um boletim de ocorrência.',
    ],
  },

  // ─────────────────────────────────────────────────────────────── Falso empréstimo
  {
    id: 'falso-emprestimo',
    title: 'Falso empréstimo',
    summary: 'Uma empresa oferece crédito fácil, mas pede uma taxa antes de liberar.',
    icon: Banknote,
    caller: { name: 'Crédito Fácil', detail: 'Correspondente bancário', number: '(••) ••••-••••' },
    voices: { a: { pitch: 1.15 } },
    start: 'inicio',
    nodes: {
      inicio: {
        moment: 'Quando ela ofereceu o empréstimo',
        lines: [
          'Oi, tudo bem? Aqui é a Camila, da Crédito Fácil, correspondente bancário autorizado.',
          'Tô ligando com uma ótima notícia: o seu CPF foi pré-aprovado pra um crédito de R$ 15.000, com juros de só 0,79% ao mês.',
          'E o melhor: mesmo com nome negativado, sem consulta ao SPC. Posso seguir com a liberação?',
        ],
        tactics: ['ofertaBoaDemais', 'autoridade'],
        choices: [
          {
            label: 'Nossa, quero sim!',
            safe: null,
            feedback: 'Dá vontade mesmo. Mas você nem pediu esse empréstimo.',
            why: 'É normal se animar, ainda mais precisando de dinheiro. Mas repare: você não pediu esse empréstimo, e ninguém aprova crédito sem analisar nada. Esse já era o primeiro sinal.',
            next: 'taxa',
          },
          {
            label: 'Não pedi empréstimo nenhum, não tenho interesse.',
            safe: true,
            feedback: 'Perfeito.',
            why: 'Perfeito. Oferta de crédito que chega sem você pedir, com condições boas demais, merece desconfiança.',
            next: 'fim_seguro',
          },
        ],
      },
      taxa: {
        moment: 'Quando ela cobrou a taxa de liberação',
        lines: [
          'Maravilha! Já tá tudo aprovado aqui no sistema, falta só um detalhe.',
          'Pra liberar, tem a taxa de cadastro e o seguro do contrato, que dá R$ 389,90.',
          'É só fazer um Pix, e em até uma hora os quinze mil caem na sua conta.',
        ],
        tactics: ['taxaAntecipada'],
        choices: [
          {
            label: 'Faço o Pix agora.',
            safe: false,
            feedback: 'Pagar para receber é o golpe em si.',
            why: 'Esse é o golpe em si: pagar para receber. Uma instituição de verdade desconta as tarifas do próprio valor emprestado e nunca cobra antes de liberar.',
            next: 'taxa2',
          },
          {
            label: 'Por que vocês não descontam a taxa do valor do empréstimo?',
            safe: true,
            feedback: 'Pergunta certeira! Veja como ela foge.',
            why: 'Pergunta certeira, que derruba o golpe. Repare que ela não teve uma resposta lógica e apelou para o nome de um órgão oficial.',
            next: 'desculpa',
          },
        ],
      },
      desculpa: {
        moment: 'Quando você questionou a taxa',
        lines: [
          'Ah, infelizmente não dá, é uma exigência do Banco Central, sabe?',
          'E olha, essa condição é só até hoje, tá? Amanhã os juros voltam pro normal.',
        ],
        tactics: ['nomeOficial', 'urgencia'],
        choices: [
          {
            label: 'Tá bom, então eu pago.',
            safe: false,
            feedback: 'O Banco Central não exige taxa antecipada.',
            why: 'O Banco Central não exige taxa antecipada para empréstimo. Citar o nome dele foi só para a cobrança parecer legal.',
            next: 'taxa2',
          },
          {
            label: 'Então não quero.',
            safe: true,
            feedback: 'Decisão certa.',
            why: 'Decisão certa. Quando a resposta não convence e vem acompanhada de pressa, é hora de sair.',
            next: 'fim_seguro',
          },
        ],
      },
      taxa2: {
        moment: 'Quando apareceu uma nova cobrança',
        lines: [
          'Recebemos o seu pagamento, obrigada!',
          'Só que o sistema encontrou uma pendência no seu CPF. Pra regularizar, tem mais uma taxa de R$ 640.',
          'Pagando essa, a gente libera tudo hoje mesmo.',
        ],
        tactics: ['escalada'],
        choices: [
          {
            label: 'Pago essa também, já paguei a primeira mesmo.',
            safe: false,
            feedback: 'Sempre vai aparecer mais uma taxa.',
            why: 'É assim que o golpe se sustenta: sempre aparece mais uma cobrança, e a vontade de "não perder o que já pagou" faz a pessoa continuar. O empréstimo nunca existiu.',
            next: 'fim_golpe',
          },
          {
            label: 'Não pago mais nada. Quero meu dinheiro de volta.',
            safe: true,
            feedback: 'Parar agora evita perder mais.',
            why: 'Parar é a decisão certa, mesmo depois de ter pago. Insistir só aumentaria o prejuízo.',
            next: 'fim_parcial',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Golpe evitado!',
        text: 'Você não pagou nada. Empréstimo de verdade não cobra taxa antes de liberar o dinheiro.',
      },
      fim_parcial: {
        outcome: 'partial',
        title: 'Você parou a tempo',
        text: 'Você perdeu a primeira taxa, mas evitou perder mais. Na vida real, peça o MED ao seu banco e registre um boletim de ocorrência o quanto antes.',
      },
      fim_golpe: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'Foram R$ 1.029,90 em "taxas" e nenhum empréstimo. Quando a pessoa para de pagar, o golpista desaparece.',
      },
    },
    howItWorks: [
      'O golpista oferece um crédito que você não pediu, com condições boas demais: juros baixíssimos e aprovação mesmo com nome sujo.',
      'Diz que está tudo aprovado e que só falta pagar uma taxa (cadastro, seguro ou liberação).',
      'Quando você paga, aparece outra cobrança, e depois outra.',
      'O empréstimo nunca existe. O golpista some quando você para de pagar.',
    ],
    realLife: [
      'Nunca pague nada adiantado para receber um empréstimo.',
      'Antes de contratar, confira se a empresa é autorizada no site do Banco Central.',
      'Prefira pedir crédito pelo aplicativo do seu próprio banco.',
      'Se já pagou, peça o MED ao seu banco e registre um boletim de ocorrência.',
    ],
  },

  // ─────────────────────────────────────────────────────────────── Código do WhatsApp
  {
    id: 'codigo-whatsapp',
    title: 'Código do WhatsApp',
    summary: 'Uma "pesquisa de satisfação" oferece um prêmio e pede um código de SMS.',
    icon: MessageSquare,
    caller: { name: 'Pesquisa de Satisfação', detail: 'Número desconhecido', number: '(••) ••••-••••' },
    voices: { a: { pitch: 1.05 } },
    start: 'inicio',
    nodes: {
      inicio: {
        moment: 'Quando ele ofereceu o prêmio',
        lines: [
          'Olá, boa tarde! Aqui é da pesquisa de satisfação do aplicativo de entregas, tudo bem?',
          'Você foi sorteado entre os clientes mais ativos do mês e ganhou um cupom de R$ 100!',
          'Pra ativar, vou te mandar agora um código por SMS. É só me dizer os seis números, tá bom?',
        ],
        tactics: ['premio', 'codigo'],
        choices: [
          {
            label: 'Chegou: 731-264.',
            safe: false,
            feedback: 'Esse era o código de ativação do seu WhatsApp.',
            why: 'Esse era o código de ativação do seu WhatsApp. Com ele, o golpista instalou a sua conta no celular dele, e você foi desconectado.',
            next: 'fim_golpe',
          },
          {
            label: 'O SMS diz "Seu código do WhatsApp". É isso mesmo?',
            safe: true,
            feedback: 'Ótimo que você leu a mensagem!',
            why: 'Ótimo que você leu o SMS. O próprio WhatsApp avisa no texto para não compartilhar esse código com ninguém.',
            next: 'insiste',
          },
          {
            label: 'Nenhuma empresa precisa do meu código. Tchau!',
            safe: true,
            feedback: 'Exatamente.',
            why: 'Exatamente. Nenhuma empresa precisa de um código que chegou no seu celular, e um prêmio que você não pediu já é motivo para desconfiar.',
            next: 'fim_seguro',
          },
        ],
      },
      insiste: {
        moment: 'Quando você questionou o código',
        lines: [
          'Isso, isso, é normal! A gente usa o WhatsApp pra mandar o cupom pra você.',
          'Mas tem que ser rapidinho, viu? O cupom expira em cinco minutos.',
        ],
        tactics: ['desculpaSemSentido', 'urgencia'],
        choices: [
          {
            label: 'Ah, tá. É 731-264.',
            safe: false,
            feedback: 'A pressa fez você ignorar o aviso do SMS.',
            why: 'A urgência fez você ignorar o aviso do próprio SMS. Nenhum cupom depende do código do seu WhatsApp.',
            next: 'fim_golpe',
          },
          {
            label: 'Não vou passar.',
            safe: true,
            feedback: 'Correto!',
            why: 'Correto. A explicação não fazia sentido, e a pressa era só para você não pensar.',
            next: 'fim_seguro',
          },
        ],
      },
    },
    endings: {
      fim_seguro: {
        outcome: 'safe',
        title: 'Golpe evitado!',
        text: 'Você não passou o código. Aproveite para ativar a confirmação em duas etapas no WhatsApp.',
      },
      fim_golpe: {
        outcome: 'scammed',
        title: 'Você caiu no golpe',
        text: 'O golpista assumiu o seu WhatsApp e agora manda mensagens para seus contatos e grupos pedindo dinheiro em seu nome.',
      },
    },
    howItWorks: [
      'O golpista oferece um prêmio, um cupom ou uma vaga de emprego para você baixar a guarda.',
      'Ele tenta entrar no WhatsApp com o seu número. O WhatsApp então manda um código de confirmação para o seu celular.',
      'Se você passa o código, a sua conta passa a funcionar no celular do golpista e você é desconectado.',
      'Com a sua conta, ele pede dinheiro aos seus contatos se passando por você.',
    ],
    realLife: [
      'Nunca passe códigos que chegam por SMS, para ninguém.',
      'Ative a confirmação em duas etapas: WhatsApp › Configurações › Conta › Confirmação em duas etapas.',
      'Se perdeu o acesso, entre de novo no WhatsApp com o seu número. Se ele pedir um PIN que você não criou, procure o suporte do WhatsApp.',
      'Avise seus contatos por outro meio que o seu WhatsApp foi clonado.',
    ],
  },
]

/** Finais usados por todos os cenários. */
export const COMMON_ENDINGS = {
  desligou: {
    outcome: 'safe',
    title: 'Você desligou',
    text: 'Desligar é sempre uma opção segura. Se ficou em dúvida, ligue você mesmo para o número oficial da empresa ou fale direto com a pessoa.',
  },
  recusou: {
    outcome: 'safe',
    title: 'Você não atendeu',
    text: 'Não atender número desconhecido já evita muitos golpes. Quer ver como seria a ligação?',
  },
}

export const HANGUP_WHY = DESLIGAR_WHY

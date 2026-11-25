// Base de dados SIMULADA. Todos os números são fictícios (padrão DDD + 9000/3000…)
// e servem só para demonstrar a interface. Troque por chamadas à sua API real.

const DAY = 24 * 60 * 60 * 1000

export const PROFILES = [
  { phone: '11900014471', cats: ['falso-banco', 'pix'], n: 38, sev: { alto: 0.75, moderado: 0.25 } },
  { phone: '21900023390', cats: ['emprestimo'], n: 22, sev: { alto: 0.4, moderado: 0.6 } },
  { phone: '1130004551', cats: ['telemarketing'], n: 41, sev: { leve: 0.85, moderado: 0.15 } },
  { phone: '31900045518', cats: ['extorsao'], n: 9, sev: { alto: 1 } },
  { phone: '41900052286', cats: ['robocall'], n: 15, sev: { leve: 1 } },
  { phone: '11900068834', cats: ['whatsapp', 'falso-parente'], n: 12, sev: { alto: 0.6, moderado: 0.4 } },
  { phone: '51900077142', cats: ['telemarketing', 'robocall'], n: 6, sev: { leve: 0.7, moderado: 0.3 } },
  { phone: '61900081953', cats: ['falso-banco'], n: 3, sev: { moderado: 1 } },
  { phone: '85900093316', cats: ['emprestimo', 'pix'], n: 8, sev: { alto: 0.5, moderado: 0.3, leve: 0.2 } },
  { phone: '71900104427', cats: ['pix'], n: 11, sev: { alto: 0.9, moderado: 0.1 } },
  { phone: '19900119021', cats: ['robocall'], n: 4, sev: { leve: 1 } },
  { phone: '47900125563', cats: ['falso-parente'], n: 6, sev: { alto: 0.8, moderado: 0.2 } },
  { phone: '81900138874', cats: ['outro', 'telemarketing'], n: 2, sev: { leve: 1 } },
  { phone: '11900147736', cats: ['emprestimo', 'telemarketing'], n: 19, sev: { moderado: 0.6, leve: 0.4 } },
]

export const DESCRIPTIONS = {
  telemarketing: [
    'Liga todo dia no mesmo horário oferecendo plano de celular. Já pedi pra tirar meu número e continuam.',
    'Oferta de cartão de crédito. Quando digo que não tenho interesse, desligam e ligam de novo.',
    'Ligação insistente de "promoção de internet", às vezes 4 vezes por dia.',
    'Ligaram às 7 da manhã de domingo oferecendo portabilidade de plano.',
    'Atendente oferece seguro de vida e não aceita "não" como resposta.',
    'Mesma oferta de TV por assinatura, cada vez de um número parecido.',
  ],
  'falso-banco': [
    'Disseram ser da central de segurança do meu banco e que havia uma compra suspeita. Pediram para eu confirmar o código que chegou por SMS.',
    'Falso atendente sabia meu nome e CPF. Pediu pra transferir o saldo para uma "conta segura".',
    'Gravação dizendo que meu cartão foi clonado e para digitar a senha no teclado.',
    'Falaram de uma compra de R$ 2.300 numa loja de eletrônicos e mandaram eu instalar um aplicativo de "proteção".',
    'Ligação com musiquinha de espera igual à do banco. Depois pediram para eu ir ao caixa eletrônico.',
    'Disseram que um motoboy ia buscar meu cartão "bloqueado" em casa.',
  ],
  pix: [
    'Pediram um Pix urgente para "liberar" uma entrega retida nos Correios.',
    'Disseram que fiz um Pix por engano para eles e pediram devolução. Não houve Pix nenhum.',
    'Golpe do Pix agendado: mandaram comprovante falso e pediram o dinheiro de volta.',
    'Fingiram ser da loja onde comprei e pediram um Pix para "confirmar o pedido".',
    'Pediram Pix para uma chave aleatória dizendo que era taxa de cartório.',
  ],
  emprestimo: [
    'Ofereceram empréstimo pré-aprovado, mas pediram taxa antecipada via Pix para liberar.',
    'Falso correspondente bancário oferecendo consignado com juros baixos. Pediram foto do documento.',
    'Disseram que eu tinha crédito aprovado e só precisava pagar o "seguro" antes.',
    'Prometeram limpar meu nome e liberar crédito se eu pagasse uma taxa de análise.',
    'Mandaram contrato por WhatsApp com logo de banco e pediram depósito de R$ 390.',
  ],
  extorsao: [
    'Ameaçaram divulgar fotos minhas se eu não pagasse. Nunca mandei foto nenhuma.',
    'Disseram ser de facção e exigiram dinheiro para "não acontecer nada" com minha família.',
    'Falaram que estavam com meu filho e pediram dinheiro. Ele estava na escola, tudo bem.',
  ],
  robocall: [
    'Ligação muda, cai assim que atendo. Várias vezes por semana.',
    'Robô fala "alô?" e desliga. Provavelmente testando se o número está ativo.',
    'Gravação começa a falar de pesquisa e desliga no meio.',
    'Toca uma vez só e para. Quando retorno, cai numa mensagem estranha.',
  ],
  whatsapp: [
    'Pediram o código de 6 dígitos do WhatsApp dizendo ser de pesquisa de vacinação.',
    'Ligaram dizendo ser do aplicativo de entregas e pediram o código que chegou por SMS.',
    'Disseram que eu ganhei um brinde e precisavam do código para "confirmar o cadastro".',
    'Fingiram ser do suporte do WhatsApp e falaram que minha conta seria apagada.',
  ],
  'falso-parente': [
    'Voz parecida com a do meu filho dizendo que estava em apuros e precisava de dinheiro.',
    'Mensagem e depois ligação: "mãe, troquei de número", pedindo para pagar um boleto.',
    'Se passaram pela minha sobrinha, com foto dela no perfil, pedindo Pix emprestado.',
    'Disseram que meu neto sofreu um acidente e precisavam pagar o hospital na hora.',
  ],
  outro: [
    'Ligação estranha perguntando meu endereço completo para "atualização cadastral".',
    'Disseram que ganhei um prêmio de sorteio que nunca participei.',
    'Falso agente de saúde querendo agendar visita e pedindo meu CPF.',
  ],
}

/** PRNG determinístico (mulberry32) para a base ser sempre igual. */
function mulberry32(seed) {
  return function rand() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeighted(weights, rand) {
  const entries = Object.entries(weights)
  let r = rand() * entries.reduce((s, [, w]) => s + w, 0)
  for (const [key, w] of entries) {
    if ((r -= w) <= 0) return key
  }
  return entries[0][0]
}

export const pick = (list, rand) => list[Math.floor(rand() * list.length)]

/**
 * Cria uma denúncia. Só parte delas tem relato (como na vida real), e `used`
 * evita repetir o mesmo texto no mesmo número.
 */
export function makeReport(profile, createdAt, rand, id, used = new Set()) {
  const category = pick(profile.cats, rand)
  const free = DESCRIPTIONS[category].filter((d) => !used.has(d))
  const description = free.length && rand() < 0.45 ? pick(free, rand) : null
  if (description) used.add(description)
  return {
    id,
    phone: profile.phone,
    category,
    severity: pickWeighted(profile.sev, rand),
    description,
    createdAt,
  }
}

/** Gera ~200 denúncias espalhadas pelos últimos 90 dias, relativas a "agora". */
export function generateSeed(now = Date.now()) {
  const rand = mulberry32(2026)
  const reports = []
  PROFILES.forEach((profile, pIndex) => {
    const used = new Set()
    for (let i = 0; i < profile.n; i++) {
      // Distribuição concentrada nos dias mais recentes.
      const age = i === 0 ? (pIndex * 11 + rand() * 9) * 60 * 1000 : Math.pow(rand(), 2) * 90 * DAY
      reports.push(makeReport(profile, now - age, rand, `seed-${pIndex}-${i}`, used))
    }
  })
  return reports.sort((a, b) => b.createdAt - a.createdAt)
}

// Analisa o texto de um SMS / WhatsApp e aponta sinais comuns de golpe.
// Roda 100% no aparelho: nenhum texto é enviado para lugar nenhum.

const SIGNALS = [
  {
    id: 'codigo',
    title: 'Pede código ou senha',
    text: 'Nenhuma empresa pede o código que chegou por SMS ou a sua senha. Quem pede é golpista.',
    weight: 3,
    patterns: [/c[oó]digo/gi, /\bsenha\b/gi, /\btoken\b/gi, /\bpin\b/gi, /6 d[ií]gitos/gi],
  },
  {
    id: 'dinheiro',
    title: 'Pede Pix, depósito ou transferência',
    text: 'Pedido de dinheiro por mensagem é o objetivo final da maioria dos golpes. Confirme por outro caminho antes.',
    weight: 2,
    patterns: [/\bpix\b/gi, /transfer[eêi]\w*/gi, /dep[oó]sit\w*/gi, /chave/gi, /boleto/gi],
  },
  {
    id: 'urgencia',
    title: 'Cria urgência',
    text: 'Prazos curtos servem para você agir sem pensar e sem pedir ajuda.',
    weight: 1,
    patterns: [/urgente/gi, /\bagora\b/gi, /imediat\w*/gi, /\bhoje\b/gi, /expira\w*/gi, /[uú]ltim[ao]s? (?:horas?|dias?|chance)/gi, /\bprazo\b/gi, /bloquead\w*/gi, /suspens\w*/gi],
  },
  {
    id: 'familia',
    title: 'Diz que trocou de número',
    text: '"Troquei de número" é o início do golpe do falso parente. Ligue no número antigo ou faça uma chamada de vídeo.',
    weight: 3,
    patterns: [/troquei de (?:n[uú]mero|celular|chip)/gi, /mudei de n[uú]mero/gi, /n[uú]mero novo/gi, /celular (?:quebrou|caiu|foi roubado)/gi, /salva (?:esse|este|meu) n[uú]mero/gi],
  },
  {
    id: 'premio',
    title: 'Prêmio ou vantagem que você não pediu',
    text: 'Sorteios, cupons e brindes surpresa servem para você baixar a guarda.',
    weight: 2,
    patterns: [/parab[eé]ns/gi, /voc[eê] ganhou/gi, /\bganhou\b/gi, /pr[eê]mio/gi, /sortead\w*/gi, /cupom/gi, /brinde/gi, /resgat\w*/gi],
  },
  {
    id: 'link',
    title: 'Tem link para clicar',
    text: 'Links em mensagens inesperadas podem levar a sites falsos que roubam dados. Entre pelo aplicativo ou site oficial.',
    weight: 2,
    patterns: [/https?:\/\/\S+/gi, /www\.\S+/gi, /\b(?:bit\.ly|tinyurl\.com|encurtador\.com\.br|cutt\.ly)\/\S*/gi, /\b[\w-]+\.(?:xyz|top|click|link|online|site|shop)\b\S*/gi],
  },
  {
    id: 'autoridade',
    title: 'Diz ser de banco, empresa ou órgão público',
    text: 'Golpistas usam nomes conhecidos para parecer oficiais. Confira pelo canal oficial, nunca pelo contato da mensagem.',
    weight: 1,
    patterns: [/\bbanco\b/gi, /central de (?:seguran[cç]a|atendimento)/gi, /receita federal/gi, /correios/gi, /detran/gi, /\binss\b/gi, /serasa/gi, /gov\.br/gi],
  },
  {
    id: 'ameaca',
    title: 'Ameaça com dívida, multa ou polícia',
    text: 'Medo faz a gente obedecer. Órgãos oficiais não cobram por mensagem com ameaça.',
    weight: 2,
    patterns: [/d[ií]vida/gi, /protesto/gi, /\bmulta\b/gi, /negativa\w*/gi, /pol[ií]cia/gi, /pris[aã]o/gi, /processo judicial/gi, /mandado/gi],
  },
  {
    id: 'taxa',
    title: 'Cobra taxa para liberar algo',
    text: 'Pagar para receber (empréstimo, prêmio, encomenda) é golpe. O valor prometido nunca chega.',
    weight: 3,
    patterns: [/taxa de (?:libera[cç][aã]o|entrega|cadastro|desbloqueio)/gi, /pagamento antecipado/gi, /\bliberar\b/gi, /encomenda (?:retida|parada|presa)/gi],
  },
  {
    id: 'emprego',
    title: 'Oferta fácil de trabalho ou renda',
    text: 'Vagas que pagam para curtir vídeos ou fazer tarefas simples costumam terminar em pedido de dinheiro.',
    weight: 2,
    patterns: [/renda extra/gi, /trabalh\w* (?:em|de) casa/gi, /curtir v[ií]deos/gi, /\btarefas?\b/gi, /ganhe (?:at[eé] )?r\$/gi],
  },
  {
    id: 'segredo',
    title: 'Pede segredo',
    text: 'Pedir para não contar a ninguém impede que outra pessoa perceba o golpe.',
    weight: 2,
    patterns: [/n[aã]o (?:conta|conte|fala|fale|comenta|comente) (?:pra|para|com) ningu[eé]m/gi, /segredo/gi, /entre n[oó]s/gi],
  },
]

export const EXAMPLES = [
  {
    label: 'Falso parente',
    text: 'Oi mãe, troquei de número, salva esse aqui. Meu celular caiu na água. Preciso pagar um boleto hoje urgente, consegue fazer um Pix pra mim? Te devolvo amanhã. Não conta pra ninguém.',
  },
  {
    label: 'Falsa central',
    text: 'BANCO: Identificamos uma compra de R$ 2.847,90 no seu cartão. Se não reconhece, sua conta será bloqueada hoje. Responda com o código que enviamos por SMS para cancelar.',
  },
  {
    label: 'Encomenda',
    text: 'Correios: sua encomenda está retida. Pague a taxa de liberação de R$ 19,90 em até 24h pelo link: correios-entrega.xyz/pagar',
  },
  {
    label: 'Mensagem comum',
    text: 'Oi! A reunião de pais da escola vai ser na quinta às 19h. Até lá!',
  },
]

export const LEVELS = {
  alto: { label: 'Muito provável que seja golpe', tone: 'danger' },
  medio: { label: 'Atenção: tem sinais de golpe', tone: 'warn' },
  baixo: { label: 'Não encontramos sinais comuns de golpe', tone: 'safe' },
}

/** Devolve o nível, os sinais encontrados e os trechos para destacar no texto. */
export function analyzeMessage(text) {
  const found = []
  const ranges = []
  for (const signal of SIGNALS) {
    const hits = []
    for (const re of signal.patterns) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(text))) {
        hits.push(m[0])
        ranges.push([m.index, m.index + m[0].length])
        if (m[0].length === 0) re.lastIndex++
      }
    }
    if (hits.length) found.push({ ...signal, hits: [...new Set(hits.map((h) => h.toLowerCase()))] })
  }
  const score = found.reduce((s, f) => s + f.weight, 0)
  const level = score >= 5 || found.some((f) => f.weight === 3 && found.length >= 2) ? 'alto' : score >= 2 ? 'medio' : 'baixo'
  return { level, score, found: found.sort((a, b) => b.weight - a.weight), segments: segment(text, ranges) }
}

/** Divide o texto em pedaços normais e destacados (sem sobreposição). */
function segment(text, ranges) {
  const sorted = ranges.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const r of sorted) {
    const last = merged.at(-1)
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  const out = []
  let pos = 0
  for (const [a, b] of merged) {
    if (a > pos) out.push({ text: text.slice(pos, a), mark: false })
    out.push({ text: text.slice(a, b), mark: true })
    pos = b
  }
  if (pos < text.length) out.push({ text: text.slice(pos), mark: false })
  return out
}

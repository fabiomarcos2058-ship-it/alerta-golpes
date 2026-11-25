// Planos do Alerta Golpe. Assinatura SIMULADA: nenhum pagamento é feito e nenhum dado é pedido.
// Valores são uma proposta, a validar com pessoas, escolas e empresas.
import { Heart, ShieldPlus, House, GraduationCap, Building2, Landmark } from 'lucide-react'

export const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: n % 1 ? 2 : 0 })

export const GROUPS = [
  { id: 'pessoas', label: 'Para você e sua família' },
  { id: 'instituicoes', label: 'Para escolas e empresas' },
]

export const PLANS = [
  {
    id: 'gratuito',
    group: 'pessoas',
    name: 'Gratuito',
    audience: 'Para qualquer pessoa',
    icon: Heart,
    price: 'R$ 0',
    period: 'para sempre',
    pitch: 'Tudo o que protege você contra golpes, sem anúncios e sem cadastro.',
    highlights: ['Consultar e denunciar números', 'Avisos sobre as suas denúncias', 'Simulador com os 4 golpes principais', 'Analisar mensagens e dicas'],
  },
  {
    id: 'plus',
    group: 'pessoas',
    name: 'Plus',
    audience: 'Para quem quer proteção completa',
    icon: ShieldPlus,
    price: 'R$ 19,90',
    period: 'por mês',
    priceNote: 'ou R$ 199 por ano (2 meses grátis)',
    monthly: 19.9,
    yearly: 199,
    pitch: 'Treino completo e avisos dos números que você acompanha.',
    highlights: ['Tudo do Gratuito', 'Golpes extras no simulador', 'Relatório do seu treino', 'Lista sem limite, com avisos', 'Pedido de revisão com prioridade'],
    popular: true,
  },
  {
    id: 'familia',
    group: 'pessoas',
    name: 'Família',
    audience: 'Para proteger até 6 pessoas',
    icon: House,
    price: 'R$ 39,90',
    period: 'por mês',
    priceNote: 'ou R$ 399 por ano (2 meses grátis)',
    monthly: 39.9,
    yearly: 399,
    panel: 'família',
    pitch: 'Cuide de quem mais cai em golpe: pais, avós e filhos.',
    highlights: ['Tudo do Plus para 6 pessoas', 'Painel da família com o treino de cada um', 'Aviso quando alguém consulta um número perigoso', 'Suporte por e-mail'],
  },
  {
    id: 'escolas',
    group: 'instituicoes',
    name: 'Escolas',
    audience: 'Para professores e escolas',
    icon: GraduationCap,
    price: 'R$ 1.490',
    period: 'por ano',
    priceNote: 'Escola pública: R$ 690 por ano',
    yearlyPrivate: 1490,
    yearlyPublic: 690,
    panel: 'turma',
    pitch: 'Transforme o simulador numa aula prática de educação digital.',
    highlights: ['Tudo do Plus para alunos e professores', 'Painel da turma com os resultados', 'Plano de aula pronto', 'Certificado de participação'],
  },
  {
    id: 'empresas',
    group: 'instituicoes',
    name: 'Empresas',
    audience: 'Para equipes de qualquer tamanho',
    icon: Building2,
    price: 'R$ 12,90',
    period: 'por pessoa por mês',
    priceNote: 'A partir de 20 pessoas',
    perPerson: 12.9,
    minPeople: 20,
    panel: 'equipe',
    pitch: 'Treine a equipe inteira e reduza quem cai em golpes.',
    highlights: ['Tudo do Plus para cada pessoa', 'Painel da equipe e relatórios', 'Golpes extras, como o falso fornecedor', 'Treinamento guiado'],
    popular: true,
  },
  {
    id: 'bancos',
    group: 'instituicoes',
    name: 'Bancos e operadoras',
    audience: 'Para proteger milhões de clientes',
    icon: Landmark,
    price: 'R$ 9.900',
    period: 'por mês',
    priceNote: 'Contrato anual. Acima de 1 milhão de clientes, sob consulta',
    tiers: [
      { id: 'ate-100mil', label: 'Até 100 mil clientes', monthly: 9900 },
      { id: 'ate-1mi', label: 'Até 1 milhão de clientes', monthly: 24900 },
      { id: 'acima', label: 'Mais de 1 milhão', monthly: null },
    ],
    panel: 'equipe',
    pitch: 'Avise seus clientes antes do golpe, direto no seu aplicativo.',
    highlights: ['Tudo do Empresas', 'Consulta de números por integração (API)', 'Mapa de golpes por região', 'Gerente de conta dedicado'],
  },
]

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]))

// Comparação por grupo. `true` = incluído, `false` = não incluído, texto = detalhe.
export const FEATURES = {
  pessoas: [
    { label: 'Consultar e denunciar números', values: { gratuito: true, plus: true, familia: true } },
    { label: 'Avisos sobre as suas denúncias', values: { gratuito: true, plus: true, familia: true } },
    { label: 'Simulador com os 4 golpes principais', values: { gratuito: true, plus: true, familia: true } },
    { label: 'Analisar mensagens', values: { gratuito: true, plus: true, familia: true } },
    { label: 'Sem anúncios', values: { gratuito: true, plus: true, familia: true } },
    { label: 'Minha lista de números', values: { gratuito: 'Até 5 números', plus: 'Sem limite', familia: 'Sem limite' } },
    { label: 'Avisos dos números da minha lista', values: { gratuito: false, plus: true, familia: true } },
    { label: 'Golpes extras no simulador', values: { gratuito: '1 treino grátis de cada', plus: 'Sem limite', familia: 'Sem limite' } },
    { label: 'Relatório do seu treino', values: { gratuito: false, plus: true, familia: true } },
    { label: 'Pessoas protegidas', values: { gratuito: '1', plus: '1', familia: 'Até 6' } },
    { label: 'Painel da família', values: { gratuito: false, plus: false, familia: true } },
    { label: 'Pedido de revisão de número', values: { gratuito: 'Em até 7 dias', plus: 'Em até 2 dias', familia: 'Em até 2 dias' } },
    { label: 'Suporte', values: { gratuito: 'Pelo feedback do site', plus: 'Pelo feedback do site', familia: 'Por e-mail' } },
  ],
  instituicoes: [
    { label: 'Tudo do plano Plus para cada pessoa', values: { escolas: true, empresas: true, bancos: true } },
    { label: 'Golpes extras no simulador', values: { escolas: true, empresas: true, bancos: true } },
    { label: 'Painel com várias pessoas', values: { escolas: 'Turmas sem limite', empresas: 'Equipe inteira', bancos: 'Equipe inteira' } },
    { label: 'Material de apoio', values: { escolas: 'Plano de aula pronto', empresas: 'Treinamento guiado', bancos: 'Treinamento guiado' } },
    { label: 'Certificado de participação', values: { escolas: true, empresas: true, bancos: true } },
    { label: 'Consulta por integração (API)', values: { escolas: false, empresas: false, bancos: true } },
    { label: 'Aviso de golpe no app do cliente', values: { escolas: false, empresas: false, bancos: true } },
    { label: 'Mapa de golpes por região', values: { escolas: false, empresas: false, bancos: true } },
    { label: 'Suporte', values: { escolas: 'Por e-mail', empresas: 'Prioritário', bancos: 'Gerente dedicado' } },
  ],
}

/** O que o plano gratuito NÃO tem, em comparação com os pagos. */
export const FREE_LIMITS = [
  'Minha lista guarda no máximo 5 números, sem avisos',
  'Golpes extras do simulador: só 1 treino grátis de cada',
  'Sem relatório do seu treino no simulador',
  'Protege só você, sem painel da família, turma ou equipe',
  'Pedido de revisão de número analisado em até 7 dias',
  'Sem material de aula, treinamento guiado ou integração (API)',
]

export const LIST_LIMIT = 5
export const TRIAL_DAYS = 7
export const TRIAL_PLAN = 'plus'

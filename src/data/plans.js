// Planos do Alerta Golpe. Assinatura SIMULADA: nenhum pagamento é feito e nenhum dado é pedido.
// Valores iguais aos da apresentação (propostas, a validar com escolas e empresas).
import { Heart, GraduationCap, Building2 } from 'lucide-react'

export const PLANS = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    audience: 'Para qualquer pessoa',
    icon: Heart,
    price: 'R$ 0',
    period: 'para sempre',
    pitch: 'Tudo o que protege você contra golpes, sem anúncios e sem cadastro.',
    highlights: ['Consultar e denunciar números', 'Simulador com os 4 golpes', 'Analisar mensagens', 'Dicas e passo a passo se cair num golpe'],
  },
  {
    id: 'escolas',
    name: 'Escolas',
    audience: 'Para professores e escolas',
    icon: GraduationCap,
    price: 'R$ 0',
    period: 'escola pública',
    priceNote: 'Escola particular: R$ 490 por ano',
    pitch: 'Transforme o simulador numa aula prática de educação digital.',
    highlights: ['Tudo do Gratuito', 'Painel da turma com os resultados', 'Golpes extras no simulador', 'Plano de aula pronto'],
  },
  {
    id: 'empresas',
    name: 'Empresas e bancos',
    audience: 'Para equipes e clientes',
    icon: Building2,
    price: 'R$ 4,90',
    period: 'por pessoa por mês',
    priceNote: 'A partir de 10 pessoas',
    pitch: 'Treine a equipe inteira e reduza quem cai em golpes.',
    highlights: ['Tudo do Gratuito', 'Painel da equipe e relatórios', 'Golpes extras, como o falso fornecedor', 'Consulta de números por integração (API)'],
  },
]

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]))

// Comparação. `true` = incluído, `false` = não incluído, texto = detalhe.
export const FEATURES = [
  { label: 'Consultar números', values: [true, true, true] },
  { label: 'Denunciar números', values: [true, true, true] },
  { label: 'Simulador com os 4 golpes principais', values: [true, true, true] },
  { label: 'Analisar mensagens', values: [true, true, true] },
  { label: 'Sem anúncios', values: [true, true, true] },
  { label: 'Minha lista de números', values: ['Até 5 números', 'Sem limite', 'Sem limite'] },
  { label: 'Golpes extras no simulador', values: [false, 'Vaga falsa e falso fornecedor', 'Vaga falsa e falso fornecedor'] },
  { label: 'Relatório do seu treino', values: [false, true, true] },
  { label: 'Painel com várias pessoas', values: [false, 'Turmas sem limite', 'Equipe inteira'] },
  { label: 'Material de apoio', values: [false, 'Plano de aula pronto', 'Treinamento guiado'] },
  { label: 'Consulta por integração (API)', values: [false, false, true] },
  { label: 'Suporte', values: ['Pelo feedback do site', 'Por e-mail', 'Prioritário'] },
]

/** O que o plano gratuito NÃO tem, em comparação com os pagos. */
export const FREE_LIMITS = [
  'Minha lista guarda no máximo 5 números',
  'Só os 4 golpes principais no simulador, sem os golpes extras',
  'Sem relatório do seu treino no simulador',
  'Sem painel para acompanhar uma turma ou uma equipe',
  'Sem material de aula ou treinamento guiado',
  'Sem consulta de números por integração (API)',
]

export const LIST_LIMIT = 5
export const TRIAL_DAYS = 7

export const MIN_PEOPLE = 10
export const PRICE_PER_PERSON = 4.9
export const SCHOOL_PRIVATE_YEAR = 490

export const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

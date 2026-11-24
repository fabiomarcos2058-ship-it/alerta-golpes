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
    highlights: ['Tudo do Gratuito', 'Painel da turma com os resultados', 'Cenários extras para jovens', 'Plano de aula pronto'],
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
    highlights: ['Tudo do Gratuito', 'Painel da equipe e relatórios', 'Golpes do seu setor', 'Consulta de números por integração (API)'],
  },
]

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]))

// Comparação. `true` = incluído, `false` = não incluído, texto = detalhe.
export const FEATURES = [
  { label: 'Consultar números', values: [true, true, true] },
  { label: 'Denunciar números', values: [true, true, true] },
  { label: 'Simulador com os 4 golpes', values: [true, true, true] },
  { label: 'Analisar mensagens', values: [true, true, true] },
  { label: 'Sem anúncios', values: [true, true, true] },
  { label: 'Minha lista de números', values: ['Só neste aparelho', 'Em qualquer aparelho', 'Em qualquer aparelho'] },
  { label: 'Painel com várias pessoas', values: [false, 'Turmas sem limite', 'Equipe inteira'] },
  { label: 'Relatório de acertos no simulador', values: [false, 'Por turma', 'Por equipe e setor'] },
  { label: 'Cenários extras de golpe', values: [false, 'Golpes comuns entre jovens', 'Golpes do seu setor'] },
  { label: 'Material de apoio', values: [false, 'Plano de aula pronto', 'Treinamento guiado'] },
  { label: 'Consulta por integração (API)', values: [false, false, true] },
  { label: 'Suporte', values: ['Pelo feedback do site', 'Por e-mail', 'Prioritário'] },
]

/** O que o plano gratuito NÃO tem, em comparação com os pagos. */
export const FREE_LIMITS = [
  'A lista de números fica salva só no aparelho em que você está',
  'Não tem painel para acompanhar uma turma ou uma equipe',
  'Não gera relatório de acertos do simulador',
  'Só os 4 golpes principais no simulador, sem cenários extras',
  'Sem material de aula ou treinamento guiado',
  'Sem consulta de números por integração (API)',
]

export const MIN_PEOPLE = 10
export const PRICE_PER_PERSON = 4.9
export const SCHOOL_PRIVATE_YEAR = 490

export const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

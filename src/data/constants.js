import {
  Megaphone, Landmark, Zap, Banknote, Siren, Bot, MessageSquare, Users, CircleHelp,
  ShieldX, ShieldAlert, ShieldCheck,
} from 'lucide-react'

export const CATEGORIES = [
  { id: 'telemarketing', label: 'Telemarketing abusivo', icon: Megaphone },
  { id: 'falso-banco', label: 'Falsa central de banco', icon: Landmark },
  { id: 'pix', label: 'Fraude de Pix', icon: Zap },
  { id: 'emprestimo', label: 'Falso empréstimo', icon: Banknote },
  { id: 'extorsao', label: 'Extorsão / ameaça', icon: Siren },
  { id: 'robocall', label: 'Robocall / ligação muda', icon: Bot },
  { id: 'whatsapp', label: 'Clonagem de WhatsApp', icon: MessageSquare },
  { id: 'falso-parente', label: 'Falso parente', icon: Users },
  { id: 'outro', label: 'Outro', icon: CircleHelp },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export const SEVERITIES = [
  { id: 'leve', label: 'Leve', hint: 'Incômodo, insistente', weight: 1, dot: 'bg-sky-400', ring: 'peer-checked:border-sky-400 peer-checked:bg-sky-400/10' },
  { id: 'moderado', label: 'Moderado', hint: 'Pediu dados ou dinheiro', weight: 2, dot: 'bg-amber-400', ring: 'peer-checked:border-amber-400 peer-checked:bg-amber-400/10' },
  { id: 'alto', label: 'Alto', hint: 'Golpe, ameaça ou prejuízo', weight: 4, dot: 'bg-red-500', ring: 'peer-checked:border-red-500 peer-checked:bg-red-500/10' },
]

export const SEVERITY_BY_ID = Object.fromEntries(SEVERITIES.map((s) => [s.id, s]))

export const STATUS = {
  perigoso: {
    label: 'Perigoso',
    sublabel: 'Golpe confirmado pela comunidade',
    icon: ShieldX,
    text: 'text-red-400',
    badge: 'bg-red-500/15 text-red-300 ring-red-500/40',
    glow: 'from-red-500/25',
    bar: 'bg-red-500',
  },
  suspeito: {
    label: 'Suspeito',
    sublabel: 'Muitas reclamações registradas',
    icon: ShieldAlert,
    text: 'text-amber-300',
    badge: 'bg-amber-400/15 text-amber-200 ring-amber-400/40',
    glow: 'from-amber-400/20',
    bar: 'bg-amber-400',
  },
  seguro: {
    label: 'Seguro',
    sublabel: 'Sem registros na nossa base',
    icon: ShieldCheck,
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
    glow: 'from-emerald-500/20',
    bar: 'bg-emerald-500',
  },
}

/**
 * Regra de classificação (ajuste à vontade):
 * - sem denúncias            → seguro
 * - 3+ denúncias "Alto", ou ao menos 1 "Alto" e pontuação ≥ 12 → perigoso
 * - qualquer outro caso      → suspeito (ex.: telemarketing insistente)
 * Pontuação = soma dos pesos (Leve 1, Moderado 2, Alto 4).
 */
export function classify(reports) {
  if (!reports.length) return 'seguro'
  const score = reports.reduce((sum, r) => sum + (SEVERITY_BY_ID[r.severity]?.weight ?? 1), 0)
  const altos = reports.filter((r) => r.severity === 'alto').length
  if (altos >= 3 || (altos >= 1 && score >= 12)) return 'perigoso'
  return 'suspeito'
}

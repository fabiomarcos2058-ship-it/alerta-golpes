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
  { id: 'leve', label: 'Leve', adj: 'leve', hint: 'Incômodo, insistente', weight: 1, dot: 'bg-sky-500', ring: 'peer-checked:border-brand peer-checked:bg-brand-tint' },
  { id: 'moderado', label: 'Moderado', adj: 'moderada', hint: 'Pediu dados ou dinheiro', weight: 2, dot: 'bg-amber-500', ring: 'peer-checked:border-warn peer-checked:bg-warn-tint' },
  { id: 'alto', label: 'Alto', adj: 'alta', hint: 'Golpe, ameaça ou prejuízo', weight: 4, dot: 'bg-red-600', ring: 'peer-checked:border-danger peer-checked:bg-danger-tint' },
]

export const SEVERITY_BY_ID = Object.fromEntries(SEVERITIES.map((s) => [s.id, s]))

export const STATUS = {
  perigoso: {
    label: 'Perigoso',
    sublabel: 'Golpe confirmado por várias pessoas',
    icon: ShieldX,
    text: 'text-danger',
    tint: 'bg-danger-tint',
    border: 'border-danger/25',
    badge: 'bg-danger-tint text-danger ring-danger/25',
    bar: 'bg-danger',
    advice: 'Não atenda e não retorne. Se já falou com essa pessoa, não passe códigos, senhas nem faça Pix.',
  },
  suspeito: {
    label: 'Suspeito',
    sublabel: 'Há denúncias registradas',
    icon: ShieldAlert,
    text: 'text-warn',
    tint: 'bg-warn-tint',
    border: 'border-warn/25',
    badge: 'bg-warn-tint text-warn ring-warn/25',
    bar: 'bg-amber-500',
    advice: 'Atenda com cuidado. Na dúvida, desligue e ligue você mesmo para o número oficial da empresa.',
  },
  seguro: {
    label: 'Sem denúncias',
    sublabel: 'Nenhum registro na nossa base',
    icon: ShieldCheck,
    text: 'text-safe',
    tint: 'bg-safe-tint',
    border: 'border-safe/25',
    badge: 'bg-safe-tint text-safe ring-safe/25',
    bar: 'bg-safe',
    advice: 'Isso não garante que é confiável: golpistas trocam de número o tempo todo. Nunca passe códigos ou senhas.',
  },
}

/**
 * Regra de classificação — a MESMA usada no banco (supabase/schema.sql → _status_numero):
 * - sem denúncias                                          → seguro
 * - 3+ pessoas marcaram "Alto", ou 5+ pessoas e 1 "Alto"   → perigoso
 * - qualquer outro caso                                    → suspeito
 * Contar pessoas diferentes impede que uma só pessoa "queime" um número.
 */
export function classifyCounts({ total, reporters, reportersAlto }) {
  if (!total) return 'seguro'
  if (reportersAlto >= 3 || (reporters >= 5 && reportersAlto >= 1)) return 'perigoso'
  return 'suspeito'
}

/** Texto curto que acompanha o selo de status. */
export function statusSublabel(result) {
  if (result.telemarketingPrefix && result.total === 0) return 'ligação de telemarketing'
  if (result.status === 'suspeito' && result.total < 5) return 'Poucas denúncias, fique atento'
  return STATUS[result.status].sublabel
}

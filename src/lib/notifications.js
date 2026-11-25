// Avisos SIMULADOS. Nada é enviado para o celular: os avisos são criados neste aparelho,
// com horários no futuro, e aparecem quando a hora chega. Na demonstração eles chegam
// em segundos; num serviço de verdade levariam dias.
import { formatPhone } from '../utils/phone'

const SEC = 1000

/** Número de 0 a 99 que é sempre o mesmo para o mesmo telefone. */
function hash(phone) {
  let h = 7
  for (const c of String(phone)) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h % 100
}

const make = (kind, phone, title, text, delay, now) => ({
  id: `${kind}-${phone ?? 'geral'}-${now + delay}`,
  kind,
  phone: phone ?? null,
  title,
  text,
  at: now + delay,
  read: false,
})

/** O que acontece com uma denúncia depois de enviada. */
export function reportNotifications(phone, now = Date.now()) {
  const n = formatPhone(phone)
  const h = hash(phone)
  const others = 2 + (h % 6)
  const list = [
    make('received', phone, 'Denúncia recebida', `Sua denúncia de ${n} foi registrada. Avisamos aqui quando houver novidade.`, 0, now),
    make('confirmed', phone, 'Outras pessoas confirmaram', `Mais ${others} pessoas denunciaram ${n} depois de você. Quem consultar esse número agora vê o alerta.`, 20 * SEC, now),
  ]
  if (h < 60) {
    list.push(make('blocked', phone, 'Número bloqueado', `A operadora bloqueou a linha ${n} depois das denúncias. Obrigado por proteger outras pessoas.`, 50 * SEC, now))
  } else if (h < 85) {
    list.push(
      make('removed', phone, 'Denúncia apagada', `O dono da linha ${n} pediu revisão e mostrou que o número foi clonado. As denúncias foram apagadas para não prejudicar uma pessoa inocente.`, 50 * SEC, now)
    )
  } else {
    list.push(make('expired', phone, 'Alerta arquivado', `${n} ficou 90 dias sem novas denúncias e o alerta foi arquivado. Se ele ligar de novo, denuncie outra vez.`, 50 * SEC, now))
  }
  return list
}

/** Avisos de um número salvo na lista (planos pagos). */
export function watchNotifications(phone, now = Date.now()) {
  const extra = 1 + (hash(phone) % 4)
  return [
    make('list', phone, 'Novidade num número da sua lista', `${formatPhone(phone)} recebeu ${extra} ${extra === 1 ? 'nova denúncia' : 'novas denúncias'} hoje. Continue sem atender.`, 30 * SEC, now),
  ]
}

/** Pedido de revisão de quem diz ser o dono do número. */
export function reviewNotifications(phone, days, now = Date.now()) {
  const n = formatPhone(phone)
  return [
    make('review', phone, 'Pedido de revisão recebido', `Vamos analisar as denúncias de ${n} em até ${days} dias.`, 0, now),
  ]
}

/** Resultado da revisão, enviado quando a moderação decide. */
export function reviewDecisionNotification(phone, approved, now = Date.now()) {
  const n = formatPhone(phone)
  return approved
    ? make('review-done', phone, 'Revisão aceita', `As denúncias de ${n} foram apagadas e o número ficou marcado como "revisado".`, 0, now)
    : make('review-denied', phone, 'Revisão recusada', `As denúncias de ${n} continuam, porque várias pessoas relataram o mesmo golpe. Se algo mudar, você pode pedir de novo.`, 0, now)
}

export function welcomeNotification(now = Date.now()) {
  return make('welcome', null, 'Boas-vindas ao Alerta Golpe', 'Aqui aparecem os avisos sobre os números que você denunciou: quando forem confirmados, bloqueados ou apagados.', 0, now)
}

/** Situação atual de uma denúncia, a partir dos avisos que já chegaram. */
const STAGE = { received: 1, confirmed: 2, blocked: 3, removed: 3, expired: 3 }
export function reportStage(phone, visible) {
  let best = null
  for (const item of visible) {
    if (item.phone === phone && STAGE[item.kind] && (!best || STAGE[item.kind] >= STAGE[best])) best = item.kind
  }
  return best ?? 'received'
}

/** Estimativa (demonstração) de quantas pessoas viram o alerta graças a uma denúncia. */
export const helpedBy = (phone) => 12 + (hash(phone) % 40)

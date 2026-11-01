// Utilitários de telefone brasileiro: normalização, formatação, máscara e validação.

const DDD_UF = {
  11: 'SP', 12: 'SP', 13: 'SP', 14: 'SP', 15: 'SP', 16: 'SP', 17: 'SP', 18: 'SP', 19: 'SP',
  21: 'RJ', 22: 'RJ', 24: 'RJ', 27: 'ES', 28: 'ES',
  31: 'MG', 32: 'MG', 33: 'MG', 34: 'MG', 35: 'MG', 37: 'MG', 38: 'MG',
  41: 'PR', 42: 'PR', 43: 'PR', 44: 'PR', 45: 'PR', 46: 'PR',
  47: 'SC', 48: 'SC', 49: 'SC', 51: 'RS', 53: 'RS', 54: 'RS', 55: 'RS',
  61: 'DF', 62: 'GO', 64: 'GO', 63: 'TO', 65: 'MT', 66: 'MT', 67: 'MS', 68: 'AC', 69: 'RO',
  71: 'BA', 73: 'BA', 74: 'BA', 75: 'BA', 77: 'BA', 79: 'SE',
  81: 'PE', 87: 'PE', 82: 'AL', 83: 'PB', 84: 'RN', 85: 'CE', 88: 'CE', 86: 'PI', 89: 'PI',
  91: 'PA', 93: 'PA', 94: 'PA', 92: 'AM', 97: 'AM', 95: 'RR', 96: 'AP', 98: 'MA', 99: 'MA',
}

export const onlyDigits = (value = '') => String(value).replace(/\D/g, '')

/**
 * Remove +55 e zeros de operadora, devolvendo só DDD + número.
 * Números com prefixo 0303 (telemarketing) são mantidos como estão.
 */
export function normalizePhone(value) {
  let d = onlyDigits(value)
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2)
  if (d.startsWith('0303')) return d.slice(0, 12)
  if (d.length < 4 && '0303'.startsWith(d)) return d // ainda digitando "0303"
  return d.replace(/^0+/, '').slice(0, 11)
}

export const isTelemarketingPrefix = (digits) => digits.startsWith('0303')

export const isValidDDD = (ddd) => Boolean(DDD_UF[Number(ddd)])
export const ufFromDDD = (ddd) => DDD_UF[Number(ddd)] ?? null

export function isValidPhone(digits) {
  if (isTelemarketingPrefix(digits)) return /^0303\d{6,8}$/.test(digits)
  return (digits.length === 10 || digits.length === 11) && isValidDDD(digits.slice(0, 2))
}

export const isDDDQuery = (digits) => digits.length === 2 && isValidDDD(digits)

const format0303 = (d) => `0303 ${d.slice(4, 7)} ${d.slice(7)}`.trim()

/** (11) 98765-4321, (11) 3456-7890 ou 0303 123 4567 */
export function formatPhone(digits) {
  const d = onlyDigits(digits)
  if (isTelemarketingPrefix(d)) return format0303(d)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d
}

/** Máscara progressiva para o campo de digitação. */
export function formatAsTyped(value) {
  const d = normalizePhone(value)
  if (isTelemarketingPrefix(d)) return format0303(d)
  if (d.length <= 2 || (d.length < 4 && d.startsWith('0'))) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Esconde os 2 últimos dígitos: (11) 98765-43•• */
export function maskPhone(digits) {
  return formatPhone(digits).replace(/\d{2}$/, '••')
}

/** Mesmo resultado de maskPhone, a partir do número já sem os 2 últimos dígitos. */
export const maskFromPrefix = (prefix) => maskPhone(`${prefix}00`)

export function timeAgo(timestamp, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (s < 45) return 'agora mesmo'
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${Math.max(1, m)} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h} h`
  const days = Math.floor(h / 24)
  if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  const months = Math.floor(days / 30)
  return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
}

export function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  const dia = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dia.replace('.', '')} às ${hora}`
}

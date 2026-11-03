// Sons da ligação simulada, gerados na hora com Web Audio (nenhum arquivo de áudio).
// Toque de celular, chiado de linha telefônica, música de espera e sinal de ocupado.
// Tudo falha em silêncio se o navegador não permitir áudio.

let ctx = null
let master = null
let muted = false
let ringTimer = null
let lineNodes = null

function audio() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 1
    master.connect(ctx.destination)
  } catch {
    ctx = null
  }
  return ctx
}

/** Chame dentro de um clique: libera o áudio em celulares (principalmente iPhone). */
export function unlockAudio() {
  const c = audio()
  if (c?.state === 'suspended') c.resume().catch(() => {})
}

export function setMuted(value) {
  muted = value
  if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02)
}

/** Uma nota curta com ataque rápido e decaimento (som de marimba / bip). */
function note(freq, start, dur, { type = 'sine', volume = 0.18, dest } = {}) {
  const c = ctx
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(dest ?? master)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

// ── Toque de celular ────────────────────────────────────────────────────────
const RING_NOTES = [659.25, 783.99, 987.77, 1318.51, 987.77, 783.99] // Mi Sol Si Mi Si Sol

function ringOnce() {
  const c = audio()
  if (!c) return
  const t = c.currentTime + 0.05
  RING_NOTES.forEach((f, i) => note(f, t + i * 0.13, 0.32, { volume: 0.12 }))
  RING_NOTES.forEach((f, i) => note(f, t + 1 + i * 0.13, 0.32, { volume: 0.12 }))
}

export function startRingtone() {
  stopRingtone()
  if (!audio()) return
  ringOnce()
  ringTimer = setInterval(ringOnce, 3000)
}

export function stopRingtone() {
  clearInterval(ringTimer)
  ringTimer = null
}

// ── Chiado de linha telefônica ──────────────────────────────────────────────
export function startLineNoise() {
  stopLineNoise()
  const c = audio()
  if (!c) return
  const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buffer
  src.loop = true
  const band = c.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1200
  band.Q.value = 0.6
  const gain = c.createGain()
  gain.gain.value = 0.012
  src.connect(band).connect(gain).connect(master)
  src.start()
  // "Clique" de chamada conectada
  note(1400, c.currentTime + 0.02, 0.06, { type: 'square', volume: 0.04 })
  lineNodes = { src, gain }
}

export function stopLineNoise() {
  if (!lineNodes) return
  try {
    lineNodes.src.stop()
  } catch {
    /* já parado */
  }
  lineNodes = null
}

// ── Música de espera ────────────────────────────────────────────────────────
const HOLD_MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5]

export function playHoldMusic(ms) {
  const c = audio()
  if (!c) return
  // Som abafado, como música de espera passando pela linha telefônica.
  const low = c.createBiquadFilter()
  low.type = 'lowpass'
  low.frequency.value = 2200
  low.connect(master)
  const step = 0.22
  const t0 = c.currentTime + 0.05
  const count = Math.floor(ms / 1000 / step)
  for (let i = 0; i < count; i++) {
    note(HOLD_MELODY[i % HOLD_MELODY.length], t0 + i * step, 0.4, { type: 'triangle', volume: 0.07, dest: low })
  }
}

// ── Sinal de ligação encerrada (425 Hz, padrão brasileiro) ──────────────────
export function playHangupTone() {
  const c = audio()
  if (!c) return
  const t = c.currentTime + 0.05
  for (let i = 0; i < 3; i++) note(425, t + i * 0.5, 0.25, { volume: 0.1 })
}

export function stopAllSounds() {
  stopRingtone()
  stopLineNoise()
}

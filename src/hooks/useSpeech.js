import { useCallback, useEffect, useRef, useState } from 'react'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

// Vozes em português ordenadas da mais natural para a mais robótica.
const PREFERRED = [/natural|neural|online/i, /google/i, /luciana|felipe|fernanda|francisca|antonio|thalita|daniel/i]

function rankVoices(voices) {
  const pt = voices.filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('pt'))
  const score = (v) => {
    let s = v.lang?.replace('_', '-') === 'pt-BR' ? 100 : 0
    PREFERRED.forEach((re, i) => {
      if (re.test(v.name)) s += 30 - i * 10
    })
    if (!v.localService) s += 5 // vozes da nuvem costumam soar melhor
    return s
  }
  return [...pt].sort((a, b) => score(b) - score(a))
}

/**
 * Voz do golpista com o navegador (Web Speech API).
 * speak(texto, { speaker, pitch, onProgress }) devolve uma Promise que termina quando a
 * fala acaba. onProgress(n) recebe quantos caracteres já foram falados, para o texto
 * aparecer junto com a voz.
 */
export function useSpeech() {
  const [voices, setVoices] = useState([])
  const voicesRef = useRef([])

  useEffect(() => {
    if (!synth) return undefined
    const load = () => {
      const ranked = rankVoices(synth.getVoices())
      voicesRef.current = ranked
      setVoices(ranked)
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => {
      synth.removeEventListener?.('voiceschanged', load)
      synth.cancel()
    }
  }, [])

  const speak = useCallback((text, { speaker = 'a', pitch = 1, rate = 1.12, onProgress } = {}) => {
    if (!synth) return Promise.resolve(false)
    return new Promise((resolve) => {
      const list = voicesRef.current
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'pt-BR'
      // Segunda pessoa (ex.: outro atendente) usa outra voz quando o aparelho tiver.
      const voice = speaker === 'b' ? list[1] ?? list[0] : list[0]
      if (voice) u.voice = voice
      u.pitch = pitch
      u.rate = rate

      let started = false
      let gotBoundary = false
      let timer = null
      let fallback = null
      const finish = (ok) => {
        clearInterval(timer)
        clearTimeout(fallback)
        onProgress?.(text.length)
        resolve(ok)
      }

      // Texto acompanhando a voz: usa os eventos de palavra quando o navegador manda;
      // senão estima pelo ritmo médio da fala.
      u.onstart = () => {
        started = true
        const startedAt = performance.now()
        const cps = 15 * rate
        timer = setInterval(() => {
          if (gotBoundary) return
          onProgress?.(Math.min(text.length - 1, Math.round(((performance.now() - startedAt) / 1000) * cps)))
        }, 60)
        clearTimeout(fallback)
        fallback = setTimeout(() => finish(true), 2500 + (text.length / cps) * 1600)
      }
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return
        gotBoundary = true
        const end = text.indexOf(' ', e.charIndex + 1)
        onProgress?.(end === -1 ? text.length : end)
      }
      u.onend = () => finish(true)
      u.onerror = () => finish(started)

      // Se a fala não começar logo (aparelho sem voz instalada), segue sem áudio.
      fallback = setTimeout(() => finish(false), 1800)
      synth.speak(u)
    })
  }, [])

  const stop = useCallback(() => synth?.cancel(), [])

  /** Chame dentro de um clique: alguns celulares (iPhone) só liberam a voz assim. */
  const unlock = useCallback(() => {
    if (!synth) return
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    synth.speak(u)
  }, [])

  return { speak, stop, unlock, supported: Boolean(synth), hasVoice: voices.length > 0 }
}

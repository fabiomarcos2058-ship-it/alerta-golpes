import { useCallback, useEffect, useRef } from 'react'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

function pickVoice() {
  const voices = synth?.getVoices() ?? []
  return (
    voices.find((v) => v.lang === 'pt-BR') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) ||
    null
  )
}

/**
 * Lê textos em voz alta com a voz do navegador (quando existe).
 * speak() devolve uma Promise que termina quando a fala acaba, ou na hora se a voz
 * estiver desligada / indisponível.
 */
export function useSpeech(enabled) {
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (!enabled) synth?.cancel()
  }, [enabled])

  useEffect(() => () => synth?.cancel(), [])

  const speak = useCallback((text) => {
    if (!synth || !enabledRef.current) return Promise.resolve()
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text)
      const voice = pickVoice()
      if (voice) u.voice = voice
      u.lang = 'pt-BR'
      u.rate = 1.05
      // Se a fala não começar logo (aparelho sem voz instalada), segue sem áudio.
      // Se começar mas nunca terminar (bug de alguns navegadores), segue depois de um tempo.
      let fallback = setTimeout(() => done(), 1500)
      function done() {
        clearTimeout(fallback)
        resolve()
      }
      u.onstart = () => {
        clearTimeout(fallback)
        fallback = setTimeout(done, 2000 + text.length * 90)
      }
      u.onend = done
      u.onerror = done
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

  return { speak, stop, unlock, supported: Boolean(synth) }
}

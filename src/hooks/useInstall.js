import { useCallback, useEffect, useState } from 'react'

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

/** Instalar o site como app (Android/Chrome/Edge com botão; iPhone com instruções). */
export function useInstall() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    setPrompt(null)
    return outcome === 'accepted'
  }, [prompt])

  return { installed, canInstall: Boolean(prompt), ios: isIOS() && !installed, install }
}

/** Mostra um aviso do sistema (celular/computador). Só funciona com permissão e service worker. */
export async function showSystemNotification(title, body, tag) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const reg = await navigator.serviceWorker?.getRegistration()
    const opts = { body, tag, icon: './icon-192.png', badge: './icon-192.png', lang: 'pt-BR' }
    if (reg) await reg.showNotification(title, opts)
    else new Notification(title, opts)
  } catch {
    /* sem suporte: fica só o aviso dentro do site */
  }
}

export async function askNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

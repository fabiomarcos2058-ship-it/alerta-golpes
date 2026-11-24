import { useCallback, useEffect, useState } from 'react'

export const VIEWS = ['consultar', 'simulador', 'mensagem', 'dicas', 'minha-area', 'planos']

const fromHash = () => {
  const h = window.location.hash.replace('#', '')
  return VIEWS.includes(h) ? h : 'consultar'
}

/** Navegação por abas usando o #endereço (funciona no GitHub Pages e no botão voltar). */
export function useView() {
  const [view, setView] = useState(fromHash)

  useEffect(() => {
    const onHash = () => {
      setView(fromHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((next) => {
    if (next === fromHash()) window.scrollTo({ top: 0, behavior: 'smooth' })
    else window.location.hash = next
  }, [])

  return [view, go]
}

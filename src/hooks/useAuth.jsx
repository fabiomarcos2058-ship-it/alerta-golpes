import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { backend } from '../services/backend'

const AuthContext = createContext(null)

/** Login OPCIONAL com o número de celular. Tudo no site funciona sem entrar. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { phone }
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    backend.auth.current().then((u) => {
      if (alive) {
        setUser(u)
        setReady(true)
      }
    })
    const off = backend.auth.onChange((u) => setUser(u))
    return () => {
      alive = false
      off?.()
    }
  }, [])

  const sendCode = useCallback((phone) => backend.auth.sendCode(phone), [])
  const verifyCode = useCallback(async (phone, code) => {
    const u = await backend.auth.verifyCode(phone, code)
    setUser(u)
    return u
  }, [])
  const signOut = useCallback(async () => {
    await backend.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, sendCode, verifyCode, signOut }), [user, ready, sendCode, verifyCode, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

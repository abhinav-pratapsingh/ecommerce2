import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('sv_token')
    if (token && !user) {
      authService.profile()
        .then(res => setUser(res.data.data.user))
        .catch(() => { localStorage.removeItem('sv_token'); localStorage.removeItem('sv_user') })
        .finally(() => setChecked(true))
    } else {
      setChecked(true)
    }
  }, []) // eslint-disable-line

  // Global logout event from api interceptor
  useEffect(() => {
    const handle = () => { setUser(null) }
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      const { user: u, token } = res.data.data
      localStorage.setItem('sv_token', token)
      localStorage.setItem('sv_user', JSON.stringify(u))
      setUser(u)
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`)
      return { success: true, role: u.role }
    } catch (err) {
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      const res = await authService.register(data)
      const { user: u, token } = res.data.data
      localStorage.setItem('sv_token', token)
      localStorage.setItem('sv_user', JSON.stringify(u))
      setUser(u)
      toast.success('Account created!')
      return { success: true }
    } catch { return { success: false } }
    finally { setLoading(false) }
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    localStorage.removeItem('sv_token')
    localStorage.removeItem('sv_user')
    setUser(null)
    toast.success('Logged out')
  }, [])

  const updateUserLocal = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('sv_user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, checked, login, register, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar se há usuário em localStorage
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (login, password) => {
    try {
      setError(null)
      const { data } = await api.post('/auth?action=login', { login, password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Erro ao fazer login'
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (formData) => {
    try {
      setError(null)
      const { data } = await api.post('/auth?action=register', formData)

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Erro ao registrar'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
})

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Não setar Content-Type se for FormData (deixar o browser fazer)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Apenas redirecionar para login se não estivermos já em uma requisição de login
    if (error.response?.status === 401 && !error.config?.url?.includes('auth')) {
      const token = localStorage.getItem('token')
      // Só remove token se houver um válido (evita ciclos infinitos)
      if (token) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

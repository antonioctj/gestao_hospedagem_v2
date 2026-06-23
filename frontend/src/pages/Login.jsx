import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login, error } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!formData.login || !formData.password) {
      setLocalError('Email, usuário ou CPF/CNPJ e senha são obrigatórios')
      return
    }

    setLoading(true)
    const result = await login(formData.login, formData.password)

    if (result.success) {
      // Redirecionar baseado no nível do usuário
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          // Verificar o campo 'nivel' (pode vir como 'nivel' ou 'role')
          const nivel = user.nivel || user.role

          console.log('Usuário:', user)
          console.log('Nível:', nivel)

          // super_admin e admin roles vão para /admin
          const adminRoles = ['super_admin', 'gerente', 'anfitrião', 'manutenção', 'admin']
          if (adminRoles.includes(nivel)) {
            navigate('/admin/dashboard')
          } else {
            navigate('/dashboard')
          }
        } catch (e) {
          console.error('Erro ao parsear user:', e)
          navigate('/dashboard')
        }
      } else {
        navigate('/dashboard')
      }
    } else {
      setLocalError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-white font-bold text-2xl">UberHost</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
          <p className="text-gray-400">Acesse sua conta para continuar</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          {/* Erro Global */}
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{localError || error}</p>
            </div>
          )}

          {/* Login */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Email, Usuário ou CPF/CNPJ
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="seu@email.com ou usuário ou CPF/CNPJ"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"
              />
            </div>
          </div>

          {/* Lembrar de mim */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-primary" />
              <span className="text-gray-400 text-sm">Lembrar de mim</span>
            </label>
            <Link to="/forgot-password" className="text-primary text-sm hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          {/* Botão Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {/* Link Registro */}
          <p className="text-center text-gray-400 mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </form>

        {/* Informações */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Versão de demonstração | UberHost © 2024</p>
        </div>
      </div>
    </div>
  )
}

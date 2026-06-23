import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Building2, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const navigate = useNavigate()
  const { register, error } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    nomeEmpresa: '',
    telefone: '',
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

    // Validações
    if (!formData.nome || !formData.email || !formData.senha || !formData.nomeEmpresa) {
      setLocalError('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.senha.length < 6) {
      setLocalError('Senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.senha !== formData.confirmSenha) {
      setLocalError('As senhas não conferem')
      return
    }

    setLoading(true)
    const result = await register({
      name: formData.nome,
      email: formData.email,
      password: formData.senha,
      company_name: formData.nomeEmpresa,
      phone: formData.telefone,
    })

    if (result.success) {
      // Redirecionar baseado no role do usuário
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          const adminRoles = ['gerente', 'anfitrião', 'manutenção']
          if (adminRoles.includes(user.role)) {
            navigate('/admin/dashboard')
          } else {
            navigate('/dashboard')
          }
        } catch {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-white font-bold text-2xl">UberHost</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-gray-400">Comece a gerenciar suas hospedagens agora</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          {/* Erro Global */}
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{localError || error}</p>
            </div>
          )}

          {/* Nome */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="João Silva"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Nome da Empresa */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Nome da Empresa *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="text"
                name="nomeEmpresa"
                value={formData.nomeEmpresa}
                onChange={handleChange}
                placeholder="Sua Hospedaria"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition text-sm"
            />
          </div>

          {/* Senha */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Confirmar Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                name="confirmSenha"
                value={formData.confirmSenha}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Termos */}
          <label className="flex items-start gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-primary mt-1" required />
            <span className="text-gray-400 text-xs">
              Concordo com os{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Termos de Serviço
              </Link>
              {' '}e{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
            </span>
          </label>

          {/* Botão Registro */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          {/* Link Login */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </form>

        {/* Informações */}
        <div className="mt-8 text-center text-gray-400 text-xs">
          <p>Versão de demonstração | UberHost © 2024</p>
        </div>
      </div>
    </div>
  )
}

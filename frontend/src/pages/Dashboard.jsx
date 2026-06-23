import { useNavigate } from 'react-router-dom'
import { LogOut, Home } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Home className="text-primary" size={24} />
          <span className="font-bold text-xl">Dashboard</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </nav>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bem-vindo, {user?.name || 'Usuário'}! 👋
          </h1>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {/* Cards Placeholder */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <h3 className="font-semibold text-sm mb-2">Imóveis</h3>
              <p className="text-3xl font-bold">0</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
              <h3 className="font-semibold text-sm mb-2">Reservas</h3>
              <p className="text-3xl font-bold">0</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
              <h3 className="font-semibold text-sm mb-2">Receita</h3>
              <p className="text-3xl font-bold">R$ 0</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-800">
              ℹ️ Este é um dashboard de demonstração. Novas páginas serão adicionadas em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

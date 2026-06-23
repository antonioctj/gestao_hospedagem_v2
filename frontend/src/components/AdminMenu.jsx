import { useNavigate } from 'react-router-dom'
import { BarChart3, Calendar, Settings, LogOut, Upload } from 'lucide-react'

export default function AdminMenu({ user, onLogout }) {
  const navigate = useNavigate()
  const role = user?.role || user?.nivel || ''
  const modulos = user?.modulos || []

  // Definir menu com permissões por role E módulo
  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard', roles: ['super_admin', 'gerente', 'anfitrião', 'manutenção'], modulo: 'dashboard' },
    { label: 'Reservas', icon: Calendar, path: '/admin/reservas', roles: ['super_admin', 'gerente', 'anfitrião'], modulo: 'reservas' },
    { label: 'Importar', icon: Upload, path: '/admin/importar', roles: ['super_admin', 'gerente'], modulo: 'reservas' },
    { label: 'Calendário', icon: Calendar, path: '/admin/calendario', roles: ['super_admin', 'gerente', 'anfitrião', 'manutenção'], modulo: 'calendario' },
    { label: 'Configurações', icon: Settings, path: '/admin/configuracoes', roles: ['super_admin', 'gerente'], modulo: 'configuracoes' },
  ]

  // Filtrar menu por role E verificar módulos
  const visibleItems = menuItems.filter(item => {
    const temRole = item.roles.includes(role)
    // Se não tem permissão por role, não mostra
    if (!temRole) return false
    // Super admin e gerente veem tudo
    if (['super_admin', 'gerente'].includes(role)) return true
    // Para outros roles, verificar módulos
    if (item.modulo && modulos.length > 0) {
      return modulos.includes(item.modulo)
    }
    return true
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout && onLogout()
    navigate('/login')
  }

  return (
    <div className="border-b bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            U
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{user?.name || 'Admin'}</h1>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>

      <div className="flex gap-1 px-4 pb-4 overflow-x-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition hover:bg-gray-200 text-gray-700"
            >
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

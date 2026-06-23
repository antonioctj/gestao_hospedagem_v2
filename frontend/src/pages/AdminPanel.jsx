import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AdminMenu from '../components/AdminMenu'
import ProtectedModule from '../components/ProtectedModule'
import AdminDashboard from './AdminDashboard'
import AdminReservas from './AdminReservas'
import ImportarReservas from './ImportarReservas'
import AdminCalendario from './AdminCalendario'
import AdminConfiguracoes from './AdminConfiguracoes'

export default function AdminPanel() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminMenu user={user} onLogout={logout} />

      <div>
        <Routes>
          <Route path="dashboard" element={
            <ProtectedModule moduleName="dashboard">
              <AdminDashboard />
            </ProtectedModule>
          } />
          <Route path="reservas" element={
            <ProtectedModule moduleName="reservas">
              <AdminReservas />
            </ProtectedModule>
          } />
          <Route path="importar" element={
            <ProtectedModule moduleName="reservas">
              <ImportarReservas />
            </ProtectedModule>
          } />
          <Route path="calendario" element={
            <ProtectedModule moduleName="calendario">
              <AdminCalendario />
            </ProtectedModule>
          } />
          <Route path="configuracoes" element={
            <ProtectedModule moduleName="configuracoes">
              <AdminConfiguracoes />
            </ProtectedModule>
          } />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

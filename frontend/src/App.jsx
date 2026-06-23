import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas
import Landpage from './pages/Landpage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'

// Admin Protected Route - validar role (gerente, anfitrião, manutenção)
function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')

  if (!token || !userStr) {
    return <Navigate to="/admin-login" replace />
  }

  try {
    const user = JSON.parse(userStr)
    const allowedRoles = ['super_admin', 'gerente', 'anfitrião', 'manutenção', 'admin']
    return allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />
  } catch {
    return <Navigate to="/admin-login" replace />
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Páginas Públicas */}
          <Route path="/" element={<Landpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* Páginas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirecionar rotas desconhecidas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

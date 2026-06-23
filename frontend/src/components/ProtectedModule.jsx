import { Navigate } from 'react-router-dom'

export default function ProtectedModule({ children, moduleName }) {
  const userStr = localStorage.getItem('user')

  if (!userStr) {
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(userStr)
    const modulos = user.modulos || []
    const nivel = user.nivel || user.role || ''

    // Super admin e gerente têm acesso a tudo
    if (['super_admin', 'gerente'].includes(nivel)) {
      return children
    }

    // Para outros usuários, verificar se têm o módulo
    if (moduleName && modulos.length > 0) {
      if (!modulos.includes(moduleName)) {
        return <Navigate to="/admin/dashboard" replace />
      }
    }

    return children
  } catch {
    return <Navigate to="/login" replace />
  }
}

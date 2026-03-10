import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './Loader'

/**
 * Requires the user to be logged in. Redirects to /login with state for redirect-back.
 */
export const ProtectedRoute = ({ children }) => {
  const { user, checked } = useAuth()
  const location = useLocation()

  if (!checked) return <PageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

/**
 * Requires the user to have role === 'admin'. Redirects to home if not.
 */
export const AdminRoute = ({ children }) => {
  const { user, checked } = useAuth()
  const location = useLocation()

  if (!checked) return <PageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

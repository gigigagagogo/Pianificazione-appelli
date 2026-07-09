import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: 'segreteria' | 'docente';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Non loggato -> torna al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Loggato ma ruolo sbagliato -> torna alla propria home
  if (role !== allowedRole) {
    return <Navigate to={role === 'segreteria' ? '/segreteria' : '/appelli'} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
import { Navigate } from 'react-router-dom';
import { temPermissao } from '../utils/auth';

export default function ProtectedRoute({ perfil, modulo, children }) {
  if (!temPermissao(perfil, modulo)) {
    return <Navigate to='/' replace />;
  }
  return children;
}

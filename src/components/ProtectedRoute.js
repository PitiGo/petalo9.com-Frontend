import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('auth-token'); // Asumiendo que guardas el token aquí
  return isAuthenticated ? children : <Navigate to="/login" />;
}
export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
    const isAuthenticated = !!localStorage.getItem('auth-token');
    const isAdmin = localStorage.getItem('userRole') === 'admin';

    if (!isAuthenticated) {
        // Si no está autenticado, redirige al login
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        // Si está autenticado pero no es admin, redirige a una página de error o a la home
        return <Navigate to="/" />;
    }

    // Si está autenticado y es admin, muestra el contenido
    return children;
}

export default AdminRoute;

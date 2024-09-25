import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${apiUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login successful:', data);
            console.log('userRole:', data.role);

            // Redireccionar a la ruta principal
            navigate('/edit');

       
            // Por ejemplo, guardar el token JWT para su uso posterior
            localStorage.setItem('auth-token', data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', data.role);
           


           

        } catch (error) {
            console.error('Error during login:', error);
            // Redirige al componente de error con los detalles del error
            navigate('/error', { state: { errorCode: error.message, errorMessage: 'Error durante el login.' } });
        }
    };

    function handleLogout() {
        localStorage.removeItem('auth-token'); // Borra el token del almacenamiento local
        localStorage.removeItem('username'); // Elimina el nombre de usuario del almacenamiento local
        localStorage.removeItem('userRole');
        navigate('/login'); // Redirige al usuario a la página de inicio de sesión
        window.location.reload(); // Recarga la página para reflejar el cambio de estado
    }
    
    if (isAuthenticated) {
        return (
            <div>
                <h2>Ya estás logueado</h2>

                <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
        );
    }


    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginForm;

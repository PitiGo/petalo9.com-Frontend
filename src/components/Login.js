import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../config/firebase-config';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Nuevo estado para el modo de registro
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Forzar la actualización del token para obtener los custom claims (roles)
      const tokenResult = await userCredential.user.getIdTokenResult(true);
      const token = tokenResult.token;

      // Extraer el rol del token
      const userRole = tokenResult.claims.admin ? 'admin' : 'user';

      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', email);
      localStorage.setItem('userRole', userRole); // Guardar el rol dinámicamente

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new Event('authStateChanged'));

      console.log('Login successful:', email);
      console.log('User role:', userRole);

      setIsLoggedIn(true);
      // Redirigir a la página principal o al blog después de iniciar sesión
      navigate('/');

    } catch (error) {
      console.error('Error during login:', error);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Forzar la actualización del token para obtener los custom claims (roles)
      const tokenResult = await result.user.getIdTokenResult(true);
      const token = tokenResult.token;

      // Extraer el rol del token
      const userRole = tokenResult.claims.admin ? 'admin' : 'user';

      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', result.user.email);
      localStorage.setItem('userRole', userRole);

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new Event('authStateChanged'));

      console.log('Google login successful:', result.user.email);
      console.log('User role:', userRole);

      setIsLoggedIn(true);
      navigate('/');

    } catch (error) {
      console.error('Error during Google login:', error);
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro.');
      }

      // Después de un registro exitoso, intenta hacer login automáticamente
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setIsRegistering(false); // Vuelve al modo de login

    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new Event('authStateChanged'));

      setIsLoggedIn(false);
      navigate('/');
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        maxWidth: '500px',
        margin: '40px auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '20px', color: '#28a745' }}>✅</div>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>¡Bienvenido!</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>
          Has iniciado sesión como <strong>{localStorage.getItem('user')}</strong>
        </p>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '25px' }}>
          Rol: <span style={{
            backgroundColor: localStorage.getItem('userRole') === 'admin' ? '#dc3545' : '#007bff',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {localStorage.getItem('userRole') === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .login-container {
            max-width: 450px;
            margin: 40px auto;
            padding: 40px 30px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid #e9ecef;
            width: 100%;
            box-sizing: border-box;
          }
          
          .login-title {
            color: #333;
            margin-bottom: 8px;
            font-size: 28px;
            font-weight: 600;
          }
          
          .login-subtitle {
            color: #666;
            font-size: 16px;
          }
          
          .google-btn {
            width: 100%;
            padding: 12px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s ease;
          }
          
          .google-btn:hover {
            background-color: #3367d6;
            transform: translateY(-1px);
          }
          
          .google-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          
          .form-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #007bff;
          }
          
          .form-label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .submit-btn {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 20px;
            transition: all 0.3s ease;
          }
          
          .submit-btn:hover {
            background-color: #0056b3;
            transform: translateY(-1px);
          }
          
          .submit-btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
            transform: none;
          }
          
          .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
          }
          
          .toggle-btn {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 16px;
            text-decoration: underline;
          }
          
          .divider {
            text-align: center;
            margin: 20px 0;
            position: relative;
          }
          
          .divider::before {
            content: '';
            height: 1px;
            background-color: #e9ecef;
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            z-index: 1;
          }
          
          .divider span {
            position: relative;
            background-color: white;
            padding: 0 15px;
            color: #666;
            font-size: 14px;
            z-index: 2;
          }
          
          /* Responsive styles */
          @media (max-width: 768px) {
            .login-container {
              margin: 20px auto;
              padding: 30px 20px;
              max-width: 100%;
              border-radius: 8px;
            }
            
            .login-title {
              font-size: 24px;
            }
            
            .login-subtitle {
              font-size: 14px;
            }
            
            .google-btn {
              padding: 14px 12px;
              font-size: 15px;
            }
            
            .form-input {
              padding: 14px 12px;
              font-size: 16px;
            }
            
            .submit-btn {
              padding: 14px 12px;
              font-size: 16px;
            }
            
            .form-label {
              font-size: 14px;
            }
          }
          
          @media (max-width: 480px) {
            .login-container {
              margin: 10px;
              padding: 25px 15px;
              border-radius: 6px;
            }
            
            .login-title {
              font-size: 22px;
            }
            
            .login-subtitle {
              font-size: 13px;
            }
            
            .google-btn {
              padding: 12px 10px;
              font-size: 14px;
            }
            
            .form-input {
              padding: 12px 10px;
              font-size: 15px;
            }
            
            .submit-btn {
              padding: 12px 10px;
              font-size: 15px;
            }
            
            .form-label {
              font-size: 13px;
            }
          }
        `}
      </style>
      <div className="login-container">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="login-title">
            {isRegistering ? 'Crear una Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="login-subtitle">
            {isRegistering ? 'Únete a nuestra comunidad' : 'Bienvenido de vuelta'}
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <div className="form-group">
            <label className="form-label">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="form-input"
            />
          </div>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            className="toggle-btn"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </>
  );
}

export default LoginForm;

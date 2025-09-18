import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from '../config/firebase-config';
import '../css/header.css';

const Header = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Mobile menu state changed:', isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const updateAuthState = () => {
      const storedUsername = localStorage.getItem('user');
      const storedUserRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('auth-token');

      if (storedUsername && token) {
        setUsername(storedUsername);
        setIsLoggedIn(true);
      } else {
        setUsername('');
        setIsLoggedIn(false);
      }

      if (storedUserRole) {
        setUserRole(storedUserRole);
      } else {
        setUserRole('');
      }
    };

    // Cargar estado inicial
    updateAuthState();

    // Escuchar cambios en localStorage para sincronizar entre pestañas
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'userRole' || e.key === 'auth-token') {
        updateAuthState();
      }
    };

    // Escuchar evento personalizado para sincronización en la misma pestaña
    const handleAuthStateChange = () => {
      updateAuthState();
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    const handleResize = () => {
      // Close mobile menu when resizing to larger screens
      if (window.innerWidth > 600) {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new Event('authStateChanged'));

      setUsername('');
      setUserRole('');
      setIsLoggedIn(false);
      navigate('/');
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleMobileMenu = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    console.log('Toggle mobile menu clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsUserMenuOpen((prev) => !prev);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMobileMenuOpen) return;
      const dropdown = document.querySelector('.mobile-dropdown');
      const button = document.querySelector('.mobile-menu-btn');
      if (dropdown && button) {
        if (!dropdown.contains(event.target) && !button.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isMobileMenuOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isUserMenuOpen) return;
      const dropdown = document.querySelector('.user-dropdown');
      const trigger = document.querySelector('.user-area') || document.querySelector('.login-btn');
      if (dropdown && trigger) {
        if (!dropdown.contains(event.target) && !trigger.contains(event.target)) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isUserMenuOpen]);

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    padding: '0 20px',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: '#0a192f',
    backdropFilter: 'none',
    transition: 'all 0.3s ease',
    zIndex: 10000,
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    borderBottom: '1px solid rgba(100, 255, 218, 0.15)',
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link to="/" className="logo-link" style={{
          transition: 'transform 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none'
        }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div className="logo-container" style={{
            width: '60px',
            height: '60px',
            overflow: 'hidden',
            borderRadius: '50%',
            border: '3px solid rgba(100, 255, 218, 0.3)',
            background: '#112240',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#0a192f',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={process.env.PUBLIC_URL + '/logo.webp'}
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </Link>
        <div className="nav-welcome-container">
          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[
              { to: '/', label: 'Home', icon: '🏠' },
              { to: '/blog', label: 'Blog', icon: '📝' },
              { to: '/games', label: 'Games', icon: '🎮' },
              { to: '/tools', label: 'Tools', icon: '🛠️' },
              { to: '/about', label: 'About', icon: '👤' },
              { to: '/contact', label: 'Contact', icon: '📧' }
            ].map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${location.pathname === to ? 'nav-link-active' : ''}`}
                style={{
                  color: location.pathname === to ? '#64ffda' : '#e6f1ff'
                }}
              >
                <span className="nav-label">{label}</span>
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'nav-link-active' : ''}`}
                style={{
                  color: location.pathname === '/login' ? '#64ffda' : '#e6f1ff'
                }}
              >
                <span className="nav-label">Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span>☰</span>
            Menu
          </button>

          {/* Dropdown moved to portal below */}

          {isLoggedIn ? (
            <div className="user-area" onClick={toggleUserMenu} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              background: '#112240',
              padding: '8px 16px',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(100, 255, 218, 0.15)'
            }}>
              <div className="user-info" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#e6f1ff'
              }}>
                <div className="user-avatar" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #64ffda, #00bfa5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#0a192f'
                }}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="user-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="user-name" style={{
                    color: '#e6f1ff',
                    fontWeight: '600',
                    fontSize: '13px',
                    lineHeight: '1.2'
                  }}>
                    {username}
                  </span>
                  {userRole && (
                    <span className="user-role" style={{
                      backgroundColor: 'rgba(100, 255, 218, 0.1)',
                      color: '#64ffda',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: '1px solid rgba(100, 255, 218, 0.3)'
                    }}>
                      {userRole === 'admin' ? 'Admin' : 'User'}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="logout-btn"
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                style={{
                  background: 'transparent',
                  color: '#64ffda',
                  border: '1px solid rgba(100, 255, 218, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(100, 255, 218, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z" />
                </svg>
                Salir
              </button>
            </div>
          ) : (
            <Link
              className="login-btn"
              to="/login"
              onClick={(e) => {
                if (window.innerWidth <= 600) {
                  toggleUserMenu(e);
                }
              }}
              style={{
                background: 'transparent',
                color: '#64ffda',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                padding: '10px 16px',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                boxShadow: 'none',
                border: '1px solid rgba(100, 255, 218, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'rgba(100, 255, 218, 0.1)';
                e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.35)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'transparent';
                e.target.style.boxShadow = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
             <span className="login-text">Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>

      {createPortal(
        <>
          {/* Mobile Dropdown Menu in portal */}
          <div
            className={`mobile-dropdown ${isMobileMenuOpen ? 'mobile-dropdown-open' : ''}`}
            role="menu"
            aria-hidden={!isMobileMenuOpen}
          >
            {[
              { to: '/', label: 'Home' },
              { to: '/blog', label: 'Blog' },
              { to: '/games', label: 'Games' },
              { to: '/tools', label: 'Tools' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' }
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                className={location.pathname === to ? 'mobile-dropdown-active' : ''}
              >
                {label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className={`mobile-dropdown-login ${location.pathname === '/login' ? 'mobile-dropdown-active' : ''}`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile overlay to dim background and capture outside clicks */}
          {isMobileMenuOpen && (
            <div className="mobile-overlay" onClick={closeMobileMenu} aria-hidden="true" />
          )}

          {/* User dropdown (mobile) */}
          <div
            className={`user-dropdown ${isUserMenuOpen ? 'user-dropdown-open' : ''}`}
            role="menu"
            aria-hidden={!isUserMenuOpen}
          >
            {isLoggedIn ? (
              <>
                <div className="user-dropdown-header">
                  <span>{username}</span>
                  {userRole && <span className="role">{userRole}</span>}
                </div>
                <button className="user-dropdown-item" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="user-dropdown-item" to="/login" onClick={closeUserMenu}>Login</Link>
              </>
            )}
          </div>

          {isUserMenuOpen && (
            <div className="mobile-overlay" onClick={closeUserMenu} aria-hidden="true" />
          )}
        </>,
        document.body
      )}
    </header>
  );
};

export default Header;

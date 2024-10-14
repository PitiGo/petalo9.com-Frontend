import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/header.css';
import logoImage from '../images/logo.png'; // Asegúrate de que la ruta sea correcta

const Header = () => {
  const [username, setUsername] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem('user');
    if (storedUsername) setUsername(storedUsername);

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    backgroundColor: `rgba(243, 243, 243, ${Math.max(0.8, Math.min(scrollPosition / 300, 0.95))})`,
    transition: 'all 0.3s ease',
    zIndex: 1000,
    boxShadow: scrollPosition > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <img src={logoImage} alt="Logo" className="circular-logo" />
          </div>
        </Link>
        <div className="nav-welcome-container">
          <nav>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/blog" className={`nav-link ${location.pathname === '/blog' ? 'active' : ''}`}>Blog</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          </nav>
          {username && <span className="welcome-message">Bienvenido, {username}</span>}
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';

const Header = () => {
  const [username, setUsername] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);

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
    backgroundColor: `rgba(243, 243, 243, ${Math.min(scrollPosition / 300, 0.9)})`,
    padding: '20px 0',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    boxShadow: scrollPosition > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
  };

  const titleStyle = {
    fontSize: `${Math.max(2.5 - scrollPosition / 400, 1.8)}rem`,
    margin: 0,
    color: '#2c3e50',
    transition: 'all 0.3s ease',
  };

  const usernameStyle = {
    fontSize: '1rem',
    color: '#7f8c8d',
    margin: '5px 0 0 0',
    opacity: Math.max(1 - scrollPosition / 200, 0),
    transition: 'all 0.3s ease',
  };

  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>Pétalo 9</h1>
      {username && <p style={usernameStyle}>Bienvenido, {username}</p>}
    </header>
  );
};

export default Header;
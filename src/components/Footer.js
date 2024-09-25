import React from 'react';

function Footer() {
    return (
      <footer className="bg-light text-center" style={{ padding: '10px 0' }}>
        <p>&copy; {new Date().getFullYear()} - Mi Sitio Web</p>
      </footer>
    );
  }
  

export default Footer;

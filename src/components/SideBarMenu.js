import React from 'react';
import { Link } from 'react-router-dom';
import '../css/sidemenu.css';

const SidebarMenu = () => {
  return (
    <div className="sidebar-menu">
      <Link to="/games" className="games-button">Games</Link>
    </div>
  );
};

export default SidebarMenu;
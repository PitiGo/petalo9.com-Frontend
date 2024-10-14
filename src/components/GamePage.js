import React from 'react';
import { Link } from 'react-router-dom';
import './GamePage.css';

const GamesPage = () => {
  const games = [
    { name: 'Snake', path: '/games/snake' },
    { name: 'Tetris', path: '/games/tetris' },
    { name: 'Pong', path: '/games/pong' },
    // Añade más juegos aquí
  ];

  return (
    <div className="games-page">
      <h1>Games</h1>
      <div className="games-grid">
        {games.map((game, index) => (
          <Link to={game.path} key={index} className="game-card">
            <h2>{game.name}</h2>
            {/* Aquí puedes añadir una imagen o icono para cada juego */}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
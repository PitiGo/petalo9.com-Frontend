

// GamePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/GamePage.css';
// Importa las imágenes
import snakeImage from '../images/snake-game.png';
import snake3dImage from '../images/snake-3d.png';
import pongImage from '../images/pong-game.png';
import footballImage from '../images/mamvsreptiles.webp';

const GamesPage = () => {
  const games = {
    singlePlayer: [
      {
        id: 'snake',
        name: 'Snake Classic',
        description: 'The classic Snake game. Guide the snake, collect food, and try not to hit the walls!',
        image: snakeImage
      },
      {
        id: 'SnakeGame3D',
        name: 'Snake 3D',
        description: 'A modern 3D twist on the classic Snake game. Experience snake-gaming in a whole new dimension!',
        image: snake3dImage
      },
      {
        id: 'pong',
        name: 'Pong',
        description: 'Classic arcade game. Challenge yourself against the AI in this timeless tennis-style game.',
        image: pongImage
      }
    ],
    multiplayer: [
      {
        id: 'mammals-vs-reptiles',
        name: 'Mammals vs Reptiles',
        description: 'An exciting 3D football game where mammals compete against reptiles in epic matches!',
        externalUrl: 'https://football-online-3d.dantecollazzi.com/',
        image: footballImage
      }
    ]
  };
  const GameCard = ({ game }) => {
    const CardWrapper = game.externalUrl ? 'a' : Link;
    const cardProps = game.externalUrl
      ? { href: game.externalUrl, target: "_blank", rel: "noopener noreferrer" }
      : { to: `/games/${game.id}` };

    return (
      <CardWrapper className="game-card" {...cardProps}>
        <div className="game-card-image-container">
          <img
            src={game.image}
            alt={game.name}
            className="game-card-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x180?text=Game+Preview';
            }}
          />
        </div>
        <div className="game-card-content">
          <h3>{game.name}</h3>
          <p>{game.description}</p>
        </div>
        {game.externalUrl && <span className="external-link-indicator">↗</span>}
      </CardWrapper>
    );
  };

  return (
    <div className="games-page">
      <h1>Games Collection</h1>

      <section className="games-section">
        <h2>Single Player Games</h2>
        <div className="games-grid">
          {games.singlePlayer.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="games-section">
        <h2>Multiplayer Games</h2>
        <div className="games-grid">
          {games.multiplayer.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GamesPage;
import React, { Suspense, lazy } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import gameRegistry from './GameRegistry';

const GamePlayer = () => {
  const { gameId } = useParams();
  
  if (!gameRegistry[gameId]) {
    return <Navigate to="/games" replace />;
  }

  const Game = lazy(gameRegistry[gameId].path);

  return (
    <div className="game-player">
      <Suspense fallback={<div>Loading game...</div>}>
        <Game />
      </Suspense>
    </div>
  );
};

export default GamePlayer;
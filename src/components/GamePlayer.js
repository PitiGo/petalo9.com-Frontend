import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import gameRegistry from './GameRegistry';

const GamePlayer = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const [roomId, setRoomId] = useState(null);

  // Extraer el parámetro room de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const room = params.get('room') || 'sala1'; // Default to sala1 if not specified
    setRoomId(room);
  }, [location]);

  // Redireccionar si el juego no existe
  if (!gameRegistry[gameId]) {
    return <Navigate to="/games" replace />;
  }

  // Cargar el componente del juego de forma dinámica
  const Game = lazy(gameRegistry[gameId].path);

  // Mostrar un estado de carga mientras se determina el roomId
  if (!roomId) return <div>Loading...</div>;

  return (
    <div className="game-player">
      <Suspense fallback={<div>Loading game...</div>}>
        <Game roomId={roomId} />
      </Suspense>
    </div>
  );
};

export default GamePlayer;
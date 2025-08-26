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

  // Solo maneja juegos
const gameInfo = gameRegistry.games[gameId];

  // Redireccionar si el juego no existe
if (!gameInfo) {
  return <Navigate to="/games" replace />;
}

// Cargar el componente del juego de forma dinámica
const GameComponent = lazy(gameInfo.path);

  // Mostrar un estado de carga mientras se determina el roomId
  if (!roomId) return <div>Loading...</div>;

  return (
    <div className="game-player" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>{gameInfo.name}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <GameComponent roomId={roomId} />
      </Suspense>
    </div>
  );
};

export default GamePlayer;
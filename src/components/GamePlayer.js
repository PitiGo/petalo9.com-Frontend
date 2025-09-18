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
  if (!roomId) return (
    <div style={{
      padding: '20px',
      backgroundColor: '#0a192f',
      color: '#e6f1ff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    }}>
      Loading...
    </div>
  );

  return (
    <div className="game-player" style={{
      padding: '20px',
      backgroundColor: '#0a192f',
      color: '#e6f1ff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    }}>
      <h1 style={{
        marginBottom: '20px',
        color: '#ffffff',
        fontSize: '2.5rem',
        fontWeight: '700',
        letterSpacing: '1px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        position: 'relative',
        paddingBottom: '1rem'
      }}>
        {gameInfo.name}
        <span style={{
          content: '""',
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '4px',
          background: 'linear-gradient(to right, #64ffda, #00bfa5)',
          borderRadius: '2px',
          boxShadow: '0 0 10px rgba(100, 255, 218, 0.6)'
        }}></span>
      </h1>
      <Suspense fallback={<div style={{ color: '#e6f1ff', textAlign: 'center' }}>Loading...</div>}>
        <GameComponent roomId={roomId} />
      </Suspense>
    </div>
  );
};

export default GamePlayer;
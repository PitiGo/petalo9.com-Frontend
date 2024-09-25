// GameRegistry.js
const gameRegistry = {
    pong: {
      path: () => import('./juegos/PongGame'),
      name: 'pong',
      description: 'Classic arcade game.'
    },
    cube: {
      path: () => import('./juegos/Cube'),
      name: 'cube',
      description: 'Puzzle game.'
    },
    snake: {
      path: () => import('./juegos/SnakeGame'),
      name: 'snake',
      description: 'Old school snake game.'
    },
    // Añade más juegos aquí
  };
  
  export default gameRegistry;
  
import EnhancedCubes from './juegos/EnhancedCubes';

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
    modelViewer: {
      path: () => import('./juegos/ModelViewer'),
      name: 'modelViewer',
      description: 'ModelViewer.'
    },
    EnhancedCubes: {
      path: () => import('./juegos/EnhancedCubes'),
      name: 'EnhancedCubes',
      description: 'EnhancedCubes.'
    },
    ThreeJSCSS3DSprites: {
      path: () => import('./juegos/ThreeJSCSS3DSprites'),
      name: 'ThreeJSCSS3DSprites',
      description: 'ThreeJSCSS3DSprites.'
    },
    CarViewer: {
      path: () => import('./juegos/CarViewer'),
      name: 'CarViewer',
      description: 'CarViewer.'
    },
    SnakeGame3D: {
      path: () => import('./juegos/SnakeGame3D'),
      name: 'SnakeGame3D',
      description: 'SnakeGame3D.'
    },
    Terminal: {
      path: () => import('./juegos/Terminal'),
      name: 'Terminal',
      description: 'Terminal.'
    }
    // Añade más juegos aquí
  };
  
  export default gameRegistry;
  
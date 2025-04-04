// GameRegistry.js
const gameRegistry = {
  'snake': {
    path: () => import('./juegos/SnakeGame'),
    name: 'snake',
    description: 'Classic Snake game.'
  },
  'SnakeGame3D': {
    path: () => import('./juegos/SnakeGame3D'),
    name: 'SnakeGame3D',
    description: 'Snake game in 3D.'
  },
  'pong': {
    path: () => import('./juegos/PongGame'),
    name: 'pong',
    description: 'Classic arcade game.'
  },
  cube: {
    path: () => import('./juegos/Cube'),
    name: 'cube',
    description: 'Puzzle game.'
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
  Terminal: {
    path: () => import('./juegos/Terminal'),
    name: 'Terminal',
    description: 'Terminal.'
  },
  Runner3D: {
    path: () => import('./juegos/Runner3D'),
    name: 'Runner3D',
    description: 'Runner3D.'
  },
  "mammals-vs-reptiles": {
    path: () => import('./juegos/MammalsVsReptilesRedirect'),  // o la ruta correcta a tu componente
    title: "Mammals vs Reptiles"
  }

  // Añade más juegos aquí
};

export default gameRegistry;


// GameRegistry.js
import { SITE_IMAGES } from '../config/images';

const placeholder = 'https://via.placeholder.com/300x180?text=';

const gameRegistry = {
  // DEFINICIÓN DE JUEGOS
  games: {
    'SnakeGame3D': {
      path: () => import('./juegos/SnakeGame3D'),
      name: 'Snake 3D',
      description: 'A modern 3D twist on the classic Snake game.',
      image: SITE_IMAGES.snake3d || `${placeholder}Snake3D`
    },
    'hand-invaders': {
      path: () => import('./juegos/HandInvadersGame'),
      name: 'Hand Invaders',
      description: 'Defend against invaders using your hand gestures recognized by your camera!',
      image: SITE_IMAGES.handInvaders || `${placeholder}HandInvaders`
    },
    'supermarcos': {
      path: () => import('./juegos/SuperMarcos'),
      name: 'Super Marcos',
      description: 'A 2D platformer adventure game.',
      image: SITE_IMAGES.supermarcos || `${placeholder}SuperMarcos`
    },
    'guess-the-country': {
      path: () => import('./juegos/GuessTheCountry'),
      name: 'Guess The Country',
      description: 'Test your geography knowledge!',
      image: SITE_IMAGES.guessCountry || `${placeholder}GuessCountry`
    },
    'snake': {
      path: () => import('./juegos/SnakeGame'),
      name: 'Classic Snake',
      description: 'The classic snake game.',
      image: SITE_IMAGES.snakeGame || `${placeholder}Snake`
    },
    'pong': {
      path: () => import('./juegos/PongGame'),
      name: 'Pong',
      description: 'Classic Pong game.',
      image: SITE_IMAGES.pong || `${placeholder}Pong`
    },
    'phaser-rts': {
      path: () => import('./juegos/PhaserRTSGame'),
      name: 'Phaser RTS',
      description: 'A real-time strategy game built with Phaser.',
      image: `${placeholder}Phaser+RTS`
    },
    'threejs-sprites': {
      path: () => import('./juegos/ThreeJSCSS3DSprites'),
      name: 'Three.js 3D Sprites',
      description: 'Interactive 3D sprite demonstration with Three.js.',
      image: `${placeholder}3D+Sprites`
    }
  },

  // DEFINICIÓN DE HERRAMIENTAS
  tools: {
    'learn-perspective': {
      path: () => import('./tools/LearnPerspective'),
      name: 'Interactive 3D Box Rotation Tool for Artists',
      description: 'A simple, browser-based tool designed to help artists practice and visualize 3D perspective. This tool simplifies the complex task of drawing a cube from any angle by restricting rotations to the key increments (0°, 22.5°, 45°, 67.5°, and 90°) commonly used in foundational drawing exercises.',
      image: SITE_IMAGES.boxRotation || `${placeholder}Perspective+Tool`
    },
    'bloom-effect': {
      path: () => import('./tools/BloomTool'),
      name: 'Image Glow Generator',
      description: 'Upload your own images and apply a stunning post-processing Bloom/Glow effect using Three.js shaders.',
      image: SITE_IMAGES.bloomTool || `${placeholder}Bloom+Tool`
    },
    'robot-viewer': {
      path: () => import('./juegos/RobotViewer'),
      name: 'Robot Viewer',
      description: 'View and interact with a 3D robot model.',
      image: SITE_IMAGES.robotViewer || `${placeholder}Robot+Viewer`
    }
  }
};

// Validar que todos los elementos tengan las propiedades requeridas
const validateRegistry = (registry) => {
  const requiredProps = ['path', 'name', 'description', 'image'];

  Object.keys(registry).forEach(category => {
    Object.keys(registry[category]).forEach(key => {
      const item = registry[category][key];
      requiredProps.forEach(prop => {
        if (!item[prop]) {
          console.warn(`Missing property '${prop}' in ${category}.${key}`);
        }
      });
    });
  });
};

// Ejecutar validación
validateRegistry(gameRegistry);

export default gameRegistry;

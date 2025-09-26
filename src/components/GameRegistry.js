// GameRegistry.js
import snakeImage from '../images/snake-game.webp';
import snake3dImage from '../images/snake-3d.webp';
import pongImage from '../images/pong-game.webp';
import handInvadersImage from '../images/hand-invaders-preview.webp';
import supermarcosImage from '../images/supermarcos.webp';
import guessCountryImage from '../images/guess-country.webp';
import robotViewerImage from '../images/robot-viewer.webp';

const placeholder = 'https://via.placeholder.com/300x180?text=';

const gameRegistry = {
  games: {
    'snake': {
      path: () => import('./juegos/SnakeGame'),
      name: 'Snake Classic',
      description: 'The classic Snake game. Guide the snake, collect food, and try not to hit the walls!',
      image: snakeImage || `${placeholder}Snake+Classic`
    },
    'SnakeGame3D': {
      path: () => import('./juegos/SnakeGame3D'),
      name: 'Snake 3D',
      description: 'A modern 3D twist on the classic Snake game. Experience snake-gaming in a whole new dimension!',
      image: snake3dImage || `${placeholder}Snake+3D`
    },
    'pong': {
      path: () => import('./juegos/PongGame'),
      name: 'Pong',
      description: 'Classic arcade game. Challenge yourself against the AI in this timeless tennis-style game.',
      image: pongImage || `${placeholder}Pong`
    },
    'hand-invaders': {
      path: () => import('./juegos/HandInvadersGame'),
      name: 'Hand Invaders',
      description: 'Defend against invaders using your hand gestures recognized by your camera!',
      image: handInvadersImage || `${placeholder}Hand+Invaders`
    },
    'supermarcos': {
      path: () => import('./juegos/SuperMarcos'),
      name: 'SuperMarcos',
      description: 'A 2D platformer adventure game with levels, enemies, and power-ups.',
      image: supermarcosImage || `${placeholder}SuperMarcos`
    },
    'guess-the-country': {
      path: () => import('./juegos/GuessTheCountry'),
      name: 'Guess The Country',
      description: 'Test your geography knowledge! Click on the map to guess the 15 most populous countries.',
      image: guessCountryImage || `${placeholder}Guess+Country`
    },
    'robot-viewer': {
      path: () => import('./juegos/RobotViewer'),
      name: '3D Robot Viewer',
      description: 'An interactive 3D viewer for a robot model. You can rotate, move and zoom.',
      image: robotViewerImage || `${placeholder}Robot+Viewer`
    }
  },
  tools: {
    'Terminal': {
      path: () => import('./tools/Terminal'),
      name: 'Interactive Terminal',
      description: 'A web-based terminal with custom commands. Built with XTerm.js.',
      image: `${placeholder}Terminal`
    },
    'CarViewer': {
      path: () => import('./tools/CarViewer'),
      name: '3D Car Viewer',
      description: 'A 3D model viewer for a car, built with Three.js. You can rotate, pan, and zoom.',
      image: `${placeholder}3D+Car`
    },
    'ModelViewer': {
      path: () => import('./tools/ModelViewer'),
      name: 'Generic 3D Model Viewer',
      description: 'A simple 3D model viewer demo using Three.js and GLTFLoader.',
      image: `${placeholder}3D+Model`
    },
    'EnhancedCubes': {
      path: () => import('./tools/EnhancedCubes'),
      name: '3D Scene with Shaders',
      description: 'A Three.js demo showcasing post-processing effects like bloom and pixelation.',
      image: `${placeholder}3D+Scene`
    },
    'Cube': {
      path: () => import('./tools/Cube'),
      name: 'Pixelated Cube Demo',
      description: 'A basic Three.js scene with a rotating cube and a pixelation post-processing effect.',
      image: `${placeholder}Pixel+Cube`
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


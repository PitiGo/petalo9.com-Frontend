// GameRegistry.js
import snakeImage from '../images/snake-game.webp';
import snake3dImage from '../images/snake-3d.webp';
import pongImage from '../images/pong-game.webp';
import handInvadersImage from '../images/hand-invaders-preview.webp';
import supermarcosImage from '../images/supermarcos.webp';
import guessCountryImage from '../images/guess-country.webp';
import robotViewerImage from '../images/robot-viewer.webp';

import boxRotationImage from '../images/box-rotation-thumbnail.webp';
import bloomToolImage from '../images/bloom-tool-thumbnail-v2.png';

const placeholder = 'https://via.placeholder.com/300x180?text=';

const gameRegistry = {
  // ... (resto del código igual)
  tools: {
    'learn-perspective': {
      path: () => import('./tools/LearnPerspective'),
      name: 'Interactive 3D Box Rotation Tool for Artists',
      description: 'A simple, browser-based tool designed to help artists practice and visualize 3D perspective. This tool simplifies the complex task of drawing a cube from any angle by restricting rotations to the key increments (0°, 22.5°, 45°, 67.5°, and 90°) commonly used in foundational drawing exercises.',
      image: boxRotationImage || `${placeholder}Perspective+Tool`
    },
    'bloom-effect': {
      path: () => import('./tools/BloomTool'),
      name: 'Image Glow Generator',
      description: 'Upload your own images and apply a stunning post-processing Bloom/Glow effect using Three.js shaders.',
      image: bloomToolImage || `${placeholder}Bloom+Tool`
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


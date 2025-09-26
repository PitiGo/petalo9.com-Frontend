import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';

const EnhancedSnakeGame3D = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const sceneRef = useRef(null);
  const snakeRef = useRef([]);
  const directionRef = useRef(new BABYLON.Vector3(1, 0, 0));
  const foodRef = useRef(null);
  const moveIntervalRef = useRef(null);
  const speedRef = useRef(300);
  const foodsEatenRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);

      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2, // Rotación horizontal (alfa)
        Math.PI / 4,  // Rotación vertical (beta) para un ángulo isométrico
        25,           // Distancia de la cámara al centro (radio) - más cerca
        new BABYLON.Vector3(0, 0, 0), // Apuntar al centro del tablero
        scene
      );

      // Deshabilita el control del usuario sobre la cámara para que no se mueva
      camera.detachControl(canvas);

      // Improved lighting setup
      const hemisphericLight = new BABYLON.HemisphericLight('hemisphericLight', new BABYLON.Vector3(0, 1, 0), scene);
      hemisphericLight.intensity = 0.8;
      hemisphericLight.diffuse = new BABYLON.Color3(1, 1, 1);
      hemisphericLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);

      const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -2, -1), scene);
      directionalLight.intensity = 1.2;
      directionalLight.diffuse = new BABYLON.Color3(1, 1, 0.9);
      directionalLight.specular = new BABYLON.Color3(1, 1, 1);

      // Additional rim light for better depth
      const rimLight = new BABYLON.DirectionalLight("rimLight", new BABYLON.Vector3(1, 0.5, 1), scene);
      rimLight.intensity = 0.4;
      rimLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1);

      // Enhanced ground with better materials
      const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 35, height: 18, subdivisions: 32 }, scene);
      const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
      
      const texture = new BABYLON.DynamicTexture('dynamic texture', { width: 1024, height: 512 }, scene);
      groundMaterial.diffuseTexture = texture;

      const context = texture.getContext();
      const width = 1024;
      const height = 512;
      const numberOfSquaresX = 16;
      const numberOfSquaresY = 8;
      const squareSizeX = width / numberOfSquaresX;
      const squareSizeY = height / numberOfSquaresY;

      for (let i = 0; i < numberOfSquaresX; i++) {
        for (let j = 0; j < numberOfSquaresY; j++) {
          // Enhanced checkerboard pattern with better colors
          const baseColor = (i + j) % 2 === 0 ? '#2a4a3a' : '#1a3a2a';
          context.fillStyle = baseColor;
          context.fillRect(i * squareSizeX, j * squareSizeY, squareSizeX, squareSizeY);

          // Enhanced gradient effect
          const gradient = context.createRadialGradient(
            i * squareSizeX + squareSizeX/2, j * squareSizeY + squareSizeY/2, 0,
            i * squareSizeX + squareSizeX/2, j * squareSizeY + squareSizeY/2, squareSizeX / 2
          );
          gradient.addColorStop(0, 'rgba(100, 255, 150, 0.3)');
          gradient.addColorStop(0.7, 'rgba(50, 200, 100, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          context.fillStyle = gradient;
          context.fillRect(i * squareSizeX, j * squareSizeY, squareSizeX, squareSizeY);
        }
      }

      texture.update();
      ground.material = groundMaterial;

      // Enhanced material properties
      groundMaterial.specularColor = new BABYLON.Color3(0.3, 0.5, 0.3);
      groundMaterial.specularPower = 128;
      groundMaterial.ambientColor = new BABYLON.Color3(0.2, 0.3, 0.2);
      groundMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.05);

      // Enhanced border material with glow effect
      const borderMaterial = new BABYLON.StandardMaterial('borderMat', scene);
      borderMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#ffd700');
      borderMaterial.specularColor = new BABYLON.Color3(1, 1, 0.8);
      borderMaterial.specularPower = 256;
      borderMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.1);
      borderMaterial.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.2);

      const createBorder = (name, dimensions, position) => {
        const border = BABYLON.MeshBuilder.CreateBox(name, dimensions, scene);
        border.position = position;
        border.material = borderMaterial;
        return border;
      };

      createBorder('borderTop', { width: 35, height: 0.2, depth: 0.2 }, new BABYLON.Vector3(0, 0.1, 9));
      createBorder('borderBottom', { width: 35, height: 0.2, depth: 0.2 }, new BABYLON.Vector3(0, 0.1, -9));
      createBorder('borderLeft', { width: 0.2, height: 0.2, depth: 18 }, new BABYLON.Vector3(-17.5, 0.1, 0));
      createBorder('borderRight', { width: 0.2, height: 0.2, depth: 18 }, new BABYLON.Vector3(17.5, 0.1, 0));

      return scene;
    };

    const scene = createScene();
    sceneRef.current = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    speedRef.current = 300;
    foodsEatenRef.current = 0;
    const scene = sceneRef.current;

    scene.meshes.slice().forEach((mesh) => {
      if (!['ground', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight'].includes(mesh.name)) {
        mesh.dispose();
      }
    });

    foodRef.current = null;

    snakeRef.current = [];
    directionRef.current = new BABYLON.Vector3(1, 0, 0);

    // Enhanced snake head with better material
    const snakeHead = BABYLON.MeshBuilder.CreateBox('snakeHead', { size: 1 }, scene);
    const snakeMaterial = new BABYLON.StandardMaterial('snakeMat', scene);
    snakeMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
    snakeMaterial.specularColor = new BABYLON.Color3(0.5, 1, 0.5);
    snakeMaterial.specularPower = 128;
    snakeMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1);
    snakeMaterial.ambientColor = new BABYLON.Color3(0.1, 0.4, 0.1);
    snakeHead.material = snakeMaterial;
    snakeHead.position = new BABYLON.Vector3(-15, 0.5, 0);
    snakeRef.current.push(snakeHead);

    createFood();

    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    moveIntervalRef.current = setInterval(moveSnake, speedRef.current);

    window.removeEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);
  };

  const createFood = () => {
    const scene = sceneRef.current;
    // Enhanced food with sphere and glow effect
    const food = BABYLON.MeshBuilder.CreateSphere('food', { diameter: 1, segments: 16 }, scene);
    const foodMaterial = new BABYLON.StandardMaterial('foodMat', scene);
    foodMaterial.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    foodMaterial.specularColor = new BABYLON.Color3(1, 0.8, 0.8);
    foodMaterial.specularPower = 256;
    foodMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.1);
    foodMaterial.ambientColor = new BABYLON.Color3(0.4, 0.1, 0.1);
    food.material = foodMaterial;
    food.position = new BABYLON.Vector3(
      Math.floor(Math.random() * 33 - 16.5),
      0.5,
      Math.floor(Math.random() * 16 - 8)
    );
    foodRef.current = food;
  };

  const moveSnake = () => {
    const scene = sceneRef.current;
    const snake = snakeRef.current;
    const head = snake[0];
    const newHeadPos = head.position.add(directionRef.current);

    if (Math.abs(newHeadPos.x) > 17 || Math.abs(newHeadPos.z) > 8.5) {
      gameOverFunction();
      return;
    }

    for (let i = 1; i < snake.length; i++) {
      if (BABYLON.Vector3.Distance(newHeadPos, snake[i].position) < 0.1) {
        gameOverFunction();
        return;
      }
    }

    if (foodRef.current && BABYLON.Vector3.Distance(newHeadPos, foodRef.current.position) < 1) {
      foodRef.current.dispose();
      createFood();
      setScore((prevScore) => prevScore + 10);

      foodsEatenRef.current += 1;

      if (foodsEatenRef.current % 3 === 0 && speedRef.current > 100) {
        speedRef.current -= 50;
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = setInterval(moveSnake, speedRef.current);
      }

      // Enhanced snake segment with better material
      const newSegment = BABYLON.MeshBuilder.CreateBox('snakeSegment', { size: 1 }, scene);
      const segmentMaterial = new BABYLON.StandardMaterial('segmentMat', scene);
      segmentMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
      segmentMaterial.specularColor = new BABYLON.Color3(0.3, 0.8, 0.3);
      segmentMaterial.specularPower = 64;
      segmentMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.2, 0.05);
      segmentMaterial.ambientColor = new BABYLON.Color3(0.08, 0.3, 0.08);
      newSegment.material = segmentMaterial;
      newSegment.position = snake[snake.length - 1].position.clone();
      snake.push(newSegment);
    }

    for (let i = snake.length - 1; i > 0; i--) {
      snake[i].position = snake[i - 1].position.clone();
    }

    head.position = newHeadPos;
  };

  const handleKeyDown = (event) => {
    const key = event.key;
    switch (key) {
      case 'w':
      case 'ArrowUp':
        if (!directionRef.current.equals(new BABYLON.Vector3(0, 0, -1))) {
          directionRef.current = new BABYLON.Vector3(0, 0, 1);
        }
        break;
      case 's':
      case 'ArrowDown':
        if (!directionRef.current.equals(new BABYLON.Vector3(0, 0, 1))) {
          directionRef.current = new BABYLON.Vector3(0, 0, -1);
        }
        break;
      case 'a':
      case 'ArrowLeft':
        if (!directionRef.current.equals(new BABYLON.Vector3(1, 0, 0))) {
          directionRef.current = new BABYLON.Vector3(-1, 0, 0);
        }
        break;
      case 'd':
      case 'ArrowRight':
        if (!directionRef.current.equals(new BABYLON.Vector3(-1, 0, 0))) {
          directionRef.current = new BABYLON.Vector3(1, 0, 0);
        }
        break;
      default:
        break;
    }
  };

  const gameOverFunction = () => {
    clearInterval(moveIntervalRef.current);
    window.removeEventListener('keydown', handleKeyDown);
    setGameStarted(false);
    setGameOver(true);
  };

  const Instructions = () => (
    <div style={{
      position: 'absolute',
      top: '10%',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 40, 20, 0.8))',
      padding: '25px',
      borderRadius: '15px',
      zIndex: 2,
      width: '85%',
      maxWidth: '450px',
      border: '2px solid rgba(100, 255, 150, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(100, 255, 150, 0.2)',
      backdropFilter: 'blur(10px)',
    }}>
      <h2 style={{
        margin: '0 0 15px 0',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#64ff96',
        textShadow: '0 0 10px rgba(100, 255, 150, 0.5)',
      }}>🐍 Snake 3D</h2>
      <div style={{
        margin: '15px 0',
        padding: '10px',
        background: 'rgba(100, 255, 150, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(100, 255, 150, 0.3)',
      }}>
        <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold', color: '#64ff96' }}>🎮 Controls:</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>• Arrow Keys: ↑ ↓ ← →</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>• WASD Keys: W A S D</p>
      </div>
      <p style={{ margin: '8px 0', fontSize: '14px', color: '#ccc' }}>Camera is fixed for optimal gameplay view</p>
    </div>
  );

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {gameStarted && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 15,
              left: 15,
              color: 'white',
              fontSize: '18px',
              zIndex: 1,
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '10px 15px',
              borderRadius: '10px',
              border: '1px solid rgba(100, 255, 150, 0.3)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <div style={{ color: '#64ff96', fontWeight: 'bold' }}>Score: {score}</div>
            <div style={{ fontSize: '14px', color: '#ccc' }}>Speed: {(1000 / speedRef.current).toFixed(1)} moves/sec</div>
          </div>
          
          {/* Controls indicator during game */}
          <div
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              color: 'white',
              fontSize: '12px',
              zIndex: 1,
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(100, 255, 150, 0.2)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <div style={{ color: '#64ff96', fontWeight: 'bold', marginBottom: '4px' }}>🎮 Controls</div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>WASD or ↑↓←→</div>
          </div>
        </>
      )}
      {!gameStarted && !gameOver && (
        <>
          <Instructions />
          <button
            onClick={startGame}
            style={{
              position: 'absolute',
              zIndex: 2,
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '15px 30px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4), 0 0 15px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateX(-50%) scale(1.05)';
              e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5), 0 0 20px rgba(76, 175, 80, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateX(-50%) scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4), 0 0 15px rgba(76, 175, 80, 0.3)';
            }}
          >
            🎮 Start Game
          </button>
        </>
      )}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 20, 20, 0.9))',
            padding: '30px',
            borderRadius: '20px',
            border: '2px solid rgba(255, 100, 100, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 100, 100, 0.2)',
            backdropFilter: 'blur(10px)',
            minWidth: '300px',
          }}
        >
          <h1 style={{
            margin: '0 0 15px 0',
            fontSize: '28px',
            color: '#ff6464',
            textShadow: '0 0 15px rgba(255, 100, 100, 0.5)',
          }}>💀 Game Over!</h1>
          <p style={{
            fontSize: '18px',
            margin: '10px 0 20px 0',
            color: '#ffaa64',
          }}>Your Score: <span style={{ color: '#64ff96', fontWeight: 'bold' }}>{score}</span></p>
          <button
            onClick={startGame}
            style={{
              padding: '12px 25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4), 0 0 15px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5), 0 0 20px rgba(76, 175, 80, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4), 0 0 15px rgba(76, 175, 80, 0.3)';
            }}
          >
            🔄 Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSnakeGame3D;
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
        -Math.PI / 2,
        Math.PI / 3,
        35,
        new BABYLON.Vector3(0, 0, 0),
        scene
      );
      camera.upperBetaLimit = Math.PI / 2.2;
      camera.lowerRadiusLimit = 30;
      camera.upperRadiusLimit = 50;
      camera.attachControl(canvas, true);

      new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
      const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
      dirLight.intensity = 0.6;

      const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 35, height: 18 }, scene);
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
          const baseColor = (i + j) % 2 === 0 ? '#8a8a8a' : '#4a4a4a';
          context.fillStyle = baseColor;
          context.fillRect(i * squareSizeX, j * squareSizeY, squareSizeX, squareSizeY);

          const gradient = context.createRadialGradient(
            i * squareSizeX, j * squareSizeY, 0,
            i * squareSizeX, j * squareSizeY, squareSizeX / 2
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          context.fillStyle = gradient;
          context.fillRect(i * squareSizeX, j * squareSizeY, squareSizeX, squareSizeY);
        }
      }

      texture.update();
      ground.material = groundMaterial;

      groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      groundMaterial.specularPower = 64;

      const borderMaterial = new BABYLON.StandardMaterial('borderMat', scene);
      borderMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#ffd700');
      borderMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);

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

    const snakeHead = BABYLON.MeshBuilder.CreateBox('snakeHead', { size: 1 }, scene);
    const snakeMaterial = new BABYLON.StandardMaterial('snakeMat', scene);
    snakeMaterial.diffuseColor = BABYLON.Color3.Green();
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
    const food = BABYLON.MeshBuilder.CreateSphere('food', { diameter: 1 }, scene);
    const foodMaterial = new BABYLON.StandardMaterial('foodMat', scene);
    foodMaterial.diffuseColor = BABYLON.Color3.Red();
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

      const newSegment = BABYLON.MeshBuilder.CreateBox('snakeSegment', { size: 1 }, scene);
      const snakeMaterial = new BABYLON.StandardMaterial('snakeMat', scene);
      snakeMaterial.diffuseColor = BABYLON.Color3.Green();
      newSegment.material = snakeMaterial;
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
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '20px',
      borderRadius: '10px',
      zIndex: 2,
      width: '80%',
      maxWidth: '400px',
    }}>
      <h2>Instructions</h2>
      <p>Use arrow keys or WASD to move the snake</p>
      <p>Left click + drag: Rotate camera</p>
      <p>Right click + drag: Move camera</p>
      <p>Mouse wheel: Zoom</p>
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
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            color: 'white',
            fontSize: '20px',
            zIndex: 1,
          }}
        >
          Score: {score} | Speed: {(1000 / speedRef.current).toFixed(1)} moves/sec
        </div>
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
              padding: '10px 20px',
              fontSize: '24px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
            }}
          >
            Start Game
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          <h1>Game Over!</h1>
          <p>Your Score: {score}</p>
          <button
            onClick={startGame}
            style={{
              padding: '10px 20px',
              fontSize: '24px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSnakeGame3D;
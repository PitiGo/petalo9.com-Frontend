import React, { useRef, useEffect, useState, useCallback } from 'react';
import './SnakeGame.css';

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 2, y: 2 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const cellSize = 20;
  const canvasSize = 400;

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * (canvasSize / cellSize)),
        y: Math.floor(Math.random() * (canvasSize / cellSize))
      };
    } while (
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y)
    );
    return newFood;
  }, [snake, obstacles, canvasSize, cellSize]);

  const generateObstacles = useCallback(() => {
    const newObstacles = [];
    for (let i = 0; i < level; i++) {
      let obstacle;
      do {
        obstacle = {
          x: Math.floor(Math.random() * (canvasSize / cellSize)),
          y: Math.floor(Math.random() * (canvasSize / cellSize))
        };
      } while (
        snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) ||
        (food.x === obstacle.x && food.y === obstacle.y) ||
        newObstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y)
      );
      newObstacles.push(obstacle);
    }
    setObstacles(newObstacles);
  }, [level, snake, food, canvasSize, cellSize]);

  const drawGame = useCallback((ctx) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
      const brightness = 1 - index * 0.05;
      ctx.fillStyle = `rgba(76, 175, 80, ${brightness})`;
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 1, cellSize - 1);
    });

    // Draw food
    ctx.fillStyle = '#FF4136';
    ctx.beginPath();
    ctx.arc(
      (food.x * cellSize) + cellSize / 2,
      (food.y * cellSize) + cellSize / 2,
      cellSize / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw obstacles
    ctx.fillStyle = '#333333';
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x * cellSize, obstacle.y * cellSize, cellSize, cellSize);
    });

    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvasSize, canvasSize);
  }, [snake, food, obstacles, canvasSize, cellSize]);

  const moveSnake = useCallback(() => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
      default: break;
    }

    // Wrap around edges
    if (head.x < 0) head.x = canvasSize / cellSize - 1;
    if (head.x >= canvasSize / cellSize) head.x = 0;
    if (head.y < 0) head.y = canvasSize / cellSize - 1;
    if (head.y >= canvasSize / cellSize) head.y = 0;

    // Check collisions
    if (
      newSnake.some(segment => segment.x === head.x && segment.y === head.y) ||
      obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)
    ) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(prevScore => {
        const newScore = prevScore + 1;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snakeHighScore', newScore);
        }
        if (newScore % 5 === 0) {
          setLevel(prevLevel => prevLevel + 1);
          generateObstacles();
        }
        return newScore;
      });
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, obstacles, generateFood, generateObstacles, highScore, canvasSize, cellSize]);

  const handleKeyPress = useCallback((event) => {
    switch (event.key.toLowerCase()) {
      case 'w': if (direction !== 'DOWN') setDirection('UP'); break;
      case 's': if (direction !== 'UP') setDirection('DOWN'); break;
      case 'a': if (direction !== 'RIGHT') setDirection('LEFT'); break;
      case 'd': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      default: break;
    }
  }, [direction]);

  const restartGame = useCallback(() => {
    setSnake([{ x: 2, y: 2 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setObstacles([]);
    setShowInstructions(true);
  }, [generateFood]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('snakeHighScore');
    if (storedHighScore) setHighScore(parseInt(storedHighScore, 10));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const gameLoop = setInterval(() => {
      if (!gameOver && !showInstructions) {
        moveSnake();
        drawGame(ctx);
      }
    }, 100);

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [drawGame, moveSnake, handleKeyPress, gameOver, showInstructions, generateFood]);

  return (
    <div className="game-container">
      <div className="background-name">Dante</div>
      <div className="score-board">Score: {score} | High Score: {highScore} | Level: {level}</div>
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize} />
      {showInstructions && (
        <div className="instructions-overlay">
          <h2>Snake Game Instructions</h2>
          <p>Use WASD keys to control the snake:</p>
          <ul>
            <li>W: Move Up</li>
            <li>A: Move Left</li>
            <li>S: Move Down</li>
            <li>D: Move Right</li>
          </ul>
          <p>Eat the red food to grow and gain points.</p>
          <p>Avoid hitting the walls, obstacles, or yourself!</p>
          <button className="start-button" onClick={() => setShowInstructions(false)}>Start Game</button>
        </div>
      )}
      {gameOver && (
        <div className="game-over-overlay">
          <div>Game Over!</div>
          <div>Your Score: {score}</div>
          <div>Level Reached: {level}</div>
          <button className="restart-button" onClick={restartGame}>Restart Game</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
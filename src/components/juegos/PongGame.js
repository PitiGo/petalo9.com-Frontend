import React, { useRef, useEffect, useState } from 'react';

const PongGame = () => {
    const canvasRef = useRef(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [gameState, setGameState] = useState('name');
    const [difficulty, setDifficulty] = useState('medium');
    const [playerName, setPlayerName] = useState('');
    const [inputError, setInputError] = useState('');

    const paddleHeight = 100;
    const paddleWidth = 15;
    const ballRadius = 10;

    const difficultySettings = {
        easy: { paddleSpeed: 1.5, ballSpeed: 3, computerAccuracy: 0.7 },
        medium: { paddleSpeed: 2, ballSpeed: 4, computerAccuracy: 0.8 },
        hard: { paddleSpeed: 2.5, ballSpeed: 5, computerAccuracy: 0.9 }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let playerPaddleY = canvas.height / 2 - paddleHeight / 2;
        let computerPaddleY = canvas.height / 2 - paddleHeight / 2;
        let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: difficultySettings[difficulty].ballSpeed, dy: difficultySettings[difficulty].ballSpeed };

        const resetBall = () => {
            ball = { 
                x: canvas.width / 2, 
                y: canvas.height / 2, 
                dx: (Math.random() > 0.5 ? 1 : -1) * difficultySettings[difficulty].ballSpeed, 
                dy: (Math.random() > 0.5 ? 1 : -1) * difficultySettings[difficulty].ballSpeed 
            };
        };

        const update = () => {
            if (gameState !== 'playing') return;

            ball.x += ball.dx;
            ball.y += ball.dy;

            if (ball.y + ball.dy > canvas.height - ballRadius || ball.y + ball.dy < ballRadius) {
                ball.dy = -ball.dy;
            }

            if (
                (ball.dx < 0 && ball.x - ballRadius <= paddleWidth && ball.y >= playerPaddleY && ball.y <= playerPaddleY + paddleHeight) ||
                (ball.dx > 0 && ball.x + ballRadius >= canvas.width - paddleWidth && ball.y >= computerPaddleY && ball.y <= computerPaddleY + paddleHeight)
            ) {
                ball.dx = -ball.dx * 1.05;
                const paddleCenter = ball.dx < 0 ? playerPaddleY + paddleHeight / 2 : computerPaddleY + paddleHeight / 2;
                ball.dy = (ball.y - paddleCenter) * 0.2;
            }

            if (ball.x + ballRadius > canvas.width) {
                setPlayerScore(prevScore => {
                    const newScore = prevScore + 1;
                    if (newScore === 10) setGameState('gameOver');
                    return newScore;
                });
                resetBall();
            } else if (ball.x - ballRadius < 0) {
                setComputerScore(prevScore => {
                    const newScore = prevScore + 1;
                    if (newScore === 10) setGameState('gameOver');
                    return newScore;
                });
                resetBall();
            }

            const computerIdealY = ball.y - paddleHeight / 2;
            if (Math.random() < difficultySettings[difficulty].computerAccuracy) {
                computerPaddleY += (computerIdealY - computerPaddleY) * 0.1;
            }
            computerPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, computerPaddleY));
        };

        const drawBackground = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = 'bold 200px Arial';
            ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DANTE', canvas.width / 2, canvas.height / 2);
        };

        const draw = () => {
            drawBackground();

            ctx.strokeStyle = '#FFFFFF';
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, playerPaddleY, paddleWidth, paddleHeight);
            ctx.fillRect(canvas.width - paddleWidth, computerPaddleY, paddleWidth, paddleHeight);

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '32px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${playerName}: ${playerScore}`, 20, 50);
            ctx.textAlign = 'right';
            ctx.fillText(`AI: ${computerScore}`, canvas.width - 20, 50);

            if (gameState !== 'playing') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                if (gameState === 'start') {
                    ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2);
                } else if (gameState === 'paused') {
                    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
                } else if (gameState === 'gameOver') {
                    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
                    ctx.font = '32px Arial';
                    const winner = playerScore > computerScore ? playerName : 'AI';
                    ctx.fillText(`${winner} wins!`, canvas.width / 2, canvas.height / 2 + 50);
                    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 100);
                } else if (gameState === 'instructions') {
                    ctx.font = '24px Arial';
                    ctx.fillText('Instructions:', canvas.width / 2, 100);
                    ctx.fillText('Use ↑↓ or W/S to move paddle', canvas.width / 2, 150);
                    ctx.fillText('SPACE to start/pause', canvas.width / 2, 200);
                    ctx.fillText('R to reset', canvas.width / 2, 250);
                    ctx.fillText('1-2-3 to change difficulty', canvas.width / 2, 300);
                    ctx.fillText('Press SPACE to continue', canvas.width / 2, 350);
                }
            }
        };

        const gameLoop = () => {
            update();
            draw();
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        const handleKeyDown = (e) => {
            if (gameState === 'instructions') {
                if (e.code === 'Space') {
                    setGameState('start');
                }
            } else if (gameState === 'start' || gameState === 'playing' || gameState === 'paused') {
                if (e.code === 'Space') {
                    setGameState(prevState => prevState === 'playing' ? 'paused' : 'playing');
                }
                if (e.code === 'KeyR') {
                    setPlayerScore(0);
                    setComputerScore(0);
                    setGameState('start');
                    resetBall();
                }
                if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
                    setDifficulty(e.code === 'Digit1' ? 'easy' : e.code === 'Digit2' ? 'medium' : 'hard');
                    setGameState('start');
                    resetBall();
                }
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    playerPaddleY = Math.max(0, playerPaddleY - 20);
                }
                if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    playerPaddleY = Math.min(canvas.height - paddleHeight, playerPaddleY + 20);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [difficulty, gameState, playerScore, computerScore, playerName]);

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            setInputError('');
            setGameState('instructions');
        } else {
            setInputError('Please enter a valid name');
        }
    };

    if (gameState === 'name') {
        return (
            <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', color: 'white', padding: '20px' }}>
                <h2>Welcome to Pong!</h2>
                <form onSubmit={handleNameSubmit}>
                    <label htmlFor="playerName">Enter your name:</label>
                    <input 
                        id="playerName"
                        type="text" 
                        value={playerName} 
                        onChange={(e) => setPlayerName(e.target.value)} 
                        style={{ fontSize: '18px', padding: '5px', margin: '10px' }}
                    />
                    <button type="submit" style={{ fontSize: '18px', padding: '5px 10px' }}>
                        Start Game
                    </button>
                </form>
                {inputError && <p style={{ color: 'red' }}>{inputError}</p>}
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <canvas ref={canvasRef} width="800" height="400" style={{ border: '2px solid white' }} />
            <div style={{ marginTop: '20px', color: 'white' }}>
                <p>Player: {playerName} | Difficulty: {difficulty}</p>
            </div>
        </div>
    );
};

export default PongGame;
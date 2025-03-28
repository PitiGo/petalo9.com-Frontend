import React, { useEffect, useRef } from 'react';
import './HandInvadersGame.css';
import { initGame } from './handInvadersLogic';

function HandInvadersGame() {
    // Refs for DOM elements the game logic needs
    const videoRef = useRef(null);
    const gameCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const loadingRef = useRef(null);
    const startScreenRef = useRef(null);
    const gameOverScreenRef = useRef(null);
    const scoreRef = useRef(null);
    const finalScoreRef = useRef(null);
    const startButtonRef = useRef(null);
    const restartButtonRef = useRef(null);

    // Ref to store cleanup function returned by initGame
    const cleanupFuncRef = useRef(null);

    useEffect(() => {
        // Check if MediaPipe is loaded (assuming global loading)
        if (window.Hands && window.Camera && window.drawConnectors) {
            const elements = {
                videoElement: videoRef.current,
                gameCanvasElement: gameCanvasRef.current,
                overlayCanvasElement: overlayCanvasRef.current,
                loadingElement: loadingRef.current,
                startScreenElement: startScreenRef.current,
                gameOverScreenElement: gameOverScreenRef.current,
                scoreElement: scoreRef.current,
                finalScoreElement: finalScoreRef.current,
                startButton: startButtonRef.current,
                restartButton: restartButtonRef.current,
            };

            // Initialize the game logic, passing the elements
            // Store the returned cleanup function
            cleanupFuncRef.current = initGame(elements);

        } else {
            console.error("MediaPipe scripts not loaded yet!");
            if (loadingRef.current) {
                loadingRef.current.textContent = "Error: Required scripts not loaded.";
                loadingRef.current.style.display = 'flex';
            }
        }

        // Cleanup function when component unmounts
        return () => {
            console.log("Cleaning up HandInvadersGame...");
            if (cleanupFuncRef.current) {
                cleanupFuncRef.current();
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="hand-invaders-container">
            {/* Game/Video Row */}
            <div className="main-content-wrapper">
                {/* Video and Overlay Area (Now First) */}
                <div className="video-container">
                    <video ref={videoRef} id="webcam" className="input_video" autoPlay playsInline></video>
                    <canvas ref={overlayCanvasRef} id="overlayCanvas"></canvas>
                </div>

                {/* Game Area (Now Second) */}
                <div className="container">
                    <div id="game-area">
                        <canvas ref={gameCanvasRef} id="gameCanvas" width="600" height="400"></canvas>
                        <div ref={loadingRef} id="loading">Loading hand model and camera...</div>
                        <div ref={startScreenRef} id="start-screen" style={{ display: 'none' }}>
                            <h2>Ready to Play</h2>
                            <button ref={startButtonRef} id="startButton">Start Game</button>
                        </div>
                        <div ref={gameOverScreenRef} id="game-over-screen" style={{ display: 'none' }}>
                            <h2>Game Over!</h2>
                            <p>Final Score: <span ref={finalScoreRef} id="final-score">0</span></p>
                            <button ref={restartButtonRef} id="restartButton">Play Again</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Display */}
            <div className="info hand-invaders-score">
                Score: <span ref={scoreRef} id="score">0</span>
            </div>
            {/* Instructions */}
            <div className="hand-invaders-instructions">
                <p>Use your right hand. Move horizontally to move. Pinch to shoot.</p>
            </div>
        </div>
    );
}

export default HandInvadersGame; 
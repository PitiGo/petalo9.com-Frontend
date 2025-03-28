// Store variables that need to persist across calls within this module's scope
let hands, camera, animationFrameId;
let score, gameRunning, gameOver, player, bullets, enemies, powerups, shootInterval, handLandmarks;
let stars, backgroundGradient;
let playerImageLoaded = false, enemyImageLoaded = false;
let playerImage = new Image(), enemyImage = new Image();
let rapidFireFlash = false;

// Keep constants outside the init function
const gameCanvasWidth = 600;
const gameCanvasHeight = 400;
const overlayCanvasWidth = 320;
const overlayCanvasHeight = 240;

// --- Game Settings (Constants) ---
const bulletSpeed = 7;
const bulletWidth = 5;
const bulletHeight = 10;
const bulletColor = 'yellow';

const enemyAspectRatio = 35 / 25;
const enemyWidth = 35;
const enemyHeight = enemyWidth / enemyAspectRatio;
const enemyRows = 4;
const enemyCols = 8;
const enemySpacing = 15;
const enemyInitialY = 30;
const enemyInitialX = (gameCanvasWidth - (enemyCols * (enemyWidth + enemySpacing))) / 2;
let enemySpeed = 1;
let enemyDirection = 1;
let enemyDropDistance = 15;

const POWERUP_TYPES = { RAPID_FIRE: 'rapid_fire', SHIELD: 'shield' };
const powerupSize = 20;
const powerupSpeed = 2;
const powerupSpawnChance = 0.1;
const rapidFireDuration = 7000;
const rapidFireInterval = 5;
const originalShootInterval = 15;

const NUM_STARS = 150;
const STAR_SCROLL_SPEED = 0.3;

// Player default structure
let defaultPlayer = {
    x: gameCanvasWidth / 2 - 30,
    y: gameCanvasHeight - 60,
    width: 60,
    height: 55,
    speed: 15,
    dx: 0,
    smoothingFactor: 0.3,
    shieldActive: false,
    rapidFireActive: false,
    rapidFireTimeoutId: null,
    originalShootInterval: originalShootInterval
};

// SVG strings for player and enemy
const playerSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 55">
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#30FFFF; stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00A0A0; stop-opacity:1" />
    </linearGradient>
    <linearGradient id="engineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFF80;" />
      <stop offset="100%" style="stop-color:#FF8000;" />
    </linearGradient>
  </defs>
  <path d="M 25 53 Q 30 58 35 53 L 32 48 L 28 48 Z"
        fill="url(#engineGlow)" stroke="orange" stroke-width="0.5"/>
  <path d="M 30 0 L 10 25 C 5 30, 5 35, 15 40 L 25 50 L 35 50 L 45 40 C 55 35, 55 30, 50 25 Z"
        fill="url(#bodyGradient)" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M 30 5 L 22 20 L 38 20 Z" fill="#E0FFFF" stroke="white" stroke-width="1"/>
  <line x1="30" y1="5" x2="30" y2="18" stroke="#A0FFFF" stroke-width="1" />
  <circle cx="12" cy="28" r="1.5" fill="white"/>
  <circle cx="48" cy="28" r="1.5" fill="white"/>
</svg>`;

const enemySvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 25">
  <defs>
    <linearGradient id="enemyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E040E0; stop-opacity:1" />
      <stop offset="100%" style="stop-color:#800080; stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 5 5 L 10 15 L 15 12 L 20 12 L 25 15 L 30 5 L 25 8 L 20 5 L 15 5 L 10 8 Z"
        fill="url(#enemyGradient)" stroke="#FFFFFF" stroke-width="1" />
  <rect x="12" y="15" width="3" height="4" fill="yellow" />
  <rect x="20" y="15" width="3" height="4" fill="yellow" />
  <line x1="8" y1="5" x2="5" y2="0" stroke="white" stroke-width="0.5" />
  <line x1="27" y1="5" x2="30" y2="0" stroke="white" stroke-width="0.5" />
</svg>`;

// --- Exported Initialization Function ---
export function initGame(elements) {
    console.log("Initializing Hand Invaders Logic...");

    // Destructure passed elements
    const {
        videoElement,
        gameCanvasElement,
        overlayCanvasElement,
        loadingElement,
        startScreenElement,
        gameOverScreenElement,
        scoreElement,
        finalScoreElement,
        startButton,
        restartButton
    } = elements;

    // Get contexts
    const canvasCtx = gameCanvasElement.getContext('2d');
    const overlayCtx = overlayCanvasElement.getContext('2d');
    overlayCanvasElement.width = overlayCanvasWidth;
    overlayCanvasElement.height = overlayCanvasHeight;

    // Reset state variables
    score = 0;
    gameRunning = false;
    gameOver = false;
    player = { ...defaultPlayer };
    bullets = [];
    enemies = [];
    powerups = [];
    shootInterval = player.originalShootInterval;
    handLandmarks = null;
    stars = [];
    backgroundGradient = null;
    animationFrameId = null;
    playerImageLoaded = false;
    enemyImageLoaded = false;

    if (player.rapidFireTimeoutId) {
        clearTimeout(player.rapidFireTimeoutId);
        player.rapidFireTimeoutId = null;
    }

    // Load SVGs
    const encodedPlayerSvg = encodeURIComponent(playerSvgString);
    playerImage.src = 'data:image/svg+xml;charset=utf-8,' + encodedPlayerSvg;
    playerImage.onload = () => {
        playerImageLoaded = true;
        console.log("Player SVG loaded (Logic).");
        const aspectRatio = 60 / 55;
        const desiredHeight = 40;
        player.height = desiredHeight;
        player.width = desiredHeight * aspectRatio;
        player.x = gameCanvasWidth / 2 - player.width / 2;
        player.y = gameCanvasHeight - player.height - 10;
    };
    playerImage.onerror = (err) => { console.error("Error loading player SVG (Logic):", err); };

    const encodedEnemySvg = encodeURIComponent(enemySvgString);
    enemyImage.src = 'data:image/svg+xml;charset=utf-8,' + encodedEnemySvg;
    enemyImage.onload = () => {
        enemyImageLoaded = true;
        console.log("Enemy SVG loaded (Logic).");
    };
    enemyImage.onerror = (err) => { console.error("Error loading enemy SVG (Logic):", err); };

    // --- MediaPipe Setup ---
    const drawingUtils = window;
    hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });
    hands.onResults(onHandResults);

    // --- Camera Setup ---
    camera = new window.Camera(videoElement, {
        onFrame: async () => {
            if (videoElement.readyState >= 2) {
                if (overlayCanvasElement.width !== videoElement.videoWidth) {
                    overlayCanvasElement.width = videoElement.videoWidth;
                }
                if (overlayCanvasElement.height !== videoElement.videoHeight) {
                    overlayCanvasElement.height = videoElement.videoHeight;
                }
                await hands.send({ image: videoElement });
            }
        },
        width: 640,
        height: 480
    });

    // --- Game Logic Functions ---
    function initBackground() {
        stars = [];
        for (let i = 0; i < NUM_STARS; i++) {
            stars.push({
                x: Math.random() * gameCanvasWidth,
                y: Math.random() * gameCanvasHeight,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.5
            });
        }

        const gradientCenterX = gameCanvasWidth * 0.3;
        const gradientCenterY = gameCanvasHeight * 0.4;
        const gradientOuterRadius = gameCanvasWidth * 0.6;
        backgroundGradient = canvasCtx.createRadialGradient(
            gradientCenterX,
            gradientCenterY,
            0,
            gradientCenterX,
            gradientCenterY,
            gradientOuterRadius
        );
        backgroundGradient.addColorStop(0, 'rgba(40, 0, 80, 0.4)');
        backgroundGradient.addColorStop(0.6, 'rgba(20, 0, 40, 0.1)');
        backgroundGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        console.log("Background initialized (Logic).");
    }

    function updateBackground() {
        stars.forEach(star => {
            star.y += STAR_SCROLL_SPEED;
            if (star.y > gameCanvasHeight) {
                star.y = 0;
                star.x = Math.random() * gameCanvasWidth;
            }
            if (Math.random() < 0.005) {
                star.alpha = Math.random() * 0.5 + 0.5;
            }
        });
    }

    function drawBackground() {
        canvasCtx.fillStyle = '#000010';
        canvasCtx.fillRect(0, 0, gameCanvasWidth, gameCanvasHeight);
        if (backgroundGradient) {
            canvasCtx.fillStyle = backgroundGradient;
            canvasCtx.fillRect(0, 0, gameCanvasWidth, gameCanvasHeight);
        }
        stars.forEach(star => {
            canvasCtx.beginPath();
            canvasCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            canvasCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            canvasCtx.fill();
        });
    }

    function initEnemies() {
        enemies = [];
        for (let row = 0; row < enemyRows; row++) {
            for (let col = 0; col < enemyCols; col++) {
                enemies.push({
                    x: enemyInitialX + col * (enemyWidth + enemySpacing) + (enemySpacing / 2),
                    y: enemyInitialY + row * (enemyHeight + enemySpacing),
                    width: enemyWidth,
                    height: enemyHeight,
                    alive: true
                });
            }
        }
    }

    function drawRect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawPlayer() {
        if (player.shieldActive) {
            canvasCtx.fillStyle = 'rgba(0, 150, 255, 0.3)';
            canvasCtx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            const centerX = player.x + player.width / 2;
            const centerY = player.y + player.height / 2;
            const radius = Math.max(player.width, player.height) / 1.8;
            canvasCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            canvasCtx.fill();
            canvasCtx.stroke();
        }
        if (playerImageLoaded) {
            canvasCtx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else {
            drawRect(canvasCtx, player.x, player.y, player.width, player.height, 'darkcyan');
        }
    }

    function drawBullets() {
        bullets.forEach(b => drawRect(canvasCtx, b.x, b.y, bulletWidth, bulletHeight, bulletColor));
    }

    function drawEnemies() {
        enemies.forEach(enemy => {
            if (enemy.alive) {
                if (enemyImageLoaded) {
                    canvasCtx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
                } else {
                    drawRect(canvasCtx, enemy.x, enemy.y, enemy.width, enemy.height, '#800080');
                }
            }
        });
    }

    function drawPowerups() {
        if (Math.floor(Date.now() / 200) % 2 === 0) {
            rapidFireFlash = true;
        } else {
            rapidFireFlash = false;
        }
        powerups.forEach(p => {
            canvasCtx.font = "bold 14px sans-serif";
            canvasCtx.textAlign = "center";
            canvasCtx.textBaseline = "middle";
            const centerX = p.x + p.width / 2;
            const centerY = p.y + p.height / 2;
            if (p.type === POWERUP_TYPES.RAPID_FIRE) {
                canvasCtx.fillStyle = rapidFireFlash ? 'orange' : 'yellow';
                drawRect(canvasCtx, p.x, p.y, p.width, p.height, canvasCtx.fillStyle);
                canvasCtx.fillStyle = 'black';
                canvasCtx.fillText('R', centerX, centerY);
            } else if (p.type === POWERUP_TYPES.SHIELD) {
                canvasCtx.fillStyle = 'blue';
                canvasCtx.strokeStyle = 'white';
                canvasCtx.lineWidth = 1;
                canvasCtx.beginPath();
                canvasCtx.arc(centerX, centerY, p.width / 2, 0, Math.PI * 2);
                canvasCtx.fill();
                canvasCtx.stroke();
                canvasCtx.fillStyle = 'white';
                canvasCtx.fillText('S', centerX, centerY);
            }
        });
    }

    function updateBullets() {
        bullets = bullets.filter(b => b.y > 0);
        bullets.forEach(b => { b.y -= bulletSpeed; });
    }

    function updateEnemies() {
        let moveDown = false;
        let hitEdge = false;
        enemies.forEach(enemy => {
            if (!enemy.alive) return;
            enemy.x += enemySpeed * enemyDirection;
            if (enemy.x + enemy.width > gameCanvasWidth || enemy.x < 0) {
                hitEdge = true;
            }
            if (enemy.y + enemy.height >= player.y &&
                enemy.x < player.x + player.width &&
                enemy.x + enemy.width > player.x) {
                handlePlayerHit();
            }
        });
        if (hitEdge) {
            enemyDirection *= -1;
            moveDown = true;
        }
        if (moveDown) {
            enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.y += enemyDropDistance;
                    if (enemy.y + enemy.height >= gameCanvasHeight) {
                        setGameOver("Invaders reached the bottom!");
                    }
                }
            });
        }
    }

    function updatePowerups() {
        powerups = powerups.filter(p => p.y < gameCanvasHeight);
        powerups.forEach(p => { p.y += powerupSpeed; });
    }

    function checkCollisions() {
        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy) => {
                if (enemy.alive &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    enemy.alive = false;
                    bullets.splice(bulletIndex, 1);
                    score += 10;
                    scoreElement.textContent = score;
                    if (Math.random() < powerupSpawnChance) {
                        spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    }
                    if (enemies.every(e => !e.alive)) {
                        resetGame();
                    }
                    return;
                }
            });
        });
        powerups.forEach((powerup, index) => {
            if (player.x < powerup.x + powerup.width &&
                player.x + player.width > powerup.x &&
                player.y < powerup.y + powerup.height &&
                player.y + player.height > powerup.y) {
                activatePowerup(powerup.type);
                powerups.splice(index, 1);
            }
        });
    }

    function handlePlayerHit() {
        if (player.shieldActive) {
            player.shieldActive = false;
            console.log("Shield broken!");
            enemies.forEach(enemy => {
                if (enemy.alive &&
                    enemy.y + enemy.height >= player.y &&
                    enemy.x < player.x + player.width &&
                    enemy.x + enemy.width > player.x) {
                    enemy.alive = false;
                    score += 5;
                    scoreElement.textContent = score;
                }
            });
        } else {
            setGameOver("Game Over!");
        }
    }

    let shootCooldown = 0;

    function shoot() {
        if (shootCooldown <= 0) {
            bullets.push({
                x: player.x + player.width / 2 - bulletWidth / 2,
                y: player.y,
                width: bulletWidth,
                height: bulletHeight,
                color: bulletColor
            });
            shootCooldown = shootInterval;
        }
    }

    function spawnPowerup(x, y) {
        const type = Math.random() < 0.5 ? POWERUP_TYPES.RAPID_FIRE : POWERUP_TYPES.SHIELD;
        powerups.push({
            x: x - powerupSize / 2,
            y: y - powerupSize / 2,
            width: powerupSize,
            height: powerupSize,
            type: type,
            speed: powerupSpeed
        });
        console.log("Spawned powerup:", type);
    }

    function activatePowerup(type) {
        console.log("Activated powerup:", type);
        if (type === POWERUP_TYPES.SHIELD) {
            player.shieldActive = true;
        } else if (type === POWERUP_TYPES.RAPID_FIRE) {
            if (player.rapidFireTimeoutId) {
                clearTimeout(player.rapidFireTimeoutId);
            }
            player.rapidFireActive = true;
            shootInterval = rapidFireInterval;
            player.rapidFireTimeoutId = setTimeout(() => {
                player.rapidFireActive = false;
                shootInterval = player.originalShootInterval;
                player.rapidFireTimeoutId = null;
                console.log("Rapid fire ended.");
            }, rapidFireDuration);
        }
    }

    function updatePlayerPosition(handX) {
        const targetX = (1 - handX) * gameCanvasWidth - player.width / 2;
        player.x += (targetX - player.x) * player.smoothingFactor;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > gameCanvasWidth) player.x = gameCanvasWidth - player.width;
    }

    function checkShootGesture(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        if (!thumbTip || !indexTip) return false;
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        const pinchThreshold = 0.05;
        return distance < pinchThreshold;
    }

    function onHandResults(results) {
        overlayCtx.clearRect(0, 0, overlayCanvasElement.width, overlayCanvasElement.height);
        handLandmarks = null;
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            handLandmarks = results.multiHandLandmarks[0];
            for (const landmarks of results.multiHandLandmarks) {
                drawingUtils.drawConnectors(overlayCtx, landmarks, window.HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 5
                });
                drawingUtils.drawLandmarks(overlayCtx, landmarks, {
                    color: '#FF0000',
                    lineWidth: 2,
                    radius: 5
                });
            }
            if (gameRunning && !gameOver && handLandmarks) {
                const wrist = handLandmarks[0];
                if (wrist) {
                    updatePlayerPosition(wrist.x);
                }
                if (checkShootGesture(handLandmarks)) {
                    shoot();
                }
            }
        }
    }

    function setGameOver(message = "Game Over!") {
        gameRunning = false;
        gameOver = true;
        finalScoreElement.textContent = score;
        gameOverScreenElement.querySelector('h2').textContent = message;
        gameOverScreenElement.style.display = 'flex';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function gameLoop() {
        if (!gameRunning || gameOver) return;
        if (shootCooldown > 0) shootCooldown--;
        updateBackground();
        updateBullets();
        updateEnemies();
        updatePowerups();
        checkCollisions();
        drawBackground();
        drawEnemies();
        drawPowerups();
        drawPlayer();
        drawBullets();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        if (player.rapidFireTimeoutId) {
            clearTimeout(player.rapidFireTimeoutId);
            player.rapidFireTimeoutId = null;
        }

        score = 0;
        scoreElement.textContent = score;
        player = { ...defaultPlayer };
        if (playerImageLoaded) {
            const aspectRatio = 60 / 55;
            const desiredHeight = 40;
            player.height = desiredHeight;
            player.width = desiredHeight * aspectRatio;
        }
        player.x = gameCanvasWidth / 2 - player.width / 2;
        player.y = gameCanvasHeight - player.height - 10;

        bullets = [];
        powerups = [];
        enemyDirection = 1;
        enemySpeed = 1;
        initEnemies();
        initBackground();

        gameOver = false;
        gameRunning = true;
        gameOverScreenElement.style.display = 'none';
        loadingElement.style.display = 'none';
        startScreenElement.style.display = 'none';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        gameLoop();
    }

    // --- Event Listeners ---
    const startGameHandler = () => {
        resetGame();
        startScreenElement.style.display = 'none';
    };

    const restartGameHandler = () => {
        resetGame();
        gameOverScreenElement.style.display = 'none';
    };

    startButton.addEventListener('click', startGameHandler);
    restartButton.addEventListener('click', restartGameHandler);

    // --- Start Camera & Initial Setup ---
    camera.start()
        .then(() => {
            console.log("Camera started (Logic). MediaPipe ready.");
            loadingElement.style.display = 'none';
            startScreenElement.style.display = 'flex';
        })
        .catch(err => {
            console.error("Error starting camera (Logic):", err);
            loadingElement.textContent = "Error accessing camera. Check permissions.";
            loadingElement.style.display = 'flex';
            startScreenElement.style.display = 'none';
        });

    // --- Return cleanup function ---
    return () => {
        console.log("Running cleanup for Hand Invaders Logic...");
        gameRunning = false;
        gameOver = true;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        if (camera) {
            camera.stop();
            const stream = videoElement.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                videoElement.srcObject = null;
            }
            camera = null;
            console.log("Camera stopped.");
        } else {
            console.log("Camera object not found for cleanup.");
        }

        if (hands) {
            hands.close();
            hands = null;
            console.log("MediaPipe Hands closed.");
        }

        if (player && player.rapidFireTimeoutId) {
            clearTimeout(player.rapidFireTimeoutId);
            player.rapidFireTimeoutId = null;
        }

        startButton.removeEventListener('click', startGameHandler);
        restartButton.removeEventListener('click', restartGameHandler);
        console.log("Event listeners removed.");

        if (canvasCtx) canvasCtx.clearRect(0, 0, gameCanvasWidth, gameCanvasHeight);
        if (overlayCtx) overlayCtx.clearRect(0, 0, overlayCanvasWidth, overlayCanvasHeight);

        player = null;
        enemies = null;
        bullets = null;
        powerups = null;
        stars = null;
        console.log("Hand Invaders Logic cleanup complete.");
    };
} 
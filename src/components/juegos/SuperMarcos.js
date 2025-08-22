import React, { useRef, useEffect } from 'react';
import './SuperMarcos.css';

const SuperMarcos = () => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const logic = useRef({
        gameState: 'menu',
        currentLevel: 1,
        maxLevel: 3,
        lives: 3,
        score: 0,
        coins: 0,
        powerUpActive: false,
        powerUpTimer: 0,
        wallJumpAvailable: false,
        onWall: false,
        wallSide: 0,
        levelCompleted: false,
        levelTransitionTimer: 0,
        lasers: [],
        LASER_COOLDOWN_TIME: 20,
        laserCooldown: 0,
        particles: [],
        player: {
            x: 50, y: 500, width: 50, height: 50, color: '#4A90E2',
            velocityX: 0, velocityY: 0, jumping: false, speed: 6, jumpStrength: 25, gravity: 1.2,
            invincible: false, invincibleTimer: 0, dashAvailable: true, dashCooldown: 0, wallSliding: false, lastDirection: 1
        },
        camera: { x: 0, y: 0 },
        worldWidth: 4000,
        worldHeight: 600,
        levels: [
            // --- NIVEL 1 ---
            {
                platforms: [
                    { x: 0, y: 550, width: 150, height: 20, color: '#A0522D' },
                    { x: 200, y: 400, width: 200, height: 20, color: '#A0522D' },
                    { x: 500, y: 300, width: 150, height: 20, color: '#A0522D' },
                    { x: 800, y: 450, width: 200, height: 20, color: '#A0522D' },
                    { x: 1100, y: 350, width: 150, height: 20, color: '#A0522D' },
                    { x: 1400, y: 250, width: 200, height: 20, color: '#A0522D' },
                    { x: 1700, y: 400, width: 250, height: 20, color: '#A0522D' },
                    { x: 2100, y: 300, width: 150, height: 20, color: '#A0522D' },
                    { x: 2500, y: 450, width: 200, height: 20, color: '#A0522D' },
                    { x: 2800, y: 280, width: 300, height: 20, color: '#A0522D' },
                    { x: 3200, y: 350, width: 200, height: 20, color: '#A0522D' },
                    { x: 3600, y: 250, width: 200, height: 20, color: '#A0522D' }
                ],
                coins: [
                    { x: 250, y: 350, width: 20, height: 20, collected: false, value: 50 },
                    { x: 550, y: 250, width: 20, height: 20, collected: false, value: 50 },
                    { x: 850, y: 400, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1150, y: 300, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1450, y: 200, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1750, y: 350, width: 20, height: 20, collected: false, value: 50 },
                    { x: 2150, y: 250, width: 20, height: 20, collected: false, value: 50 },
                    { x: 2550, y: 400, width: 20, height: 20, collected: false, value: 50 },
                    { x: 2850, y: 150, width: 20, height: 20, collected: false, value: 50 },
                    { x: 3250, y: 300, width: 20, height: 20, collected: false, value: 50 },
                    { x: 3650, y: 200, width: 20, height: 20, collected: false, value: 50 }
                ],
                powerUps: [
                    { x: 1200, y: 180, width: 30, height: 30, type: 'doubleJump', collected: false },
                    { x: 2400, y: 380, width: 30, height: 30, type: 'speedBoost', collected: false }
                ],
                enemies: [
                    { x: 300, y: 360, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 200, platformEnd: 400, health: 1 },
                    { x: 600, y: 260, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 500, platformEnd: 650, health: 1 },
                    { x: 1200, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 1100, platformEnd: 1250, health: 1 },
                    { x: 1800, y: 350, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 1700, platformEnd: 1950, health: 1 },
                    { x: 2400, y: 410, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 2300, platformEnd: 2500, health: 1 },
                    { x: 3000, y: 160, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 2800, platformEnd: 3100, health: 1 },
                    { x: 3400, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 3200, platformEnd: 3400, health: 1 },
                    { x: 800, y: 410, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 800, platformEnd: 1000, health: 1 },
                    { x: 1100, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 1100, platformEnd: 1250, health: 1 },
                    { x: 1400, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 1400, platformEnd: 1600, health: 1 },
                    { x: 2100, y: 260, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 2100, platformEnd: 2250, health: 1 },
                    { x: 2500, y: 410, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 2500, platformEnd: 2700, health: 1 },
                    { x: 3200, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 3200, platformEnd: 3400, health: 1 },
                    { x: 3600, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 3600, platformEnd: 3800, health: 1 },
                    { x: 400, y: 200, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 150, endY: 300, health: 1 },
                    { x: 900, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -1, alive: true, type: 'flying', startY: 100, endY: 250, health: 1 },
                    { x: 1500, y: 100, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 80, endY: 200, health: 1 },
                    { x: 2200, y: 200, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -1, alive: true, type: 'flying', startY: 150, endY: 280, health: 1 },
                    { x: 2900, y: 80, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 60, endY: 180, health: 1 },
                    { x: 3300, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -1, alive: true, type: 'flying', startY: 120, endY: 220, health: 1 },
                    { x: 3700, y: 120, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 100, endY: 180, health: 1 }
                ],
                goal: { x: 3900, y: 500, width: 50, height: 50, color: '#FFD700' }
            },
            // --- NIVEL 2 ---
            {
                platforms: [
                    { x: 0, y: 550, width: 150, height: 20, color: '#A0522D' },
                    { x: 150, y: 450, width: 150, height: 20, color: '#A0522D' },
                    { x: 400, y: 350, width: 200, height: 20, color: '#A0522D' },
                    { x: 700, y: 250, width: 180, height: 20, color: '#A0522D' },
                    { x: 1000, y: 400, width: 120, height: 20, color: '#A0522D' },
                    { x: 1300, y: 300, width: 250, height: 20, color: '#A0522D' },
                    { x: 1600, y: 200, width: 150, height: 20, color: '#A0522D' },
                    { x: 1900, y: 350, width: 200, height: 20, color: '#A0522D' },
                    { x: 2200, y: 450, width: 180, height: 20, color: '#A0522D' },
                    { x: 2500, y: 250, width: 200, height: 20, color: '#A0522D' },
                    { x: 2800, y: 300, width: 150, height: 20, color: '#A0522D' },
                    { x: 3100, y: 400, width: 200, height: 20, color: '#A0522D' },
                    { x: 3400, y: 250, width: 180, height: 20, color: '#A0522D' },
                    { x: 3700, y: 350, width: 200, height: 20, color: '#A0522D' }
                ],
                coins: [
                    { x: 200, y: 400, width: 20, height: 20, collected: false, value: 50 },
                    { x: 450, y: 300, width: 20, height: 20, collected: false, value: 50 },
                    { x: 750, y: 200, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1050, y: 350, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1350, y: 250, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1650, y: 150, width: 20, height: 20, collected: false, value: 50 },
                    { x: 1950, y: 300, width: 20, height: 20, collected: false, value: 50 },
                    { x: 2250, y: 400, width: 20, height: 20, collected: false, value: 50 },
                    { x: 2550, y: 100, width: 20, height: 20, collected: false, value: 50 },
                    { x: 2850, y: 250, width: 20, height: 20, collected: false, value: 50 },
                    { x: 3150, y: 350, width: 20, height: 20, collected: false, value: 50 },
                    { x: 3450, y: 200, width: 20, height: 20, collected: false, value: 50 },
                    { x: 3750, y: 300, width: 20, height: 20, collected: false, value: 50 }
                ],
                powerUps: [
                    { x: 800, y: 200, width: 30, height: 30, type: 'doubleJump', collected: false },
                    { x: 2000, y: 300, width: 30, height: 30, type: 'speedBoost', collected: false },
                    { x: 3200, y: 200, width: 30, height: 30, type: 'doubleJump', collected: false }
                ],
                enemies: [
                    { x: 200, y: 410, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 150, platformEnd: 300, health: 1 },
                    { x: 450, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 400, platformEnd: 600, health: 1 },
                    { x: 750, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 700, platformEnd: 880, health: 1 },
                    { x: 1050, y: 360, width: 40, height: 40, color: '#FF4444', velocityX: -1, velocityY: 0, alive: true, type: 'ground', platformStart: 1000, platformEnd: 1120, health: 1 },
                    { x: 1350, y: 260, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 1300, platformEnd: 1550, health: 1 },
                    { x: 1650, y: 160, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 1600, platformEnd: 1750, health: 1 },
                    { x: 1950, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 1900, platformEnd: 2100, health: 1 },
                    { x: 2250, y: 410, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 2200, platformEnd: 2380, health: 1 },
                    { x: 2550, y: 110, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 2500, platformEnd: 2700, health: 1 },
                    { x: 2850, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 2800, platformEnd: 2950, health: 1 },
                    { x: 3150, y: 360, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 3100, platformEnd: 3300, health: 1 },
                    { x: 3450, y: 160, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 3400, platformEnd: 3580, health: 1 },
                    { x: 3750, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: 2, velocityY: 0, alive: true, type: 'ground', platformStart: 3700, platformEnd: 3900, health: 1 },
                    { x: 300, y: 180, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 120, endY: 250, health: 1 },
                    { x: 600, y: 120, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -1, alive: true, type: 'flying', startY: 80, endY: 180, health: 1 },
                    { x: 1200, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 100, endY: 220, health: 1 },
                    { x: 1800, y: 100, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -1, alive: true, type: 'flying', startY: 60, endY: 160, health: 1 },
                    { x: 2400, y: 200, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 150, endY: 280, health: 1 },
                    { x: 3000, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -1, alive: true, type: 'flying', startY: 100, endY: 200, health: 1 },
                    { x: 3600, y: 180, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 1, alive: true, type: 'flying', startY: 120, endY: 240, health: 1 }
                ],
                goal: { x: 3900, y: 500, width: 50, height: 50, color: '#FFD700' }
            },
            // --- NIVEL 3 ---
            {
                platforms: [
                    { x: 0, y: 550, width: 150, height: 20, color: '#A0522D' },
                    { x: 100, y: 400, width: 100, height: 20, color: '#A0522D' },
                    { x: 300, y: 300, width: 150, height: 20, color: '#A0522D' },
                    { x: 550, y: 200, width: 120, height: 20, color: '#A0522D' },
                    { x: 800, y: 350, width: 200, height: 20, color: '#A0522D' },
                    { x: 1100, y: 250, width: 150, height: 20, color: '#A0522D' },
                    { x: 1400, y: 150, width: 100, height: 20, color: '#A0522D' },
                    { x: 1600, y: 300, width: 180, height: 20, color: '#A0522D' },
                    { x: 1900, y: 200, width: 150, height: 20, color: '#A0522D' },
                    { x: 2200, y: 350, width: 200, height: 20, color: '#A0522D' },
                    { x: 2500, y: 250, width: 150, height: 20, color: '#A0522D' },
                    { x: 2800, y: 150, width: 120, height: 20, color: '#A0522D' },
                    { x: 3100, y: 300, width: 200, height: 20, color: '#A0522D' },
                    { x: 3400, y: 200, width: 150, height: 20, color: '#A0522D' },
                    { x: 3700, y: 350, width: 200, height: 20, color: '#A0522D' }
                ],
                coins: [
                    { x: 150, y: 350, width: 20, height: 20, collected: false, value: 100 },
                    { x: 350, y: 250, width: 20, height: 20, collected: false, value: 100 },
                    { x: 600, y: 150, width: 20, height: 20, collected: false, value: 100 },
                    { x: 850, y: 300, width: 20, height: 20, collected: false, value: 100 },
                    { x: 1150, y: 200, width: 20, height: 20, collected: false, value: 100 },
                    { x: 1450, y: 100, width: 20, height: 20, collected: false, value: 100 },
                    { x: 1650, y: 250, width: 20, height: 20, collected: false, value: 100 },
                    { x: 1950, y: 150, width: 20, height: 20, collected: false, value: 100 },
                    { x: 2250, y: 300, width: 20, height: 20, collected: false, value: 100 },
                    { x: 2550, y: 200, width: 20, height: 20, collected: false, value: 100 },
                    { x: 2850, y: 100, width: 20, height: 20, collected: false, value: 100 },
                    { x: 3150, y: 250, width: 20, height: 20, collected: false, value: 100 },
                    { x: 3450, y: 150, width: 20, height: 20, collected: false, value: 100 },
                    { x: 3750, y: 300, width: 20, height: 20, collected: false, value: 100 }
                ],
                powerUps: [
                    { x: 600, y: 150, width: 30, height: 30, type: 'doubleJump', collected: false },
                    { x: 1400, y: 100, width: 30, height: 30, type: 'speedBoost', collected: false },
                    { x: 2200, y: 300, width: 30, height: 30, type: 'doubleJump', collected: false },
                    { x: 3100, y: 250, width: 30, height: 30, type: 'speedBoost', collected: false }
                ],
                enemies: [
                    { x: 150, y: 360, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 100, platformEnd: 200, health: 1 },
                    { x: 350, y: 260, width: 40, height: 40, color: '#FF4444', velocityX: -3, velocityY: 0, alive: true, type: 'ground', platformStart: 300, platformEnd: 450, health: 1 },
                    { x: 600, y: 160, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 550, platformEnd: 670, health: 1 },
                    { x: 850, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: -2, velocityY: 0, alive: true, type: 'ground', platformStart: 800, platformEnd: 1000, health: 1 },
                    { x: 1150, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 1100, platformEnd: 1250, health: 1 },
                    { x: 1450, y: 110, width: 40, height: 40, color: '#FF4444', velocityX: -3, velocityY: 0, alive: true, type: 'ground', platformStart: 1400, platformEnd: 1500, health: 1 },
                    { x: 1650, y: 260, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 1600, platformEnd: 1780, health: 1 },
                    { x: 1950, y: 160, width: 40, height: 40, color: '#FF4444', velocityX: -3, velocityY: 0, alive: true, type: 'ground', platformStart: 1900, platformEnd: 2050, health: 1 },
                    { x: 2250, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 2200, platformEnd: 2350, health: 1 },
                    { x: 2550, y: 210, width: 40, height: 40, color: '#FF4444', velocityX: -3, velocityY: 0, alive: true, type: 'ground', platformStart: 2500, platformEnd: 2650, health: 1 },
                    { x: 2850, y: 110, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 2800, platformEnd: 2920, health: 1 },
                    { x: 3150, y: 260, width: 40, height: 40, color: '#FF4444', velocityX: -3, velocityY: 0, alive: true, type: 'ground', platformStart: 3100, platformEnd: 3300, health: 1 },
                    { x: 3450, y: 160, width: 40, height: 40, color: '#FF4444', velocityX: 3, velocityY: 0, alive: true, type: 'ground', platformStart: 3400, platformEnd: 3550, health: 1 },
                    { x: 3750, y: 310, width: 40, height: 40, color: '#FF4444', velocityX: -3, velocityY: 0, alive: true, type: 'ground', platformStart: 3700, platformEnd: 3900, health: 1 },
                    { x: 200, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 2, alive: true, type: 'flying', startY: 100, endY: 200, health: 1 },
                    { x: 500, y: 100, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -2, alive: true, type: 'flying', startY: 60, endY: 150, health: 1 },
                    { x: 900, y: 120, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 2, alive: true, type: 'flying', startY: 80, endY: 180, health: 1 },
                    { x: 1300, y: 80, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -2, alive: true, type: 'flying', startY: 40, endY: 120, health: 1 },
                    { x: 1700, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 2, alive: true, type: 'flying', startY: 100, endY: 200, health: 1 },
                    { x: 2100, y: 100, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -2, alive: true, type: 'flying', startY: 60, endY: 150, health: 1 },
                    { x: 2500, y: 120, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 2, alive: true, type: 'flying', startY: 80, endY: 180, health: 1 },
                    { x: 2900, y: 80, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -2, alive: true, type: 'flying', startY: 40, endY: 120, health: 1 },
                    { x: 3300, y: 150, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: 2, alive: true, type: 'flying', startY: 100, endY: 200, health: 1 },
                    { x: 3700, y: 100, width: 35, height: 35, color: '#9B59B6', velocityX: 0, velocityY: -2, alive: true, type: 'flying', startY: 60, endY: 150, health: 1 }
                ],
                goal: { x: 3900, y: 500, width: 50, height: 50, color: '#FFD700' }
            }
        ],
        platforms: [],
        coinsArray: [],
        powerUps: [],
        enemies: [],
        goal: {},
        keys: {},
        keyPressed: {},
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const l = logic.current;

        // --- Funciones auxiliares ---
        function createParticle(x, y, color, type = 'explosion') {
            for (let i = 0; i < 8; i++) {
                l.particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 60, maxLife: 60,
                    color, size: Math.random() * 4 + 2, type
                });
            }
        }
        function updateParticles() {
            for (let i = l.particles.length - 1; i >= 0; i--) {
                let p = l.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2;
                p.life--;
                if (p.life <= 0) l.particles.splice(i, 1);
            }
        }
        function drawParticles() {
            l.particles.forEach(p => {
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - l.camera.x, p.y, p.size, p.size);
            });
            ctx.globalAlpha = 1;
        }
        function resetGame() {
            l.lives = 3; l.score = 0; l.coins = 0; l.gameState = 'playing';
            l.powerUpActive = false; l.powerUpTimer = 0; l.wallJumpAvailable = false; l.onWall = false;
            l.particles = []; l.lasers = []; l.laserCooldown = 0;
            Object.assign(l.player, { x: 50, y: 500, velocityX: 0, velocityY: 0, invincible: false, invincibleTimer: 0, dashAvailable: true, dashCooldown: 0, wallSliding: false, lastDirection: 1 });
            l.camera.x = 0; l.camera.y = 0;
            loadLevel(l.currentLevel);
        }
        function loadLevel(levelNum) {
            if (levelNum < 1 || levelNum > l.levels.length) return;
            l.currentLevel = levelNum;
            const levelData = l.levels[l.currentLevel - 1];
            if (!levelData) return;
            l.platforms = levelData.platforms;
            l.coinsArray = JSON.parse(JSON.stringify(levelData.coins));
            l.powerUps = JSON.parse(JSON.stringify(levelData.powerUps));
            l.enemies = JSON.parse(JSON.stringify(levelData.enemies));
            l.goal = levelData.goal;
            l.coinsArray.forEach(coin => coin.collected = false);
            l.powerUps.forEach(powerUp => powerUp.collected = false);
            l.enemies.forEach(enemy => { enemy.alive = true; enemy.health = 1; });
        }
        function nextLevel() {
            if (l.currentLevel < l.maxLevel) {
                l.levelCompleted = true;
                l.levelTransitionTimer = 60;
            } else {
                l.gameState = 'won';
            }
        }

        // --- Event listeners completos ---
        const handleKeyDown = (e) => {
            // Prevenir scroll solo si el juego está en modo playing y la tecla es relevante
            const keysToPrevent = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if (l.gameState === 'playing' && keysToPrevent.includes(e.key)) {
                e.preventDefault();
            }
            if (!l.keys[e.key]) l.keyPressed[e.key] = true;
            l.keys[e.key] = true;

            // Disparo (espacio)
            if (e.key === ' ' && l.gameState === 'playing') {
                if (l.laserCooldown <= 0) {
                    const pistolBarrelWidth = 15;
                    const laserWidth = 15;
                    const laserHeight = 5;
                    const pistolBarrelHeight = 7;
                    const laserY = l.player.y + l.player.height / 2 + (pistolBarrelHeight / 2) - (laserHeight / 2);
                    l.lasers.push({
                        x: l.player.x + (l.player.lastDirection === 1 ? l.player.width : -pistolBarrelWidth),
                        y: laserY,
                        width: laserWidth,
                        height: laserHeight,
                        color: '#FF00FF',
                        velocityX: 15 * l.player.lastDirection
                    });
                    l.laserCooldown = l.LASER_COOLDOWN_TIME;
                }
            }
            // Pausa (P)
            if ((e.key === 'p' || e.key === 'P') && (l.gameState === 'playing' || l.gameState === 'paused')) {
                l.gameState = l.gameState === 'playing' ? 'paused' : 'playing';
            }
            // Reinicio (R)
            if ((e.key === 'r' || e.key === 'R')) {
                resetGame();
            }
            // Empezar desde menú (ENTER)
            if (e.key === 'Enter' && l.gameState === 'menu') {
                l.gameState = 'playing';
            }
            // Menú/pausa (ESC)
            if (e.key === 'Escape') {
                if (l.gameState === 'playing') l.gameState = 'paused';
                else if (l.gameState === 'paused') l.gameState = 'playing';
                else if (l.gameState === 'menu') l.gameState = 'menu';
            }
        };
        const handleKeyUp = (e) => {
            l.keys[e.key] = false;
            l.keyPressed[e.key] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // --- Lógica principal del juego ---
        function update() {
            if (l.gameState !== 'playing') return;
            updateParticles();

            // Level transition
            if (l.levelCompleted) {
                l.levelTransitionTimer--;
                if (l.levelTransitionTimer <= 0) {
                    l.currentLevel++;
                    loadLevel(l.currentLevel);
                    l.gameState = 'playing';
                    l.levelCompleted = false;
                    l.levelTransitionTimer = 0;
                    Object.assign(l.player, { x: 50, y: 500, velocityX: 0, velocityY: 0, invincible: false, invincibleTimer: 0, dashAvailable: true, dashCooldown: 0, wallSliding: false, lastDirection: 1 });
                    l.lasers = [];
                    l.laserCooldown = 0;
                }
                return;
            }

            // Timers
            if (l.player.invincible) {
                l.player.invincibleTimer--;
                if (l.player.invincibleTimer <= 0) l.player.invincible = false;
            }
            if (l.powerUpActive) {
                l.powerUpTimer--;
                if (l.powerUpTimer <= 0) l.powerUpActive = false;
            }
            if (l.player.dashCooldown > 0) l.player.dashCooldown--;
            if (l.laserCooldown > 0) l.laserCooldown--;

            // Wall detection
            l.onWall = false;
            l.wallSide = 0;
            for (let plat of l.platforms) {
                if (l.player.x <= plat.x && l.player.x + l.player.width >= plat.x && l.player.y < plat.y + plat.height && l.player.y + l.player.height > plat.y) {
                    l.onWall = true; l.wallSide = -1; break;
                }
                if (l.player.x <= plat.x + plat.width && l.player.x + l.player.width >= plat.x + plat.width && l.player.y < plat.y + plat.height && l.player.y + l.player.height > plat.y) {
                    l.onWall = true; l.wallSide = 1; break;
                }
            }

            // Movimiento horizontal
            l.player.velocityX = 0;
            if (l.keys['ArrowLeft']) { l.player.velocityX = -l.player.speed; l.player.lastDirection = -1; }
            if (l.keys['ArrowRight']) { l.player.velocityX = l.player.speed; l.player.lastDirection = 1; }

            // Wall sliding
            if (l.onWall && !l.player.jumping && l.player.velocityY > 0) {
                l.player.wallSliding = true;
                l.player.velocityY = Math.min(l.player.velocityY, 2);
            } else {
                l.player.wallSliding = false;
            }

            // Salto y wall jump
            if (l.keyPressed['ArrowUp']) {
                if (!l.player.jumping && !l.player.wallSliding) {
                    l.player.velocityY = -l.player.jumpStrength;
                    l.player.jumping = true;
                    createParticle(l.player.x + l.player.width / 2, l.player.y + l.player.height, '#4A90E2', 'jump');
                } else if (l.player.wallSliding) {
                    l.player.velocityY = -l.player.jumpStrength * 0.7;
                    l.player.velocityX = l.wallSide * l.player.speed * 1.5;
                    l.player.wallSliding = false;
                    l.player.jumping = true;
                    createParticle(l.player.x + l.player.width / 2, l.player.y + l.player.height, '#FF6B35', 'wallJump');
                }
            }

            // Dash
            if (l.keyPressed['Shift'] && l.player.dashAvailable && l.player.dashCooldown <= 0) {
                l.player.velocityX *= 3;
                l.player.dashAvailable = false;
                l.player.dashCooldown = 120;
                createParticle(l.player.x + l.player.width / 2, l.player.y + l.player.height / 2, '#FFD700', 'dash');
            }

            // Gravedad
            if (!l.player.wallSliding) l.player.velocityY += l.player.gravity;

            // Actualizar posición
            l.player.y += l.player.velocityY;
            l.player.x += l.player.velocityX;
            if (l.player.x < 0) l.player.x = 0;
            if (l.player.x + l.player.width > l.worldWidth) l.player.x = l.worldWidth - l.player.width;

            // Scroll cámara
            if (l.player.x < l.camera.x + 200) l.camera.x = l.player.x - 200;
            if (l.camera.x < 0) l.camera.x = 0;
            if (l.player.x > l.camera.x + canvas.width - 200) l.camera.x = l.player.x - (canvas.width - 200);
            if (l.camera.x > l.worldWidth - canvas.width) l.camera.x = l.worldWidth - canvas.width;

            // Colisiones con monedas
            l.coinsArray.forEach(coin => {
                if (!coin.collected && l.player.x < coin.x + coin.width && l.player.x + l.player.width > coin.x && l.player.y < coin.y + coin.height && l.player.y + l.player.height > coin.y) {
                    coin.collected = true;
                    l.coins++;
                    l.score += coin.value;
                    createParticle(coin.x + coin.width / 2, coin.y + coin.height / 2, '#FFD700', 'coin');
                }
            });

            // Colisiones con power-ups
            l.powerUps.forEach(powerUp => {
                if (!powerUp.collected && l.player.x < powerUp.x + powerUp.width && l.player.x + l.player.width > powerUp.x && l.player.y < powerUp.y + powerUp.height && l.player.y + l.player.height > powerUp.y) {
                    powerUp.collected = true;
                    if (powerUp.type === 'doubleJump') {
                        createParticle(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, '#FFD700', 'powerUp');
                    } else if (powerUp.type === 'speedBoost') {
                        l.powerUpActive = true;
                        l.powerUpTimer = 300;
                        l.player.speed = 8;
                        createParticle(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, '#FF6B35', 'powerUp');
                    }
                }
            });
            if (!l.powerUpActive && l.player.speed > 6) l.player.speed = 6;

            // Actualizar lasers
            for (let i = l.lasers.length - 1; i >= 0; i--) {
                let laser = l.lasers[i];
                laser.x += laser.velocityX;
                if (laser.x < l.camera.x - 50 || laser.x > l.camera.x + canvas.width + 50) {
                    l.lasers.splice(i, 1);
                    continue;
                }
                for (let enemy of l.enemies) {
                    if (enemy.alive && laser.x < enemy.x + enemy.width && laser.x + laser.width > enemy.x && laser.y < enemy.y + enemy.height && laser.y + laser.height > enemy.y) {
                        enemy.health--;
                        if (enemy.health <= 0) {
                            enemy.alive = false;
                            createParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 'explosion');
                        }
                        l.score += 100;
                        createParticle(laser.x + laser.width / 2, laser.y + laser.height / 2, '#FF00FF', 'laserHit');
                        l.lasers.splice(i, 1);
                        break;
                    }
                }
            }

            // Actualizar enemigos
            for (let enemy of l.enemies) {
                if (enemy.alive) {
                    if (enemy.type === 'ground') {
                        enemy.x += enemy.velocityX;
                        if (enemy.x <= enemy.platformStart || enemy.x >= enemy.platformEnd - enemy.width) enemy.velocityX *= -1;
                    } else if (enemy.type === 'flying') {
                        enemy.y += enemy.velocityY;
                        if (enemy.y <= enemy.startY || enemy.y >= enemy.endY) enemy.velocityY *= -1;
                    }
                    // Colisión con jugador
                    if (!l.player.invincible && l.player.x < enemy.x + enemy.width && l.player.x + l.player.width > enemy.x && l.player.y < enemy.y + enemy.height && l.player.y + l.player.height > enemy.y) {
                        if (l.player.velocityY > 0 && l.player.y + l.player.height - l.player.velocityY <= enemy.y) {
                            enemy.health--;
                            if (enemy.health <= 0) {
                                enemy.alive = false;
                                createParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 'explosion');
                            }
                            l.score += 100;
                            l.player.velocityY = -l.player.jumpStrength / 2;
                        } else {
                            l.lives--;
                            if (l.lives <= 0) {
                                l.gameState = 'gameOver';
                            } else {
                                Object.assign(l.player, { x: 50, y: 500, velocityX: 0, velocityY: 0, invincible: true, invincibleTimer: 120, dashAvailable: true, dashCooldown: 0, wallSliding: false, lastDirection: 1 });
                                l.camera.x = 0;
                                createParticle(l.player.x + l.player.width / 2, l.player.y + l.player.height / 2, '#FF4444', 'hit');
                            }
                        }
                    }
                }
            }

            // Colisión con meta
            if (!l.levelCompleted && l.player.x < l.goal.x + l.goal.width && l.player.x + l.player.width > l.goal.x && l.player.y < l.goal.y + l.goal.height && l.player.y + l.player.height > l.goal.y) {
                l.score += 500;
                createParticle(l.goal.x + l.goal.width / 2, l.goal.y + l.goal.height / 2, '#FFD700', 'goal');
                nextLevel();
            }

            // Colisiones con plataformas (suelo)
            l.player.jumping = true;
            for (let plat of l.platforms) {
                if (l.player.x < plat.x + plat.width && l.player.x + l.player.width > plat.x && l.player.y + l.player.height <= plat.y + l.player.velocityY && l.player.y + l.player.height >= plat.y) {
                    if (l.player.velocityY > 0) {
                        l.player.y = plat.y - l.player.height;
                        l.player.velocityY = 0;
                        l.player.jumping = false;
                    }
                }
            }

            // Si el jugador se cae
            if (l.player.y > canvas.height) {
                l.lives--;
                createParticle(l.player.x + l.player.width / 2, l.player.y, '#FF4444', 'hit');
                if (l.lives <= 0) {
                    l.gameState = 'gameOver';
                } else {
                    Object.assign(l.player, { x: 50, y: 500, velocityX: 0, velocityY: 0, invincible: true, invincibleTimer: 120, dashAvailable: true, dashCooldown: 0, wallSliding: false, lastDirection: 1 });
                    l.camera.x = 0;
                }
            }

            // Limpiar keyPressed
            Object.keys(l.keyPressed).forEach(k => l.keyPressed[k] = false);
        }

        // --- Renderizado completo ---
        function drawMenu() {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#4A90E2');
            gradient.addColorStop(1, '#87CEEB');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FF6B35';
            ctx.font = 'bold 64px Arial';
            ctx.fillText('SUPER MARCOS', canvas.width / 2 - 250, canvas.height / 2 - 100);
            ctx.fillStyle = '#FFF';
            ctx.font = '24px Arial';
            ctx.fillText('The Ultimate Platformer Adventure', canvas.width / 2 - 180, canvas.height / 2 - 50);
            ctx.font = 'bold 32px Arial';
            ctx.fillText('Press ENTER to Start', canvas.width / 2 - 150, canvas.height / 2 + 50);
            ctx.font = '20px Arial';
            ctx.fillText('Controls: Arrow Keys (Move) | Spacebar (Jump) | Shift (Dash)', canvas.width / 2 - 200, canvas.height / 2 + 100);
            ctx.fillText('P: Pause | R: Restart | ESC: Menu', canvas.width / 2 - 150, canvas.height / 2 + 130);
            const time = Date.now() * 0.001;
            for (let i = 0; i < 5; i++) {
                const x = (i * 150 + time * 50) % (canvas.width + 100);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x, canvas.height - 50, 100, 20);
            }
        }
        function drawUI() {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`Level: ${l.currentLevel}`, 10, 30);
            ctx.fillText(`Score: ${l.score}`, 10, 60);
            ctx.fillText(`Lives: ${l.lives}`, 10, 90);
            ctx.fillText(`Coins: ${l.coins}`, 10, 120);
            ctx.fillStyle = '#FF4444';
            for (let i = 0; i < l.lives; i++) ctx.fillText('♥', 80 + i * 25, 90);
            if (l.powerUpActive) {
                ctx.fillStyle = '#FF6B35';
                ctx.fillText('SPEED BOOST!', canvas.width - 150, 30);
            }
            if (l.levelCompleted) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#4CAF50';
                ctx.font = 'bold 48px Arial';
                ctx.fillText('LEVEL COMPLETE!', canvas.width / 2 - 200, canvas.height / 2);
                ctx.fillStyle = '#FFF';
                ctx.font = '20px Arial';
                ctx.fillText(`Level ${l.currentLevel} Score: ${l.score}`, canvas.width / 2 - 100, canvas.height / 2 + 40);
                ctx.fillText('Loading next level...', canvas.width / 2 - 100, canvas.height / 2 + 70);
            }
            if (l.gameState === 'paused') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 48px Arial';
                ctx.fillText('PAUSED', canvas.width / 2 - 120, canvas.height / 2);
                ctx.font = '20px Arial';
                ctx.fillText('Press P to resume', canvas.width / 2 - 100, canvas.height / 2 + 40);
            }
            if (l.gameState === 'gameOver') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FF4444';
                ctx.font = 'bold 48px Arial';
                ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2);
                ctx.fillStyle = '#FFF';
                ctx.font = '20px Arial';
                ctx.fillText(`Final Score: ${l.score}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
                ctx.fillText('Press R to restart', canvas.width / 2 - 80, canvas.height / 2 + 70);
            }
            if (l.gameState === 'won') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#4CAF50';
                ctx.font = 'bold 48px Arial';
                ctx.fillText('CONGRATULATIONS!', canvas.width / 2 - 250, canvas.height / 2);
                ctx.fillStyle = '#FFF';
                ctx.font = '20px Arial';
                ctx.fillText(`Final Score: ${l.score}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
                ctx.fillText(`Coins Collected: ${l.coins}`, canvas.width / 2 - 80, canvas.height / 2 + 70);
                ctx.fillText('You completed all levels!', canvas.width / 2 - 100, canvas.height / 2 + 100);
                ctx.fillText('Press R to restart', canvas.width / 2 - 80, canvas.height / 2 + 130);
            }
        }
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (l.gameState === 'menu') { drawMenu(); return; }
            // Fondo cielo
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Nubes
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 5; i++) {
                const cloudX = (i * 300 - l.camera.x * 0.2) % (canvas.width + 100);
                ctx.beginPath();
                ctx.arc(cloudX, 80 + i * 20, 30, 0, Math.PI * 2);
                ctx.arc(cloudX + 25, 80 + i * 20, 25, 0, Math.PI * 2);
                ctx.arc(cloudX + 50, 80 + i * 20, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            // Colinas
            ctx.fillStyle = '#90EE90';
            for (let i = 0; i < 3; i++) {
                const hillX = (i * 400 - l.camera.x * 0.5) % (canvas.width + 200);
                ctx.beginPath();
                ctx.moveTo(hillX, canvas.height);
                ctx.quadraticCurveTo(hillX + 100, canvas.height - 100, hillX + 200, canvas.height);
                ctx.fill();
            }
            // Plataformas
            for (let plat of l.platforms) {
                ctx.fillStyle = plat.color;
                ctx.fillRect(plat.x - l.camera.x, plat.y, plat.width, plat.height);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(plat.x - l.camera.x, plat.y, plat.width, 5);
            }
            // Monedas
            l.coinsArray.forEach(coin => {
                if (!coin.collected) {
                    const time = Date.now() * 0.005;
                    const bounce = Math.sin(time) * 3;
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(coin.x - l.camera.x + coin.width / 2, coin.y + coin.height / 2 + bounce, coin.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#FFA500';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    if (Math.random() < 0.1) {
                        ctx.fillStyle = '#FFF';
                        ctx.fillRect(coin.x - l.camera.x + Math.random() * coin.width, coin.y + Math.random() * coin.height, 2, 2);
                    }
                }
            });
            // Power-ups
            l.powerUps.forEach(powerUp => {
                if (!powerUp.collected) {
                    const time = Date.now() * 0.01;
                    const pulse = Math.sin(time) * 0.3 + 0.7;
                    if (powerUp.type === 'doubleJump') ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
                    else if (powerUp.type === 'speedBoost') ctx.fillStyle = `rgba(255, 107, 53, ${pulse})`;
                    ctx.fillRect(powerUp.x - l.camera.x, powerUp.y, powerUp.width, powerUp.height);
                    ctx.strokeStyle = '#FFF';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(powerUp.x - l.camera.x, powerUp.y, powerUp.width, powerUp.height);
                }
            });
            // Enemigos
            for (let enemy of l.enemies) {
                if (enemy.alive) {
                    ctx.fillStyle = enemy.color;
                    if (enemy.type === 'ground') {
                        ctx.fillRect(enemy.x - l.camera.x, enemy.y, enemy.width, enemy.height);
                        ctx.fillStyle = '#FFF';
                        ctx.fillRect(enemy.x - l.camera.x + 8, enemy.y + 8, 6, 6);
                        ctx.fillRect(enemy.x - l.camera.x + 26, enemy.y + 8, 6, 6);
                        ctx.fillStyle = '#000';
                        ctx.fillRect(enemy.x - l.camera.x + 10, enemy.y + 10, 2, 2);
                        ctx.fillRect(enemy.x - l.camera.x + 28, enemy.y + 10, 2, 2);
                    } else if (enemy.type === 'flying') {
                        ctx.fillRect(enemy.x - l.camera.x, enemy.y, enemy.width, enemy.height);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.fillRect(enemy.x - l.camera.x - 5, enemy.y + 5, 8, 15);
                        ctx.fillRect(enemy.x - l.camera.x + enemy.width - 3, enemy.y + 5, 8, 15);
                    }
                }
            }
            // Meta
            const goalTime = Date.now() * 0.003;
            const goalPulse = Math.sin(goalTime) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(255, 215, 0, ${goalPulse})`;
            ctx.fillRect(l.goal.x - l.camera.x, l.goal.y, l.goal.width, l.goal.height);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(l.goal.x - l.camera.x, l.goal.y, l.goal.width, l.goal.height);
            ctx.save();
            ctx.translate(l.goal.x - l.camera.x + l.goal.width / 2, l.goal.y + l.goal.height / 2);
            ctx.rotate(goalTime);
            ctx.fillStyle = '#FFF';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(-1, -15, 2, 30);
                ctx.rotate(Math.PI * 2 / 5);
            }
            ctx.restore();
            // Lasers
            for (let laser of l.lasers) {
                ctx.fillStyle = laser.color;
                ctx.fillRect(laser.x - l.camera.x, laser.y, laser.width, laser.height);
                ctx.shadowColor = laser.color;
                ctx.shadowBlur = 10;
                ctx.fillRect(laser.x - l.camera.x, laser.y, laser.width, laser.height);
                ctx.shadowBlur = 0;
            }
            // Partículas
            drawParticles();
            // Jugador
            if (!l.player.invincible || Math.floor(Date.now() / 100) % 2) {
                let playerColor = l.player.color;
                if (l.powerUpActive) playerColor = '#FFD700';
                if (l.player.wallSliding) playerColor = '#FF6B35';
                ctx.fillStyle = playerColor;
                ctx.fillRect(l.player.x - l.camera.x, l.player.y, l.player.width, l.player.height);
                // Detalles del jugador (ojos, sonrisa, pistola)
                const pX = l.player.x - l.camera.x;
                const pY = l.player.y;
                const pW = l.player.width;
                const pH = l.player.height;
                const eyeSize = 8;
                const pupilSize = 4;
                const eyeOffsetY = 15;
                const smileOffsetY = 35;
                const smileRadius = 7;
                const pistolBarrelWidth = 15;
                const pistolBarrelHeight = 7;
                const pistolHandleWidth = 8;
                const pistolHandleHeight = 10;
                if (l.player.lastDirection === 1) {
                    const eye1X = pX + pW - 28;
                    const eye2X = pX + pW - 16;
                    const pupil1X = pX + pW - 26;
                    const pupil2X = pX + pW - 14;
                    const smileX = pX + pW - 22;
                    ctx.fillStyle = '#FFF';
                    ctx.fillRect(eye1X, pY + eyeOffsetY, eyeSize, eyeSize);
                    ctx.fillRect(eye2X, pY + eyeOffsetY, eyeSize, eyeSize);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(pupil1X, pY + eyeOffsetY + 2, pupilSize, pupilSize);
                    ctx.fillRect(pupil2X, pY + eyeOffsetY + 2, pupilSize, pupilSize);
                    ctx.beginPath();
                    ctx.arc(smileX, pY + smileOffsetY, smileRadius, 0, Math.PI);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillStyle = '#333';
                    ctx.fillRect(pX + pW, pY + pH / 2, pistolBarrelWidth, pistolBarrelHeight);
                    ctx.fillRect(pX + pW - 5, pY + pH / 2 + pistolBarrelHeight, pistolHandleWidth, pistolHandleHeight);
                } else {
                    const eye1X = pX + 8;
                    const eye2X = pX + 20;
                    const pupil1X = pX + 10;
                    const pupil2X = pX + 22;
                    const smileX = pX + 16;
                    ctx.fillStyle = '#FFF';
                    ctx.fillRect(eye1X, pY + eyeOffsetY, eyeSize, eyeSize);
                    ctx.fillRect(eye2X, pY + eyeOffsetY, eyeSize, eyeSize);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(pupil1X, pY + eyeOffsetY + 2, pupilSize, pupilSize);
                    ctx.fillRect(pupil2X, pY + eyeOffsetY + 2, pupilSize, pupilSize);
                    ctx.beginPath();
                    ctx.arc(smileX, pY + smileOffsetY, smileRadius, 0, Math.PI);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillStyle = '#333';
                    ctx.fillRect(pX - pistolBarrelWidth, pY + pH / 2, pistolBarrelWidth, pistolBarrelHeight);
                    ctx.fillRect(pX - 3, pY + pH / 2 + pistolBarrelHeight, pistolHandleWidth, pistolHandleHeight);
                }
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(l.player.x - l.camera.x, l.player.y, l.player.width, l.player.height);
                if (l.player.wallSliding) {
                    ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
                    ctx.fillRect(l.player.x - l.camera.x, l.player.y, l.player.width, l.player.height);
                }
            }
            drawUI();
        }

        // --- Bucle principal ---
        function gameLoop() {
            update();
            draw();
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        loadLevel(l.currentLevel);
        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className="super-marcos-body">
            <div className="game-container">
                <h1 className="game-title">Super Marcos</h1>
                <canvas ref={canvasRef} className="gameCanvas" width="800" height="600"></canvas>
                <div className="instructions">
                    <p><strong>🎮 Advanced Controls:</strong></p>
                    <p>Arrow Keys: Move | <strong>Arrow Up: Jump</strong> | <strong>Spacebar: Shoot</strong> | Shift: Dash</p>
                    <p>Wall Jump: Slide on wall + Arrow Up</p>
                    <p><strong>🎯 Game Features:</strong></p>
                    <p>Collect coins (gold) and power-ups (colored boxes)</p>
                    <p>Defeat enemies by jumping on them</p>
                    <p>Reach the golden goal to complete levels!</p>
                    <p><strong>⌨️ Menu Controls:</strong></p>
                    <p>P: Pause | R: Restart | ESC: Menu | ENTER: Start</p>
                </div>
            </div>
        </div>
    );
};

export default SuperMarcos; 
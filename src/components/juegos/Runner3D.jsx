// src/components/juegos/Runner3D.jsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// --- Game Constants ---
const LANE_WIDTH = 4; // Ancho de cada carril imaginario
const NUM_LANES = 3; // Número de carriles
const TRACK_WIDTH = LANE_WIDTH * NUM_LANES;
const TRACK_LENGTH = 100; // Longitud visible del suelo a la vez
const PLAYER_SIZE = 1; // Tamaño del cubo del jugador
const PLAYER_COLOR = 0x3498db; // Azul
const GROUND_COLOR = 0x2c3e50; // Azul oscuro/gris
const OBSTACLE_COLOR = 0xe74c3c; // Rojo
const OBSTACLE_SIZE = PLAYER_SIZE;
const TEXT_COLOR = 0xffcc00; // Warmer gold color
const TEXT_EMISSIVE_COLOR = 0x443300; // Subtle dark gold glow

// --- Physics & Speed (ADJUSTED FOR 3D AND SLOWER PACE) ---
const GRAVITY = -15; // Gravedad (negativa en Y)
const JUMP_FORCE = 8;
const INITIAL_SPEED = 5; // <<< VELOCIDAD REDUCIDA
const SPEED_INCREMENT = 0.005; // <<< Incremento más lento
const OBSTACLE_SPAWN_Z = -TRACK_LENGTH / 2 - 10; // Dónde aparecen los obstáculos (lejos)
const OBSTACLE_DESPAWN_Z = 10; // Dónde desaparecen (detrás de la cámara)
const OBSTACLE_MIN_INTERVAL = 1.0; // Segundos mínimos entre spawns
const OBSTACLE_MAX_INTERVAL = 2.5; // Segundos máximos entre spawns

function Runner3D() {
    const mountRef = useRef(null);
    const gameRunningRef = useRef(true);
    const animationFrameId = useRef(null);
    const clock = useRef(new THREE.Clock());

    // --- Three.js Refs ---
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const playerRef = useRef(null);
    const groundRef = useRef(null);
    const obstaclesGroupRef = useRef(null); // Grupo para mover todos los obstáculos
    const danteTextRef = useRef(null);

    // --- Game State Refs ---
    const playerState = useRef({
        y: PLAYER_SIZE / 2, // Posición inicial Y sobre el suelo
        velocityY: 0,
        isJumping: false,
        lane: Math.floor(NUM_LANES / 2), // Empezar en el carril central
    });
    const gameSpeedRef = useRef(INITIAL_SPEED);
    const scoreRef = useRef(0);
    const timeToNextObstacleRef = useRef(OBSTACLE_MIN_INTERVAL);
    const fontLoadedRef = useRef(false); // Para saber si la fuente está lista

    // --- React State ---
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loadingFont, setLoadingFont] = useState(true);

    // --- Lane Calculation ---
    const getLaneX = (laneIndex) => {
        return (laneIndex - Math.floor(NUM_LANES / 2)) * LANE_WIDTH;
    };

    // --- Setup Scene ---
    useEffect(() => {
        const currentMount = mountRef.current;
        const { clientWidth: width, clientHeight: height } = currentMount;

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setClearColor(0x87CEEB); // Color cielo
        currentMount.appendChild(rendererRef.current.domElement);

        // Scene
        sceneRef.current = new THREE.Scene();

        // Camera
        cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        cameraRef.current.position.set(0, PLAYER_SIZE * 1.7, 6); // Higher and further back
        cameraRef.current.lookAt(0, PLAYER_SIZE / 2, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        sceneRef.current.add(directionalLight);

        // Player
        const playerGeo = new THREE.BoxGeometry(PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
        const playerMat = new THREE.MeshStandardMaterial({ color: PLAYER_COLOR });
        playerRef.current = new THREE.Mesh(playerGeo, playerMat);
        playerRef.current.position.x = getLaneX(playerState.current.lane);
        playerRef.current.position.y = playerState.current.y;
        sceneRef.current.add(playerRef.current);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(TRACK_WIDTH, TRACK_LENGTH);
        const groundMat = new THREE.MeshStandardMaterial({ color: GROUND_COLOR });
        groundRef.current = new THREE.Mesh(groundGeo, groundMat);
        groundRef.current.rotation.x = -Math.PI / 2; // Rotar para que sea horizontal
        groundRef.current.position.y = 0; // Situado en Y=0
        sceneRef.current.add(groundRef.current);

        // Obstacles Group
        obstaclesGroupRef.current = new THREE.Group();
        sceneRef.current.add(obstaclesGroupRef.current);

        // Updated font loading and text creation
        const fontLoader = new FontLoader();
        fontLoader.load(
            '/helvetiker_regular.typeface.json',
            (font) => {
                console.log("Font loaded successfully");
                const textGeo = new TextGeometry('DANTE', {
                    font: font,
                    size: 4.5,   // Larger size
                    height: 0.6, // Thicker depth
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.2, // More pronounced bevel
                    bevelSize: 0.15,     // Wider bevel
                    bevelOffset: 0,
                    bevelSegments: 5
                });
                textGeo.computeBoundingBox();
                const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;

                // Enhanced text material
                const textMat = new THREE.MeshStandardMaterial({
                    color: TEXT_COLOR,
                    metalness: 0.5,    // More metallic
                    roughness: 0.4,    // Less rough for more reflections
                    emissive: TEXT_EMISSIVE_COLOR,
                    emissiveIntensity: 0.5,
                    flatShading: false // Ensure smooth shading
                });

                danteTextRef.current = new THREE.Mesh(textGeo, textMat);
                danteTextRef.current.position.set(-textWidth / 2, PLAYER_SIZE * 3.5, OBSTACLE_SPAWN_Z + 15);
                sceneRef.current.add(danteTextRef.current);
                fontLoadedRef.current = true;
                setLoadingFont(false);
            },
            undefined,
            (error) => {
                console.error('Error loading font:', error);
                setLoadingFont(false);
            }
        );

        // Handle Resize
        const handleResize = () => {
            if (!currentMount) return;
            const { clientWidth: newWidth, clientHeight: newHeight } = currentMount;
            rendererRef.current.setSize(newWidth, newHeight);
            cameraRef.current.aspect = newWidth / newHeight;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Start Game Loop
        gameRunningRef.current = true;
        clock.current.start();
        resetGame(); // Initial setup of game state
        gameLoop();

        // Cleanup
        return () => {
            gameRunningRef.current = false;
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current && rendererRef.current.domElement && currentMount.contains(rendererRef.current.domElement)) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            // Dispose Three.js objects (importante para evitar leaks)
            playerGeo?.dispose();
            playerMat?.dispose();
            groundGeo?.dispose();
            groundMat?.dispose();
            obstaclesGroupRef.current?.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            danteTextRef.current?.geometry?.dispose();
            danteTextRef.current?.material?.dispose();
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current?.dispose(); // Dispose del renderer
            rendererRef.current = null;
        };
    }, []);

    // --- Game Logic ---

    const spawnObstacle = useCallback(() => {
        const obstacleGeo = new THREE.BoxGeometry(OBSTACLE_SIZE, OBSTACLE_SIZE * (1 + Math.random()), OBSTACLE_SIZE); // Altura variable
        const obstacleMat = new THREE.MeshStandardMaterial({ color: OBSTACLE_COLOR });
        const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);

        const lane = Math.floor(Math.random() * NUM_LANES);
        obstacle.position.x = getLaneX(lane);
        obstacle.position.y = obstacle.geometry.parameters.height / 2; // Apoyado en el suelo
        obstacle.position.z = OBSTACLE_SPAWN_Z;

        obstaclesGroupRef.current.add(obstacle);
    }, []);

    const updatePlayer = useCallback((delta) => {
        const state = playerState.current;
        state.y += state.velocityY * delta;

        if (state.isJumping) {
            state.velocityY += GRAVITY * delta;
        }

        // Colisión con el suelo
        if (state.y <= PLAYER_SIZE / 2) {
            state.y = PLAYER_SIZE / 2;
            state.velocityY = 0;
            state.isJumping = false;
        }

        playerRef.current.position.y = state.y;
        // Smoother lateral movement
        playerRef.current.position.x = THREE.MathUtils.lerp(
            playerRef.current.position.x,
            getLaneX(state.lane),
            0.1 // Slower, smoother movement
        );

    }, []);

    const updateObstacles = useCallback((delta) => {
        const speed = gameSpeedRef.current;
        const obstaclesToRemove = [];

        obstaclesGroupRef.current.position.z += speed * delta; // Mover el grupo entero

        obstaclesGroupRef.current.children.forEach(obstacle => {
            // Calcular posición real del obstáculo en el mundo
            const worldZ = obstacle.position.z + obstaclesGroupRef.current.position.z;

            // Eliminar obstáculos que han pasado la cámara
            if (worldZ > OBSTACLE_DESPAWN_Z) {
                obstaclesToRemove.push(obstacle);
            }
        });

        obstaclesToRemove.forEach(obstacle => {
            obstaclesGroupRef.current.remove(obstacle);
            // ¡Importante disponer geometría y material si no los reutilizas!
            obstacle.geometry.dispose();
            obstacle.material.dispose();
        });

        // Spawn Logic
        timeToNextObstacleRef.current -= delta;
        if (timeToNextObstacleRef.current <= 0) {
            spawnObstacle();
            timeToNextObstacleRef.current = OBSTACLE_MIN_INTERVAL + Math.random() * (OBSTACLE_MAX_INTERVAL - OBSTACLE_MIN_INTERVAL);
        }

    }, [spawnObstacle]); // Depende de spawnObstacle

    const checkCollisions = useCallback(() => {
        if (!playerRef.current) return false;

        const playerBox = new THREE.Box3().setFromObject(playerRef.current);

        for (const obstacle of obstaclesGroupRef.current.children) {
            const obstacleBox = new THREE.Box3();
            // IMPORTANT: Necesitamos calcular el bounding box en coordenadas MUNDIALES
            // ya que el obstáculo está dentro de un grupo que se mueve.
            obstacle.updateMatrixWorld(); // Asegura que la matriz mundial esté actualizada
            obstacleBox.setFromObject(obstacle, true); // El 'true' considera transformaciones de ancestros

            if (playerBox.intersectsBox(obstacleBox)) {
                return true; // Colisión detectada
            }
        }
        return false;
    }, []);


    const resetGame = useCallback(() => {
        playerState.current = {
            y: PLAYER_SIZE / 2,
            velocityY: 0,
            isJumping: false,
            lane: Math.floor(NUM_LANES / 2),
        };
        if (playerRef.current) {
            playerRef.current.position.y = playerState.current.y;
            playerRef.current.position.x = getLaneX(playerState.current.lane);
        }

        // Limpiar obstáculos existentes
        if (obstaclesGroupRef.current) {
            while (obstaclesGroupRef.current.children.length > 0) {
                const obj = obstaclesGroupRef.current.children[0];
                obstaclesGroupRef.current.remove(obj);
                obj.geometry?.dispose();
                obj.material?.dispose();
            }
            obstaclesGroupRef.current.position.z = 0; // Resetear posición del grupo
        }


        gameSpeedRef.current = INITIAL_SPEED;
        scoreRef.current = 0;
        timeToNextObstacleRef.current = OBSTACLE_MIN_INTERVAL;
        setScore(0);
        setGameOver(false);
        gameRunningRef.current = true; // Permitir que el loop corra
        clock.current.start(); // Reiniciar el reloj por si acaso

        // Asegurarse de que el loop se reinicie si estaba parado
        if (!animationFrameId.current && mountRef.current) {
            gameLoop();
        }

    }, []); // No dependencies that change often

    // --- Game Loop ---
    const gameLoop = useCallback(() => {
        if (!gameRunningRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
            animationFrameId.current = null;
            if (gameOver) {
                // Podríamos renderizar una pantalla de game over aquí si quisiéramos
                console.log("Game Over - Final Score:", scoreRef.current);
            }
            return;
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);

        const delta = clock.current.getDelta();

        // --- Updates ---
        updatePlayer(delta);
        updateObstacles(delta);

        // --- Speed & Score ---
        gameSpeedRef.current += SPEED_INCREMENT * delta;
        scoreRef.current += gameSpeedRef.current * delta * 1; // Puntuación basada en velocidad y tiempo
        setScore(Math.floor(scoreRef.current));

        // --- Collision Check ---
        if (checkCollisions()) {
            gameRunningRef.current = false;
            setGameOver(true);
            // El loop terminará en la siguiente iteración al chequear gameRunningRef.current
        }

        // --- Render ---
        rendererRef.current.render(sceneRef.current, cameraRef.current);

    }, [gameOver, updatePlayer, updateObstacles, checkCollisions]); // Add dependencies

    // --- Input Handler ---
    const handleKeyDown = useCallback((event) => {
        if (loadingFont) return; // No hacer nada si la fuente aún no carga

        if (gameOver && event.code === 'KeyR') {
            resetGame();
        } else if (!gameOver) {
            const state = playerState.current;
            switch (event.code) {
                case 'Space':
                case 'ArrowUp':
                    if (!state.isJumping) {
                        state.velocityY = JUMP_FORCE;
                        state.isJumping = true;
                    }
                    break;
                case 'ArrowLeft':
                    // Mover a la izquierda si no estamos en el carril más a la izquierda
                    state.lane = Math.max(0, state.lane - 1);
                    break;
                case 'ArrowRight':
                    // Mover a la derecha si no estamos en el carril más a la derecha
                    state.lane = Math.min(NUM_LANES - 1, state.lane + 1);
                    break;
                // Añadir 'ArrowDown' para agacharse si se implementa
            }
        }
    }, [gameOver, resetGame, loadingFont]); // Add loadingFont dependency

    // Effect for input listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]); // Depend on handleKeyDown

    return (
        <div style={{ width: '100%', maxWidth: '800px', height: '400px', margin: '1rem auto', border: '1px solid #ccc', position: 'relative' }}>
            {loadingFont && <div style={overlayStyle}>Loading 3D Assets...</div>}
            {gameOver && (
                <div style={overlayStyle}>
                    <p style={{ fontSize: '2em', marginBottom: '0.5em' }}>GAME OVER</p>
                    <p>Final Score: {Math.floor(scoreRef.current)}</p>
                    <p>Press R to Retry</p>
                </div>
            )}
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Asegurar que esté sobre el canvas
    fontSize: '1.5em',
    textAlign: 'center'
};


export default Runner3D;
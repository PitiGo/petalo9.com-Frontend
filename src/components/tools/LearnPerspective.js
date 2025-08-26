import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LearnPerspective.css'; // Importaremos los estilos por separado.

const LearnPerspective = () => {
    // Ref para el contenedor del canvas de Three.js
    const mountRef = useRef(null);

    // Estado para los índices de los ángulos y el modo de vista
    const [yawIndex, setYawIndex] = useState(2);
    const [pitchIndex, setPitchIndex] = useState(2);
    const [isSolidView, setSolidView] = useState(false);

    // Ref para almacenar objetos de Three.js que necesitan ser accedidos a través de los renders
    const threeObjectsRef = useRef({});

    // Lista de ángulos predefinidos
    const discreteAngles = [0, 22.5, 45, 67.5, 90];

    // useEffect para inicializar la escena de Three.js (se ejecuta solo una vez)
    useEffect(() => {
        const currentMount = mountRef.current;

        // --- Configuración de Renderer ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5eeda);

        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 7;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // --- Creación del cubo con líneas ---
        const boxGroup = new THREE.Group();
        scene.add(boxGroup);

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        
        const toonMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
        const cubeFill = new THREE.Mesh(geometry, toonMaterial);
        boxGroup.add(cubeFill);

        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3d352a, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edgesGeometry, lineMaterial);
        boxGroup.add(wireframe);

        // --- Iluminación ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        
        // Almacenar objetos en la ref para usarlos en otros efectos
        threeObjectsRef.current = { boxGroup, toonMaterial, wireframe };

        // --- Manejador de Redimensión ---
        const handleResize = () => {
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // --- Bucle de Animación ---
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // --- Limpieza al desmontar el componente ---
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            currentMount.removeChild(renderer.domElement);
        };
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez

    // useEffect para actualizar la rotación cuando cambian los índices
    useEffect(() => {
        const { boxGroup } = threeObjectsRef.current;
        if (boxGroup) {
            const rotY = discreteAngles[yawIndex];
            const rotX = discreteAngles[pitchIndex];
            
            boxGroup.rotation.y = THREE.MathUtils.degToRad(rotY);
            boxGroup.rotation.x = THREE.MathUtils.degToRad(rotX);
        }
    }, [yawIndex, pitchIndex, discreteAngles]);

    // useEffect para cambiar el modo de vista (sólido/rayos-x)
    useEffect(() => {
        const { toonMaterial } = threeObjectsRef.current;
        if (toonMaterial) {
            if (isSolidView) {
                toonMaterial.transparent = false;
                toonMaterial.opacity = 1;
                toonMaterial.polygonOffset = true;
                toonMaterial.polygonOffsetFactor = 1;
                toonMaterial.polygonOffsetUnits = 1;
            } else {
                toonMaterial.transparent = true;
                toonMaterial.opacity = 0.8;
                toonMaterial.polygonOffset = false;
            }
            toonMaterial.needsUpdate = true;
        }
    }, [isSolidView]);

    // --- Manejadores de Eventos ---
    const handleReset = () => {
        setYawIndex(2);
        setPitchIndex(2);
        setSolidView(false);
    };

    return (
        <div id="main-container">
            <div id="renderer-wrapper">
                <div id="renderer-container" ref={mountRef}></div>
            </div>
            <div id="controls-container">
                <h1>Perspective for Artists</h1>
                <div className="control-group">
                    <label>Horizontal Rotation (Yaw)</label>
                    <div className="button-group">
                        <button onClick={() => setYawIndex(i => Math.max(0, i - 1))}>◀</button>
                        <button onClick={() => setYawIndex(i => Math.min(discreteAngles.length - 1, i + 1))}>▶</button>
                    </div>
                </div>
                <div className="control-group">
                    <label>Vertical Rotation (Pitch)</label>
                    <div className="button-group">
                        <button onClick={() => setPitchIndex(i => Math.max(0, i - 1))}>◀</button>
                        <button onClick={() => setPitchIndex(i => Math.min(discreteAngles.length - 1, i + 1))}>▶</button>
                    </div>
                </div>
                
                <div className="control-group checkbox-group">
                    <label htmlFor="solidViewCheckbox">Solid View</label>
                    <input 
                        type="checkbox" 
                        id="solidViewCheckbox" 
                        checked={isSolidView}
                        onChange={(e) => setSolidView(e.target.checked)}
                    />
                </div>

                <div id="info-box">
                    <p>Angle Y: <span id="angleY">{discreteAngles[yawIndex]}°</span></p>
                    <p>Angle X: <span id="angleX">{discreteAngles[pitchIndex]}°</span></p>
                </div>
                <button id="resetButton" onClick={handleReset}>Reset View</button>
            </div>
        </div>
    );
};

export default LearnPerspective;
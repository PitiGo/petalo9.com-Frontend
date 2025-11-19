import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const BloomImage = ({ imageUrl, strength, radius, threshold }) => {
    const mountRef = useRef(null);

    // Refs para acceder a los objetos de Three.js sin provocar re-renders
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const composerRef = useRef(null);
    const bloomPassRef = useRef(null);
    const meshRef = useRef(null);
    const frameIdRef = useRef(null);

    // 1. Inicialización (Solo una vez)
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // Escena y Cámara
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.OrthographicCamera(
            width / -2, width / 2, height / 2, height / -2, 1, 1000
        );
        camera.position.z = 10;

        // Renderizador
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ReinhardToneMapping;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Post-Processing
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            strength, radius, threshold
        );
        bloomPassRef.current = bloomPass;

        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);
        composerRef.current = composer;

        // Loop de animación
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            composer.render();
        };
        animate();

        // Manejo de redimensionamiento
        const handleResize = () => {
            if (!mount) return;
            const w = mount.clientWidth;
            const h = mount.clientHeight;

            renderer.setSize(w, h);
            composer.setSize(w, h);

            camera.left = w / -2;
            camera.right = w / 2;
            camera.top = h / 2;
            camera.bottom = h / -2;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', handleResize);
            if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
            renderer.dispose();
            composer.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Actualizar Parámetros del Bloom (Cuando cambian los props)
    useEffect(() => {
        if (bloomPassRef.current) {
            bloomPassRef.current.strength = Number(strength);
            bloomPassRef.current.radius = Number(radius);
            bloomPassRef.current.threshold = Number(threshold);
        }
    }, [strength, radius, threshold]);

    // 3. Cargar/Actualizar Imagen (Cuando cambia imageUrl)
    useEffect(() => {
        if (!sceneRef.current || !imageUrl) return;

        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
            // Limpiar mesh anterior si existe
            if (meshRef.current) {
                sceneRef.current.remove(meshRef.current);
                meshRef.current.geometry.dispose();
                meshRef.current.material.dispose();
            }

            // Calcular dimensiones para mantener proporción
            const imgWidth = texture.image.width;
            const imgHeight = texture.image.height;

            // Lógica para ajustar la imagen dentro del canvas (tipo "contain")
            const canvasWidth = mountRef.current.clientWidth;
            const canvasHeight = mountRef.current.clientHeight;

            const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.9; // 0.9 para un poco de margen

            const planeGeo = new THREE.PlaneGeometry(imgWidth, imgHeight);
            const planeMat = new THREE.MeshBasicMaterial({ map: texture });

            const mesh = new THREE.Mesh(planeGeo, planeMat);
            mesh.scale.set(scale, scale, 1);

            sceneRef.current.add(mesh);
            meshRef.current = mesh;
        });
    }, [imageUrl]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', background: '#000' }} />;
};

export default BloomImage;

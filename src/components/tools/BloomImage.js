import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const BloomImage = ({ imageUrl, strength, radius, threshold, exposure }) => {
    const mountRef = useRef(null);

    // Refs
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const composerRef = useRef(null);
    const bloomPassRef = useRef(null);
    const meshRef = useRef(null);
    const frameIdRef = useRef(null);

    // 1. Inicialización
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // Escena
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.OrthographicCamera(
            width / -2, width / 2, height / 2, height / -2, 1, 1000
        );
        camera.position.z = 10;

        // Renderizador mejorado
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar pixel ratio para performance

        // Gestión de color crítica para que la imagen se vea correcta
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = exposure || 1;

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

        // Loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            composer.render();
        };
        animate();

        // Resize
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

    // 2. Actualizar Parámetros
    useEffect(() => {
        if (bloomPassRef.current) {
            bloomPassRef.current.strength = Number(strength);
            bloomPassRef.current.radius = Number(radius);
            bloomPassRef.current.threshold = Number(threshold);
        }
        if (rendererRef.current) {
            rendererRef.current.toneMappingExposure = Number(exposure);
        }
    }, [strength, radius, threshold, exposure]);

    // 3. Cargar Imagen
    useEffect(() => {
        if (!sceneRef.current || !imageUrl) return;

        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
            // Configurar espacio de color de la textura
            texture.colorSpace = THREE.SRGBColorSpace;

            if (meshRef.current) {
                sceneRef.current.remove(meshRef.current);
                meshRef.current.geometry.dispose();
                meshRef.current.material.dispose();
            }

            const imgWidth = texture.image.width;
            const imgHeight = texture.image.height;

            const canvasWidth = mountRef.current.clientWidth;
            const canvasHeight = mountRef.current.clientHeight;

            const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.9;

            const planeGeo = new THREE.PlaneGeometry(imgWidth, imgHeight);
            // Usar MeshBasicMaterial es correcto para que el color base sea el de la imagen
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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeJSCSS3DSprites = () => {
  const mountRef = useRef(null);
  // Refs para mantener estado sin re-renderizar React
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const targetRotationRef = useRef(new THREE.Vector2(0, 0));

  // Referencias a los objetos 3D para animarlos
  const coreMeshRef = useRef(null);
  const wireframeMeshRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // 1. SETUP BÁSICO
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Cámara un poco más alejada para ver mejor los efectos
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true // Fondo transparente
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Mejor resolución en pantallas retina
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. ILUMINACIÓN MEJORADA
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Luz direccional principal (Azulada/Cyan)
    const dirLight1 = new THREE.DirectionalLight(0x64ffda, 3);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    // Luz de contra (Magenta/Morado) para dar profundidad
    const dirLight2 = new THREE.DirectionalLight(0xbd34fe, 2);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // 3. CREACIÓN DE OBJETOS (El "Núcleo")

    // A. Esfera interior sólida (Low Poly)
    const geometry = new THREE.IcosahedronGeometry(1.2, 1); // Radio 1.2, Detalle 1 (pocas caras)
    const material = new THREE.MeshStandardMaterial({
      color: 0x112240,      // Azul muy oscuro (Navy)
      roughness: 0.3,
      metalness: 0.8,
      flatShading: true,    // CLAVE: Hace que se vean los triángulos
    });
    const coreMesh = new THREE.Mesh(geometry, material);
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // B. Capa Wireframe (Alambre exterior)
    const wireGeo = new THREE.IcosahedronGeometry(1.4, 1); // Un poco más grande que el núcleo
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x64ffda,      // Color Cyan (Tu color de acento)
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);
    wireframeMeshRef.current = wireMesh;

    // 4. MANEJO DEL MOUSE
    const handleMouseMove = (event) => {
      // Normalizar coordenadas del mouse de -1 a 1
      const rect = mount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Guardamos el objetivo de rotación
      mouseRef.current.set(x, y);
    };

    // 5. ANIMACIÓN
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (coreMeshRef.current && wireframeMeshRef.current) {
        // A. Rotación automática constante
        coreMeshRef.current.rotation.y += 0.005;
        coreMeshRef.current.rotation.x += 0.002;

        wireframeMeshRef.current.rotation.y -= 0.005; // Gira al lado contrario
        wireframeMeshRef.current.rotation.x -= 0.002;

        // B. Efecto de "respiración" (Pulsar)
        const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.05;
        wireframeMeshRef.current.scale.set(scale, scale, scale);

        // C. Interactividad suave con el mouse (Lerp)
        // Interpolamos la rotación actual hacia la posición del mouse
        targetRotationRef.current.x = mouseRef.current.y * 0.5; // Mouse Y afecta rotación X
        targetRotationRef.current.y = mouseRef.current.x * 0.5; // Mouse X afecta rotación Y

        // Aplicar rotación extra basada en el mouse (suavizada)
        coreMeshRef.current.rotation.x += (targetRotationRef.current.x - coreMeshRef.current.rotation.x * 0.1) * 0.05;
        coreMeshRef.current.rotation.y += (targetRotationRef.current.y - coreMeshRef.current.rotation.y * 0.1) * 0.05;
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    // Listeners
    mount.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Iniciar loop
    animate();

    // 6. RESIZE HANDLER
    function handleResize() {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }

    // 7. CLEANUP
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (mount) mount.removeEventListener('mousemove', handleMouseMove);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }

      // Limpiar memoria de Three.js
      geometry.dispose();
      material.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '400px', // Altura fija o ajusta según necesites
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    />
  );
};

export default ThreeJSCSS3DSprites;

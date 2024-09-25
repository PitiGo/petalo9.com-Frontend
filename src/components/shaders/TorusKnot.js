import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function TorusKnot() {
  const ref = useRef();
  const frameId = useRef();

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    currentRef.appendChild(renderer.domElement);

    // Material para el toro anudado
    const material = new THREE.MeshPhysicalMaterial({
      color: '#4e62f9',
      // Aquí puedes añadir más propiedades como roughness o metalness si lo deseas
    });

    // Geometría para el toro anudado
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 100);
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    camera.position.z = 5; // Puede que necesites ajustar esto para que el toro anudado quepa en la vista de la cámara

    // Función de animación
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    // Iniciar la animación
    animate();

    // Manejar redimensionamiento del contenedor
    const handleResize = () => {
      const width = currentRef.clientWidth;
      const height = currentRef.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    // Añadir listener para el evento de redimensionamiento
    window.addEventListener('resize', handleResize);

    // Limpieza al desmontar el componente
    return () => {
      cancelAnimationFrame(frameId.current);
      currentRef.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      scene.clear();
    };
  }, []);

  // Renderizar el contenedor que mantendrá el canvas de Three.js
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

export default TorusKnot;

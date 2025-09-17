import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const CursorFollower = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Configuración básica de la escena
    const scene = new THREE.Scene();

    // Ajustar el campo de visión y la posición de la cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4
      ;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Cargar la textura para todas las caras
    const loader = new THREE.TextureLoader();
    const texture = loader.load('logo.webp');

    const material = new THREE.MeshBasicMaterial({ map: texture });

    // Crear un cubo con la misma textura en todas las caras
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(0.6, 0.6, 0.6);
    scene.add(cube);

    // Variables para la animación
    let targetY = 0;

    // Límites de movimiento del cubo en el eje Y
    let minY;
    let maxY;

    // Función para actualizar los límites según el tamaño de la ventana
    const updateLimits = () => {
      const fovInRadians = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(fovInRadians / 2) * camera.position.z;
      minY = -visibleHeight / 2;
      maxY = visibleHeight / 2;
    };

    // Llamar a updateLimits inicialmente
    updateLimits();

    // Función para actualizar la posición objetivo del cubo según el cursor
    const onMouseMove = (event) => {
      const rect = mount.getBoundingClientRect();
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Mapeo de mouseY al rango de movimiento del cubo
      targetY = mouseY * (maxY - minY) / 2;
    };

    // Añadir el listener al evento de movimiento del mouse
    window.addEventListener('mousemove', onMouseMove);

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);

      // Interpolación suave hacia la posición objetivo
      cube.position.y += (targetY - cube.position.y) * 0.1;

      // Rotación constante
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };
    animate();

    // Manejo de redimensionamiento
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Recalcular los límites
      updateLimits();
    };
    window.addEventListener('resize', handleResize);

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();

      // Liberar recursos
      material.dispose();
      texture.dispose();
      geometry.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default CursorFollower;
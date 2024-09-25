import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function Cube() {
  const ref = useRef();
  const frameId = useRef();

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    currentRef.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const materials = [
      new THREE.MeshBasicMaterial({ map: textureLoader.load('mozaico_1.png') }),
      new THREE.MeshBasicMaterial({ map: textureLoader.load('mozaico_2.png') }),
      // Continúa agregando las texturas para las otras caras
      new THREE.MeshBasicMaterial({ map: textureLoader.load('mozaico_3.png') }),
      new THREE.MeshBasicMaterial({ map: textureLoader.load('mozaico_4.png') }),
      new THREE.MeshBasicMaterial({ map: textureLoader.load('mozaico_5.png') }),
      new THREE.MeshBasicMaterial({ map: textureLoader.load('mozaico_6.png') }),
    ];

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    camera.position.z = 2.5;

    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = currentRef.clientWidth;
      const height = currentRef.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId.current);
      currentRef.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      scene.clear();
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '1000px' }}></div>;
}

export default Cube;

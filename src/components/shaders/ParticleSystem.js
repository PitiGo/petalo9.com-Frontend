import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

function ParticleSystem() {
  const ref = useRef();
  const frameId = useRef();
  const [radius, setRadius] = useState(1); // Estado para el radio

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    currentRef.appendChild(renderer.domElement);

    const particlesCount = 6000; // El número de partículas
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3); // Array para los colores
    const targetPositions = [];
    const angleStep = (Math.PI * 2) / particlesCount;

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = Math.random() * 2 - 1; // x
      positions[i * 3 + 1] = Math.random() * 2 - 1; // y
      positions[i * 3 + 2] = Math.random() * 2 - 1; // z

      const angle = angleStep * i;
      targetPositions.push(Math.cos(angle), Math.sin(angle), 0);

      colors[i * 3] = Math.random();     // R
      colors[i * 3 + 1] = Math.random(); // G
      colors[i * 3 + 2] = Math.random(); // B
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 2.5;


    

    const animateParticles = () => {
      const positions = particlesGeometry.attributes.position.array;
  
      for (let i = 0; i < particlesCount; i++) {
        const targetX = Math.cos(angleStep * i) * radius;
        const targetY = Math.sin(angleStep * i) * radius;
  
        positions[i * 3] += (targetX - positions[i * 3]) * 0.01;
        positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * 0.01;
      }
  
      particlesGeometry.attributes.position.needsUpdate = true;
    };
    
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      animateParticles();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = currentRef.clientWidth;
      const height = currentRef.clientHeight;
  
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
  
      const newRadius = width < 600 ? 0.5 : 1;
      setRadius(newRadius); // Actualiza el radio
    };
    
    window.addEventListener('resize', handleResize);
    


    return () => {
      cancelAnimationFrame(frameId.current);
      currentRef.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      scene.clear();
    };
  }, [radius]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

export default ParticleSystem;

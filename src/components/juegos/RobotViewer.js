import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function RobotViewer() {
  const ref = useRef();
  const frameId = useRef();
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('');

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2b3c); // Un fondo oscuro
    const camera = new THREE.PerspectiveCamera(75, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    currentRef.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.autoRotate = true; // Rotación automática
    controls.autoRotateSpeed = 0.5;

    const loader = new GLTFLoader();

    setLoadingStatus('Loading robot model...');
    loader.load(
      '/robot.glb', // El modelo que pusiste en la carpeta public
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5); // Ajusta la escala si es necesario
        scene.add(model);
        
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        model.position.sub(center);

        camera.position.set(0, 1, 3);
        camera.lookAt(0, 0, 0);
        
        setLoadingStatus('Model loaded successfully');
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        setError('Error loading robot.glb model.');
      }
    );
    
    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Additional lights for better illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.6, 100);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controls.update();
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
      if (currentRef && renderer.domElement) {
        currentRef.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      scene.clear();
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} style={{ width: '100%', height: '80vh', maxHeight: '1000px' }}></div>
      {error && <div style={{ color: 'red', position: 'absolute', top: 10, left: 10 }}>{error}</div>}
      {loadingStatus && <div style={{ position: 'absolute', top: 10, left: 10 }}>{loadingStatus}</div>}
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px', borderRadius: '5px' }}>
        <h3>Controls:</h3>
        <ul>
          <li>The model rotates automatically.</li>
          <li>Left click + drag: Rotate view manually.</li>
          <li>Right click + drag: Move camera.</li>
          <li>Mouse wheel: Zoom.</li>
        </ul>
      </div>
    </div>
  );
}

export default RobotViewer;

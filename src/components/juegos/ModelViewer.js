import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function ModelViewer() {
  const ref = useRef();
  const frameId = useRef();
  const modelRef = useRef();
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('');

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    const camera = new THREE.PerspectiveCamera(75, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    currentRef.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const loader = new GLTFLoader();

    // Función para cargar un modelo
    const loadModel = (url, position) => {
      setLoadingStatus(`Loading model...`);
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            const model = gltf.scene;
            model.position.set(...position);
            scene.add(model);
            setLoadingStatus(`Model loaded successfully`);
            resolve(model);
          },
          undefined,
          (error) => {
            console.error(`Error loading model:`, error);
            setError(`Error loading model: ${error.message}`);
            reject(error);
          }
        );
      });
    };

    // Cargar solo el modelo shaded
    loadModel('/base_basic_shaded.glb', [0, 0, 0])
      .then((model) => {
        model.scale.set(0.5, 0.5, 0.5);
        modelRef.current = model;

        // Acercar la cámara al modelo
        camera.position.z = 2;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const animate = () => {
          frameId.current = requestAnimationFrame(animate);
          if (modelRef.current) {
            modelRef.current.rotation.y += 0.005; // Velocidad de rotación reducida
          }
          controls.update();
          renderer.render(scene, camera);
        };

        animate();
      }).catch(error => {
        console.error("Error loading the model:", error);
        setError(`Error loading the model: ${error.message}`);
      });

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

  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} style={{ width: '100%', height: '1000px' }}></div>
      {error && <div style={{ color: 'red', position: 'absolute', top: 10, left: 10 }}>{error}</div>}
      {loadingStatus && <div style={{ position: 'absolute', top: 10, left: 10 }}>{loadingStatus}</div>}
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px', borderRadius: '5px' }}>
        <h3>Instrucciones:</h3>
        <ul>
          <li>The model rotates automatically</li>
          <li>Left click + drag: Rotate the view</li>
          <li>Right click + drag: Move the camera</li>
          <li>Mouse wheel: Zoom</li>
        </ul>

      </div>
    </div>
  );
}

export default ModelViewer;
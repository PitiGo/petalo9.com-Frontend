import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeJSCSS3DSprites = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameIdRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false
    });
    renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = false;
    controls.enabled = false;
    controlsRef.current = controls;

    // Increase detail for smoother sphere
    const geo = new THREE.IcosahedronGeometry(1.0, 4);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x8000ff,  // Purple color
      shininess: 10,
      flatShading: false,
      transparent: true,
      opacity: 0.9 // Slight transparency
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,  // White color for wireframe
      transparent: true,
      opacity: 0.5
    });
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      wireMat
    );
    mesh.add(wireframe);

    // Add ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add directional light for better shading
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    let lastTime = 0;
    const rotationSpeed = 0.05;

    function animate(time) {
      frameIdRef.current = requestAnimationFrame(animate);
      
      const deltaTime = time - lastTime;
      lastTime = time;

      if (sceneRef.current && rendererRef.current && controlsRef.current) {
        mesh.rotation.y += rotationSpeed * (deltaTime / 1000);
        wireframe.rotation.y -= rotationSpeed * 0.5 * (deltaTime / 1000);
        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, camera);
      }
    }
    animate(0);

    const handleResize = () => {
      if (mountRef.current && rendererRef.current && camera) {
        width = mountRef.current.clientWidth;
        height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    const handleMouseEnter = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    };

    const handleMouseLeave = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    };

    window.addEventListener('resize', handleResize);
    mountRef.current.addEventListener('mouseenter', handleMouseEnter);
    mountRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mouseenter', handleMouseEnter);
        mountRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (geo) geo.dispose();
      if (mat) mat.dispose();
      if (wireMat) wireMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '300px',
        marginTop: '2rem',
        cursor: 'grab',
        background: 'transparent'
      }}
    />
  );
};

export default ThreeJSCSS3DSprites;
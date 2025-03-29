import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeJSCSS3DSprites = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameIdRef = useRef(null);
  const controlsRef = useRef(null);
  const textureRef = useRef(null);
  const emissiveTextureRef = useRef(null);
  const geoRef = useRef(null);
  const matRef = useRef(null);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    // Texture: Restore size and fixed font
    const canvasSize = 256;

    // Base texture
    const textCanvas = document.createElement('canvas');
    textCanvas.width = canvasSize;
    textCanvas.height = canvasSize;
    const ctx = textCanvas.getContext('2d');
    ctx.fillStyle = '#0A192F';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#64FFDA';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Dante', canvasSize / 2, canvasSize / 2);
    const texture = new THREE.CanvasTexture(textCanvas);
    texture.needsUpdate = true;
    textureRef.current = texture;

    // Emissive texture
    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = canvasSize;
    emissiveCanvas.height = canvasSize;
    const emissiveCtx = emissiveCanvas.getContext('2d');
    emissiveCtx.fillStyle = '#000000';
    emissiveCtx.fillRect(0, 0, canvasSize, canvasSize);
    emissiveCtx.font = 'bold 48px Arial';
    emissiveCtx.fillStyle = '#FFFFFF';
    emissiveCtx.textAlign = 'center';
    emissiveCtx.textBaseline = 'middle';
    emissiveCtx.fillText('Dante', canvasSize / 2, canvasSize / 2);
    const emissiveTexture = new THREE.CanvasTexture(emissiveCanvas);
    emissiveTexture.needsUpdate = true;
    emissiveTextureRef.current = emissiveTexture;

    const geo = new THREE.IcosahedronGeometry(1.0, 3);
    geoRef.current = geo;

    const mat = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: new THREE.Color(0x64ffda),
      emissiveMap: emissiveTexture,
      emissiveIntensity: 0.6,
      shininess: 15,
      flatShading: false,
      transparent: false,
      opacity: 1.0
    });
    matRef.current = mat;

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Add ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add directional light for better shading
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    let lastTime = 0;
    const rotationSpeed = 0.05;

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (!isVisible && frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      } else if (isVisible && !frameIdRef.current) {
        lastTime = performance.now();
        animate(lastTime);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function animate(time) {
      frameIdRef.current = requestAnimationFrame(animate);

      if (!isVisible) return;

      const deltaTime = (time - lastTime) * 0.001;
      lastTime = time;

      if (sceneRef.current && rendererRef.current && controlsRef.current) {
        mesh.rotation.y += rotationSpeed * deltaTime;
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
      if (textureRef.current) textureRef.current.dispose();
      if (emissiveTextureRef.current) emissiveTextureRef.current.dispose();
      if (geoRef.current) geoRef.current.dispose();
      if (matRef.current) matRef.current.dispose();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      [rendererRef, sceneRef, controlsRef, textureRef,
        emissiveTextureRef, geoRef, matRef, frameIdRef].forEach(ref => {
          ref.current = null;
        });
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

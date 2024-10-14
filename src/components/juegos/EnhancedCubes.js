import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RenderPixelatedPass } from './RenderPixelatedPass';

function EnhancedCubes() {
  const ref = useRef();
  const frameId = useRef();
  const mousePosition = useRef(new THREE.Vector2());

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentRef.appendChild(renderer.domElement);

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    // Add cool directional light from above
    const directionalLight = new THREE.DirectionalLight(0x4466ff, 0.5);
    directionalLight.position.set(0, 5, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // Aumentamos la resolución de las sombras
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 10;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    scene.add(directionalLight);

    // Add intense warm spotlight
    const warmLight = new THREE.PointLight(0xffaa00, 2, 10);
    warmLight.position.set(0, 2, 0);
    warmLight.castShadow = true;
    warmLight.shadow.mapSize.width = 2048; // Aumentamos la resolución de las sombras
    warmLight.shadow.mapSize.height = 2048;
    scene.add(warmLight);

    // Add colorful rotating lights
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff];
    const rotatingLights = colors.map((color, index) => {
      const light = new THREE.PointLight(color, 1, 5);
      light.position.set(
        Math.cos(index * Math.PI / 2) * 3,
        1,
        Math.sin(index * Math.PI / 2) * 3
      );
      scene.add(light);
      return light;
    });

    // Create a canvas to draw the text for the displacement map
    const canvasSize = 1024; // Aumentamos el tamaño del canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const context = canvas.getContext('2d');

    // Fill the canvas with black
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the text "Dante" in white with outline
    context.font = 'bold 400px Arial'; // Aumentamos el tamaño de la fuente
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw stroke to enhance edges
    context.lineWidth = 20; // Aumentamos el grosor del borde
    context.strokeStyle = 'white';
    context.strokeText('Dante', canvas.width / 2, canvas.height / 2);
    context.fillText('Dante', canvas.width / 2, canvas.height / 2);

    // Create a displacement map from the canvas
    const displacementMap = new THREE.CanvasTexture(canvas);
    displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;

    // Add floor with displacement map
    const floorGeometry = new THREE.PlaneGeometry(10, 10, 512, 512); // Aumentamos los segmentos
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2,
      displacementMap: displacementMap,
      displacementScale: 0.5, // Aumentamos la escala de desplazamiento
      bumpMap: displacementMap,
      bumpScale: 0.5 // Aumentamos el bump scale
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create two cubes
    const cubes = [];
    const cubeColors = [0x00ffff, 0xff00ff];
    for (let i = 0; i < 2; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: cubeColors[i],
        metalness: 0.6,
        roughness: 0.4,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(i * 2 - 1, 0.5, 0);
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);
      cubes.push(cube);
    }

    camera.position.set(0, 4, 5);
    camera.lookAt(0, 0, 0);

    // Setup EffectComposer
    const composer = new EffectComposer(renderer);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const renderPixelatedPass = new RenderPixelatedPass(512, scene, camera, { edgeStrength: 0.15 });
    composer.addPass(renderPixelatedPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(currentRef.clientWidth, currentRef.clientHeight),
      0.8,
      0.3,
      0.8
    );
    composer.addPass(bloomPass);

    const animate = (time) => {
      frameId.current = requestAnimationFrame(animate);

      cubes.forEach((cube, index) => {
        cube.rotation.x += 0.002;
        cube.rotation.y += 0.003;
        
        // Subtle movement based on mouse position
        cube.position.x = (index * 2 - 1) + mousePosition.current.x * 0.05;
        cube.position.z = mousePosition.current.y * 0.05;
        
        // Subtle pulsating effect
        const scale = 1 + 0.05 * Math.sin(time * 0.001 + index * Math.PI);
        cube.scale.set(scale, scale, scale);
      });

      // Animate directional light
      const lightAngle = time * 0.0005;
      directionalLight.position.x = Math.sin(lightAngle) * 3;
      directionalLight.position.z = Math.cos(lightAngle) * 3;
      directionalLight.position.y = 5 + Math.sin(lightAngle * 2) * 1;

      // Animate warm spotlight
      warmLight.position.x = Math.sin(lightAngle * 0.5) * 1.5;
      warmLight.position.z = Math.cos(lightAngle * 0.5) * 1.5;
      warmLight.intensity = 2 + 1.5 * Math.sin(time * 0.002);

      // Animate rotating lights
      rotatingLights.forEach((light, index) => {
        const angle = lightAngle * (index + 1) * 0.5;
        light.position.x = Math.cos(angle) * 3;
        light.position.z = Math.sin(angle) * 3;
        light.intensity = 1 + 0.5 * Math.sin(time * 0.003 + index);
      });

      composer.render();
    };

    animate(0);

    const handleResize = () => {
      const width = currentRef.clientWidth;
      const height = currentRef.clientHeight;
      renderer.setSize(width, height);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const handleMouseMove = (event) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId.current);
      currentRef.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '400px' }}></div>;
}

export default EnhancedCubes;
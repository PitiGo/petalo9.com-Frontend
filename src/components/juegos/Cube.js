import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';

// Definición de RenderPixelatedPass
class RenderPixelatedPass extends Pass {
  constructor(resolution, scene, camera) {
    super();
    this.resolution = new THREE.Vector2(resolution, resolution);
    this.scene = scene;
    this.camera = camera;
    
    this.renderTarget = new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    });
    
    this.material = this.createMaterial();
    this.fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer, readBuffer) {
    const oldRenderTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(oldRenderTarget);

    this.material.uniforms.tDiffuse.value = this.renderTarget.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  createMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        resolution: {
          value: new THREE.Vector4(
            this.resolution.x,
            this.resolution.y,
            1 / this.resolution.x,
            1 / this.resolution.y
          )
        }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec4 resolution;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          vec4 texel = texture2D(tDiffuse, uv);
          gl_FragColor = texel;
        }
      `
    });
  }
}

// Definición de PixelatePass
class PixelatePass extends Pass {
  constructor(resolution) {
    super();
    this.resolution = new THREE.Vector2(resolution, resolution);
    this.fsQuad = new FullScreenQuad(this.createMaterial());
  }

  render(renderer, writeBuffer, readBuffer) {
    const uniforms = this.fsQuad.material.uniforms;
    uniforms.tDiffuse.value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  createMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        resolution: {
          value: new THREE.Vector4(
            this.resolution.x,
            this.resolution.y,
            1 / this.resolution.x,
            1 / this.resolution.y
          )
        }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec4 resolution;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          vec2 pixelatedUV = floor(uv * resolution.xy) / resolution.xy;
          gl_FragColor = texture2D(tDiffuse, pixelatedUV);
        }
      `
    });
  }
}

function Cube() {
  const ref = useRef();
  const frameId = useRef();

  useEffect(() => {
    const currentRef = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentRef.clientWidth / currentRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    currentRef.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Setup EffectComposer
    const composer = new EffectComposer(renderer);
    
    // Add RenderPixelatedPass
    const renderPixelatedPass = new RenderPixelatedPass(256, scene, camera);
    composer.addPass(renderPixelatedPass);

    // Add PixelatePass
    const pixelatePass = new PixelatePass(256);
    composer.addPass(pixelatePass);

    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      composer.render();
    };

    animate();

    const handleResize = () => {
      const width = currentRef.clientWidth;
      const height = currentRef.clientHeight;
      renderer.setSize(width, height);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId.current);
      currentRef.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '400px' }}></div>;
}

export default Cube;
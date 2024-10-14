import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';

export class RenderPixelatedPass extends Pass {
  constructor(resolution, scene, camera, options = {}) {
    super();
    this.resolution = new THREE.Vector2(resolution, resolution);
    this.scene = scene;
    this.camera = camera;
    this.edgeStrength = options.edgeStrength || 0.1;
    
    this.rgbRenderTarget = new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType
    });
    
    this.normalRenderTarget = new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    });

    this.depthRenderTarget = new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    });

    this.normalMaterial = new THREE.MeshNormalMaterial();
    this.depthMaterial = new THREE.MeshDepthMaterial();
    
    this.material = this.createPixelatedMaterial();
    this.fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer, readBuffer) {
    const oldRenderTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(this.rgbRenderTarget);
    renderer.render(this.scene, this.camera);

    const oldOverrideMaterial = this.scene.overrideMaterial;
    
    this.scene.overrideMaterial = this.normalMaterial;
    renderer.setRenderTarget(this.normalRenderTarget);
    renderer.render(this.scene, this.camera);

    this.scene.overrideMaterial = this.depthMaterial;
    renderer.setRenderTarget(this.depthRenderTarget);
    renderer.render(this.scene, this.camera);

    this.scene.overrideMaterial = oldOverrideMaterial;

    this.material.uniforms.tDiffuse.value = this.rgbRenderTarget.texture;
    this.material.uniforms.tNormal.value = this.normalRenderTarget.texture;
    this.material.uniforms.tDepth.value = this.depthRenderTarget.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }

    renderer.setRenderTarget(oldRenderTarget);
  }

  createPixelatedMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tNormal: { value: null },
        tDepth: { value: null },
        resolution: {
          value: new THREE.Vector4(
            this.resolution.x,
            this.resolution.y,
            1 / this.resolution.x,
            1 / this.resolution.y
          )
        },
        cameraNear: { value: this.camera.near },
        cameraFar: { value: this.camera.far },
        edgeStrength: { value: this.edgeStrength },
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
        uniform sampler2D tNormal;
        uniform sampler2D tDepth;
        uniform vec4 resolution;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float edgeStrength;
        varying vec2 vUv;

        float getDepth(vec2 uv) {
          return texture2D(tDepth, uv).r;
        }

        vec3 getNormal(vec2 uv) {
          return texture2D(tNormal, uv).rgb * 2.0 - 1.0;
        }

        float getEdgeFactor(vec2 uv) {
          vec2 pixelSize = resolution.zw;

          float depth = getDepth(uv);
          vec3 normal = getNormal(uv);

          float depthDiff = 0.0;
          depthDiff += abs(depth - getDepth(uv + vec2(pixelSize.x, 0.0)));
          depthDiff += abs(depth - getDepth(uv - vec2(pixelSize.x, 0.0)));
          depthDiff += abs(depth - getDepth(uv + vec2(0.0, pixelSize.y)));
          depthDiff += abs(depth - getDepth(uv - vec2(0.0, pixelSize.y)));

          vec3 normalDiff = vec3(0.0);
          normalDiff += abs(normal - getNormal(uv + vec2(pixelSize.x, 0.0)));
          normalDiff += abs(normal - getNormal(uv - vec2(pixelSize.x, 0.0)));
          normalDiff += abs(normal - getNormal(uv + vec2(0.0, pixelSize.y)));
          normalDiff += abs(normal - getNormal(uv - vec2(0.0, pixelSize.y)));

          float depthEdge = smoothstep(0.01, 0.02, depthDiff);
          float normalEdge = smoothstep(0.1, 0.2, length(normalDiff));

          return max(depthEdge, normalEdge);
        }

        void main() {
          vec2 pixelatedUV = floor(vUv * resolution.xy) / resolution.xy;
          vec4 color = texture2D(tDiffuse, pixelatedUV);

          float edgeFactor = getEdgeFactor(pixelatedUV);
          vec3 edgeColor = vec3(1.0);  // White edge highlight

          // Subtle edge highlighting
          color.rgb = mix(color.rgb, edgeColor, edgeFactor * edgeStrength);

          gl_FragColor = color;
        }
      `
    });
  }
}
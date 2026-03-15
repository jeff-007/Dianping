import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  attribute float aScale;
  attribute vec3 aSeed;

  varying float vAlpha;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec3 p = position;

    float t = uTime * 0.35;
    float w = sin(t + aSeed.x * 6.2831) * 0.35 + cos(t * 0.8 + aSeed.y * 6.2831) * 0.25;
    p += normalize(aSeed - 0.5) * w * 0.28;

    float attract = smoothstep(0.0, 1.0, uProgress) * 0.42;
    p = mix(p, p * 0.55, attract);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float size = (12.0 + 18.0 * aScale) / -mvPosition.z;
    gl_PointSize = size;

    vAlpha = 0.6 + 0.4 * aScale;
  }
`;

const fragmentShader = `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord.xy - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorA, uColorB, gl_PointCoord.y);
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

export type ParticlesProps = {
  count?: number;
  colorA?: string;
  colorB?: string;
  progressRef?: MutableRefObject<number>;
};

// 粒子系统（2000）：Points + ShaderMaterial
// - 漂浮/波动：基于 time 与随机种子
// - 向中心聚集：由 progress 驱动（滚动推进时更聚拢）
export default function Particles({
  count = 2000,
  colorA = '#ffffff',
  colorB = '#88ccff',
  progressRef
}: ParticlesProps) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 3.6 + Math.random() * 4.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi) * 0.55;
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      scales[i] = Math.random();
      seeds[i3 + 0] = Math.random();
      seeds[i3 + 1] = Math.random();
      seeds[i3 + 2] = Math.random();
    }

    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    return g;
  }, [count]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) }
      }
    });
  }, [colorA, colorB]);

  useFrame((state, delta) => {
    if (!points.current) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uProgress.value = progressRef?.current ?? 0;
    points.current.rotation.y += delta * 0.02;
    points.current.rotation.x += delta * 0.004;
  });

  return <points ref={points} geometry={geometry} material={material} />;
}

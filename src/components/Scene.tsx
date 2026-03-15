import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useTexture } from '@react-three/drei';
import { Bloom, EffectComposer, GodRays, Vignette } from '@react-three/postprocessing';
import { memo, type MutableRefObject, type RefObject, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Chapter } from '../data/chapters';
import CameraController from './CameraController';
import Particles from './Particles';
import gsap from 'gsap';

type SceneProps = {
  chapter: Chapter;
  chapterIndex: number;
  totalChapters: number;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// 中央发光能量装置：发光球体 + 半透明体积感 + 环绕能量环 + 脉冲点光源
function EnergyCore({
  color,
  coreMaterialRef,
  ringARef,
  ringBRef,
  lightRef
}: {
  color: string;
  coreMaterialRef: MutableRefObject<THREE.MeshPhysicalMaterial | null>;
  ringARef: MutableRefObject<THREE.MeshStandardMaterial | null>;
  ringBRef: MutableRefObject<THREE.MeshStandardMaterial | null>;
  lightRef: MutableRefObject<THREE.PointLight | null>;
}) {
  const core = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (core.current) {
      core.current.rotation.y = t * 0.22;
      core.current.rotation.x = t * 0.12;
      const s = 1 + Math.sin(t * 2) * 0.03;
      core.current.scale.setScalar(s);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(t * 2) * 0.5;
    }
    if (ringARef.current) {
      ringARef.current.opacity = 0.45 + Math.sin(t * 1.5) * 0.08;
    }
    if (ringBRef.current) {
      ringBRef.current.opacity = 0.28 + Math.cos(t * 1.2) * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial
          ref={coreMaterialRef}
          color="#0b1220"
          emissive={new THREE.Color(color)}
          emissiveIntensity={2.2}
          transmission={0.65}
          roughness={0.2}
          thickness={1.0}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} color={color} intensity={2.2} distance={12} />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.02, 12, 256]} />
        <meshStandardMaterial ref={ringARef} color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[1.6, 0.015, 12, 256]} />
        <meshStandardMaterial ref={ringBRef} color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function setGroupMaterialOpacity(group: THREE.Object3D, opacity: number) {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    const setOne = (m: THREE.Material) => {
      const anyM = m as unknown as { transparent?: boolean; opacity?: number };
      if (typeof anyM.opacity === 'number') {
        anyM.transparent = true;
        anyM.opacity = opacity;
      }
    };
    if (Array.isArray(mat)) mat.forEach(setOne);
    else setOne(mat);
  });
}

function TempleArches({ color, progress }: { color: string; progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const p = smoothstep(0.05, 0.95, progress.current);
    group.current.position.y = -0.55 + p * 0.55 + Math.sin(t * 0.6) * 0.02;
    group.current.rotation.y = Math.sin(t * 0.15) * 0.12 * (1 - p);
    group.current.scale.setScalar(0.88 + p * 0.14);
  });

  return (
    <group ref={group} position={[0, -0.3, -9]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.2 + i * 0.25, -i * 0.2]} rotation={[Math.PI / 2, 0, i * 0.22]}>
          <torusGeometry args={[3.6 + i * 0.45, 0.08, 16, 128]} />
          <meshStandardMaterial color="#060a12" emissive={color} emissiveIntensity={0.08} roughness={0.85} metalness={0.25} transparent opacity={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`p-${i}`} position={[Math.cos(i) * 4.2, -0.2, Math.sin(i) * 3.6]}>
          <cylinderGeometry args={[0.12, 0.18, 3.4 + (i % 3) * 0.35, 12]} />
          <meshStandardMaterial color="#050816" emissive={color} emissiveIntensity={0.07} roughness={0.95} metalness={0.22} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[6.5, 6.5, 0.28, 72, 1, true]} />
        <meshStandardMaterial color="#050816" emissive={color} emissiveIntensity={0.06} roughness={0.9} metalness={0.15} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function GridPanels({ color, progress }: { color: string; progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const p = smoothstep(0.05, 0.95, progress.current);
    group.current.position.x = -0.55 + p * 0.55;
    group.current.position.y = -0.25 + p * 0.25 + Math.sin(t * 0.45) * 0.02;
    group.current.rotation.y = (1 - p) * 0.35 + Math.sin(t * 0.22) * 0.08;
    group.current.scale.setScalar(0.92 + p * 0.12);
  });

  return (
    <group ref={group} position={[0, 0, -9]}>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[(i - 4) * 1.05, -0.2 + (i % 3) * 0.3, -Math.abs(i - 4) * 0.35]} rotation={[0, (i - 4) * 0.05, 0]}>
          <boxGeometry args={[0.9, 1.8 + (i % 2) * 0.4, 0.08]} />
          <meshStandardMaterial color="#040a12" emissive={color} emissiveIntensity={0.12} roughness={0.8} metalness={0.35} transparent opacity={0.75} />
        </mesh>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`m-${i}`} position={[(i - 1.5) * 2.4, 0.25, -5.5]} rotation={[0, (i - 1.5) * 0.22, 0.12]}>
          <boxGeometry args={[1.2, 4.2, 0.12]} />
          <meshStandardMaterial color="#020617" emissive={color} emissiveIntensity={0.08} roughness={0.7} metalness={0.55} transparent opacity={0.35} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, -2]}>
        <planeGeometry args={[18, 18, 1, 1]} />
        <meshStandardMaterial color="#020617" emissive={color} emissiveIntensity={0.04} roughness={1} metalness={0} transparent opacity={0.85} wireframe />
      </mesh>
    </group>
  );
}

function StageRibs({ color, progress }: { color: string; progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const p = smoothstep(0.05, 0.95, progress.current);
    group.current.position.y = -0.55 + p * 0.55 + Math.sin(t * 0.6) * 0.015;
    group.current.rotation.x = (1 - p) * 0.15;
    group.current.rotation.y = Math.sin(t * 0.18) * 0.06;
    group.current.scale.setScalar(0.9 + p * 0.18);
  });

  return (
    <group ref={group} position={[0, -0.2, -10]}>
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.08, -i * 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.8 + i * 0.2, 0.05, 12, 96]} />
          <meshStandardMaterial color="#050816" emissive={color} emissiveIntensity={0.1} roughness={0.9} metalness={0.25} transparent opacity={0.65} />
        </mesh>
      ))}
      <mesh position={[0, 0.8, -2.8]}>
        <boxGeometry args={[7.8, 4.2, 0.12]} />
        <meshStandardMaterial color="#050816" emissive={color} emissiveIntensity={0.14} roughness={0.85} metalness={0.25} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function ObserveTowers({ color, progress }: { color: string; progress: MutableRefObject<number> }) {
  const towers = useMemo(() => {
    return Array.from({ length: 26 }).map(() => {
      const x = (Math.random() * 2 - 1) * 6.2;
      const z = (Math.random() * 2 - 1) * 5.2;
      const h = 1.6 + Math.random() * 3.6;
      return { x, z, h };
    });
  }, []);

  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const p = smoothstep(0.05, 0.95, progress.current);
    group.current.position.y = -1.25 + p * 0.25;
    group.current.rotation.y = Math.sin(t * 0.12) * 0.08;
  });

  return (
    <group ref={group} position={[0, -1.0, -9]}>
      {towers.map((t, i) => {
        return (
          <mesh key={i} position={[t.x, t.h * 0.5, t.z]}>
            <boxGeometry args={[0.35, t.h, 0.35]} />
            <meshStandardMaterial color="#050816" emissive={color} emissiveIntensity={0.06} roughness={0.95} metalness={0.25} transparent opacity={0.75} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[7.5, 64]} />
        <meshStandardMaterial color="#020617" emissive={color} emissiveIntensity={0.03} roughness={1} metalness={0} transparent opacity={0.9} />
      </mesh>
      <group position={[0, 2.2, -2.2]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`hud-${i}`} position={[(i - 2.5) * 1.35, 0.25 + (i % 2) * 0.18, 0]} rotation={[0.02, (i - 2.5) * 0.08, 0]}>
            <planeGeometry args={[1.1, 0.75]} />
            <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.14} transparent opacity={0.22} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function AINetwork({ color, progress }: { color: string; progress: MutableRefObject<number> }) {
  const geo = useMemo(() => {
    const links: number[] = [];
    const nodes = Array.from({ length: 48 }).map(() => new THREE.Vector3((Math.random() * 2 - 1) * 6, (Math.random() * 2 - 1) * 2.2, (Math.random() * 2 - 1) * 5 - 9));
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const b = nodes[(i * 7) % nodes.length];
      links.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(links, 3));
    return g;
  }, []);

  const nodes = useMemo(() => {
    return Array.from({ length: 18 }).map(() => {
      return {
        x: (Math.random() * 2 - 1) * 5.5,
        y: (Math.random() * 2 - 1) * 2.0,
        z: -9 + (Math.random() * 2 - 1) * 4,
        r: 0.06 + Math.random() * 0.08
      };
    });
  }, []);

  const lineRef = useRef<THREE.LineSegments>(null);
  useFrame((state) => {
    const p = smoothstep(0.05, 0.95, progress.current);
    const line = lineRef.current;
    if (!line) return;
    const pos = line.geometry.getAttribute('position');
    const max = pos.count;
    line.geometry.setDrawRange(0, Math.max(2, Math.floor(max * p)));
    line.rotation.y = state.clock.getElapsedTime() * 0.04;
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={0.18} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[n.r, 18, 18]} />
          <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.8} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, -8.7]}>
        <torusGeometry args={[4.8, 0.06, 18, 256]} />
        <meshStandardMaterial color="#050816" emissive={color} emissiveIntensity={0.18} transparent opacity={0.25} metalness={0.45} roughness={0.55} />
      </mesh>
    </group>
  );
}

function EnvironmentLayers({ active, color, progress }: { active: Chapter['environment']; color: string; progress: MutableRefObject<number> }) {
  const templeRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const stageRef = useRef<THREE.Group>(null);
  const observeRef = useRef<THREE.Group>(null);
  const aiRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const entries: Array<[Chapter['environment'], RefObject<THREE.Group>]> = [
      ['temple', templeRef],
      ['grid', gridRef],
      ['stage', stageRef],
      ['observe', observeRef],
      ['ai', aiRef]
    ];

    entries.forEach(([key, ref]) => {
      const g = ref.current;
      if (!g) return;
      const on = key === active;
      gsap.killTweensOf(g.position);
      gsap.to(g.position, { duration: 1.4, ease: 'power3.inOut', y: on ? 0 : -0.6 });
      const alphaFrom = on ? 0 : 1;
      const alphaTo = on ? 1 : 0;
      setGroupMaterialOpacity(g, alphaFrom);
      const tweenObj = { t: alphaFrom };
      gsap.to(
        tweenObj,
        {
          duration: 1.4,
          ease: 'power3.inOut',
          t: alphaTo,
          onUpdate: function () {
            setGroupMaterialOpacity(g, tweenObj.t);
          }
        }
      );
      g.visible = on || alphaTo > 0;
    });
  }, [active]);

  return (
    <group>
      <group ref={templeRef}>
        <TempleArches color={color} progress={progress} />
      </group>
      <group ref={gridRef}>
        <GridPanels color={color} progress={progress} />
      </group>
      <group ref={stageRef}>
        <StageRibs color={color} progress={progress} />
      </group>
      <group ref={observeRef}>
        <ObserveTowers color={color} progress={progress} />
      </group>
      <group ref={aiRef} position={[0, 0, 0]}>
        <AINetwork color={color} progress={progress} />
      </group>
    </group>
  );
}

// 远处几何结构：作为未来感环境的“建筑/环形阵列”，增加空间深度与叙事氛围
function DistantStructures({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.03;
  });

  return (
    <group ref={group} position={[0, -1.2, -6]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[6, 6, 0.35, 64, 1, true]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={0.08} roughness={0.85} metalness={0.15} />
      </mesh>
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i) * 5.2, 0.75 + (i % 3) * 0.2, Math.sin(i) * 5.2]}>
          <boxGeometry args={[0.35, 2.6 + (i % 5) * 0.35, 0.35]} />
          <meshStandardMaterial color="#060a12" emissive={color} emissiveIntensity={0.06} roughness={0.9} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// 每章节可替换的“截图看板”：用于承载你上传的站点截图（位于 public/screenshots）
const holoVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const holoFragmentShader = `
  precision highp float;
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uTint;
  uniform float uAberration;
  uniform float uScan;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    float scan = sin((uv.y + uTime * 0.12) * (320.0 + uScan * 140.0)) * 0.06;
    float noise = (hash(uv * vec2(740.0, 380.0) + uTime * 0.2) - 0.5) * 0.12;
    float flicker = 0.92 + sin(uTime * 6.0) * 0.02;

    vec2 dir = normalize(vec2(0.7, 0.35));
    vec2 off = dir * uAberration;
    float r = texture2D(uMap, uv + off).r;
    float g = texture2D(uMap, uv).g;
    float b = texture2D(uMap, uv - off).b;
    vec3 col = vec3(r, g, b);

    float edge = smoothstep(0.0, 0.02, uv.x) * smoothstep(0.0, 0.02, uv.y) * smoothstep(0.0, 0.02, 1.0 - uv.x) * smoothstep(0.0, 0.02, 1.0 - uv.y);
    float vignette = smoothstep(0.95, 0.25, distance(uv, vec2(0.5)));

    col = mix(col, col * uTint, 0.45);
    col += (scan + noise) * 0.35;
    col *= flicker;

    float alpha = uOpacity * edge * vignette;
    gl_FragColor = vec4(col, alpha);
  }
`;

function ScreenshotPlane({
  url,
  tint,
  scrollProgressRef,
  screen
}: {
  url: string;
  tint: string;
  scrollProgressRef: MutableRefObject<number>;
  screen: Chapter['screen'];
}) {
  const tex = useTexture(url);
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const holoMat = useRef<THREE.ShaderMaterial>(null);
  const frameMat = useRef<THREE.MeshStandardMaterial>(null);

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
  }, [tex]);

  useEffect(() => {
    if (!group.current || !mesh.current || !mat.current) return;
    const m = mesh.current;
    const material = mat.current;
    const g = group.current;
    gsap.killTweensOf([g.position, g.rotation, g.scale, m.position, m.rotation, material]);
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tl.to(material, { duration: 0.28, opacity: 0.0 }, 0);
    tl.to(m.rotation, { duration: 0.42, y: m.rotation.y + 0.35 }, 0);
    tl.to(m.position, { duration: 0.42, y: m.position.y - 0.2 }, 0);
    tl.to(g.position, { duration: 1.0, x: screen.position.x, y: screen.position.y, z: screen.position.z }, 0.25);
    tl.to(g.rotation, { duration: 1.0, x: screen.rotation.x, y: screen.rotation.y, z: screen.rotation.z }, 0.25);
    tl.to(g.scale, { duration: 1.0, x: screen.scale, y: screen.scale, z: screen.scale }, 0.25);
    tl.to(m.rotation, { duration: 0.85, y: 0.0 }, 0.35);
    tl.to(m.position, { duration: 0.85, y: 0.0 }, 0.35);
    tl.to(material, { duration: 0.85, opacity: 0.85 }, 0.35);
    return () => {
      tl.kill();
    };
  }, [screen.position.x, screen.position.y, screen.position.z, screen.rotation.x, screen.rotation.y, screen.rotation.z, screen.scale, url]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, scrollProgressRef.current));
    const px = state.pointer.x;
    const py = state.pointer.y;
    mesh.current.position.y = Math.sin(t * 0.6) * 0.06 - p * 0.12;
    mesh.current.rotation.y = Math.sin(t * 0.25) * 0.08;
    mesh.current.rotation.x = -0.08 + Math.sin(t * 0.2) * 0.03;
    mesh.current.rotation.y += px * 0.06;
    mesh.current.rotation.x += -py * 0.04;

    if (holoMat.current) {
      holoMat.current.uniforms.uTime.value = t;
      holoMat.current.uniforms.uAberration.value = 0.0018 + (1 - p) * 0.0012;
      holoMat.current.uniforms.uScan.value = 1.0 + (1 - p) * 0.6;
      holoMat.current.uniforms.uOpacity.value = 0.55 + Math.sin(t * 1.5) * 0.05;
    }

    if (frameMat.current) {
      frameMat.current.opacity = 0.22 + Math.sin(t * 1.2) * 0.03;
    }
  });

  return (
    <group
      ref={group}
      position={[screen.position.x, screen.position.y, screen.position.z]}
      rotation={[screen.rotation.x, screen.rotation.y, screen.rotation.z]}
      scale={screen.scale}
    >
      <group ref={mesh}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.35, 1.48, 1, 1]} />
          <meshStandardMaterial
            ref={mat}
            map={tex}
            transparent
            opacity={0.85}
            metalness={0.25}
            roughness={0.55}
            emissive={new THREE.Color(tint)}
            emissiveIntensity={0.12}
          />
        </mesh>
        <mesh position={[0, 0, 0.012]} renderOrder={10}>
          <planeGeometry args={[2.35, 1.48, 1, 1]} />
          <shaderMaterial
            ref={holoMat}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexShader={holoVertexShader}
            fragmentShader={holoFragmentShader}
            uniforms={{
              uMap: { value: tex },
              uTime: { value: 0 },
              uOpacity: { value: 0.6 },
              uTint: { value: new THREE.Color(tint) },
              uAberration: { value: 0.0022 },
              uScan: { value: 1.0 }
            }}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]} renderOrder={11}>
          <planeGeometry args={[2.46, 1.58, 1, 1]} />
          <meshStandardMaterial
            ref={frameMat}
            color="#0b1220"
            transparent
            opacity={0.22}
            emissive={new THREE.Color(tint)}
            emissiveIntensity={0.18}
            roughness={0.9}
            metalness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

function SceneContent({
  chapter,
  chapterIndex,
  totalChapters
}: SceneProps) {
  const scrollProgressRef = useRef(0);
  const chapterProgressRef = useRef(0);

  useFrame(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = clamp01((window.scrollY || 0) / max);
    scrollProgressRef.current = p;
    const scaled = p * totalChapters;
    chapterProgressRef.current = clamp01(scaled - chapterIndex);
  });

  const sun = useRef<THREE.Mesh>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const coreMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const ringARef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ringBRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const fog = fogRef.current;
    if (fog) {
      const to = new THREE.Color(chapter.fog.color);
      gsap.to(fog, { duration: 1.6, ease: 'power3.inOut', near: chapter.fog.near, far: chapter.fog.far });
      gsap.to(fog.color, { duration: 1.6, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }

    const key = keyLightRef.current;
    if (key) {
      const to = new THREE.Color(chapter.lights.key.color);
      gsap.to(key, { duration: 1.6, ease: 'power3.inOut', intensity: chapter.lights.key.intensity });
      gsap.to(key.color, { duration: 1.6, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }

    const rim = rimLightRef.current;
    if (rim) {
      const to = new THREE.Color(chapter.lights.rim.color);
      gsap.to(rim, { duration: 1.6, ease: 'power3.inOut', intensity: chapter.lights.rim.intensity });
      gsap.to(rim.color, { duration: 1.6, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }

    const coreMat = coreMatRef.current;
    if (coreMat) {
      const to = new THREE.Color(chapter.color);
      gsap.to(coreMat, { duration: 1.6, ease: 'power3.inOut', emissiveIntensity: 2.4 });
      gsap.to(coreMat.emissive, { duration: 1.6, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }

    const ringA = ringARef.current;
    if (ringA) {
      const to = new THREE.Color(chapter.color);
      gsap.to(ringA.emissive, { duration: 1.4, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }
    const ringB = ringBRef.current;
    if (ringB) {
      const to = new THREE.Color(chapter.color);
      gsap.to(ringB.emissive, { duration: 1.4, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }

    const coreLight = coreLightRef.current;
    if (coreLight) {
      const to = new THREE.Color(chapter.color);
      gsap.to(coreLight.color, { duration: 1.6, ease: 'power3.inOut', r: to.r, g: to.g, b: to.b });
    }
  }, [chapter]);

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[chapter.fog.color, chapter.fog.near, chapter.fog.far]} />
      <ambientLight intensity={0.35} />
      <directionalLight ref={keyLightRef} position={[6, 6, 4]} intensity={chapter.lights.key.intensity} color={chapter.lights.key.color} />
      <directionalLight ref={rimLightRef} position={[-6, 2, -4]} intensity={chapter.lights.rim.intensity} color={chapter.lights.rim.color} />

      {/* GodRays 的光源锚点：用一个不可见的小球体作为“太阳/能量源” */}
      <mesh ref={sun} position={[0, 0, 0]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color={chapter.color} />
      </mesh>

      <EnergyCore
        color={chapter.color}
        coreMaterialRef={coreMatRef}
        ringARef={ringARef}
        ringBRef={ringBRef}
        lightRef={coreLightRef}
      />
      <Particles progressRef={scrollProgressRef} colorA="#ffffff" colorB={chapter.color} />
      <EnvironmentLayers active={chapter.environment} color={chapter.color} progress={chapterProgressRef} />
      <DistantStructures color={chapter.color} />
      <ScreenshotPlane url={chapter.screenshot} tint={chapter.color} scrollProgressRef={scrollProgressRef} screen={chapter.screen} />

      <Environment preset="night" />

      {/* 后期处理：Bloom 提升发光质感，Vignette 统一画面，GodRays 提供体积光效果 */}
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.15} luminanceThreshold={0.15} luminanceSmoothing={0.85} />
        <Vignette eskil={false} offset={0.18} darkness={1.2} />
        <GodRays sun={sun} exposure={0.28} decay={0.92} blur />
      </EffectComposer>

      {/* 相机系统：自动漂浮 + 鼠标视差 + 章节切换的平滑移动（GSAP） */}
      <CameraController
        target={chapter.camera}
        lookAt={chapter.shot.lookAt}
        fov={chapter.shot.fov}
        dolly={chapter.shot.dolly}
        chapterProgressRef={chapterProgressRef}
      />
    </>
  );
}

function Scene({ chapter, chapterIndex, totalChapters }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <SceneContent chapter={chapter} chapterIndex={chapterIndex} totalChapters={totalChapters} />
    </Canvas>
  );
}

export default memo(Scene);

import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export type CameraTarget = { x: number; y: number; z: number };
export type LookAtTarget = { x: number; y: number; z: number };

type CameraControllerProps = {
  target: CameraTarget;
  lookAt: LookAtTarget;
  fov: number;
  dolly: { x: number; y: number; z: number };
  chapterProgressRef: MutableRefObject<number>;
};

function easeInOut(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 0.5 - 0.5 * Math.cos(Math.PI * x);
}

export default function CameraController({ target, lookAt, fov, dolly, chapterProgressRef }: CameraControllerProps) {
  const { camera } = useThree();
  const base = useRef<THREE.Vector3>(new THREE.Vector3(target.x, target.y, target.z));
  const baseLookAt = useRef<THREE.Vector3>(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);
  const dollyVec = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tl.to(base.current, { duration: 0.55, z: target.z + 0.55 }, 0);
    tl.to(base.current, { duration: 1.55, x: target.x, y: target.y, z: target.z }, 0.2);
    tl.to(baseLookAt.current, { duration: 1.4, x: lookAt.x, y: lookAt.y, z: lookAt.z }, 0.2);
    tl.to(
      camera,
      {
        duration: 1.3,
        fov,
        onUpdate: () => camera.updateProjectionMatrix()
      },
      0.2
    );
    return () => {
      tl.kill();
    };
  }, [camera, fov, lookAt.x, lookAt.y, lookAt.z, target.x, target.y, target.z]);

  useEffect(() => {
    dollyVec.set(dolly.x, dolly.y, dolly.z);
  }, [dolly.x, dolly.y, dolly.z, dollyVec]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const floatY = Math.sin(t * 0.9) * 0.1;
    const floatX = Math.sin(t * 0.55) * 0.04;
    const parallaxX = state.pointer.x * 0.5;
    const parallaxY = state.pointer.y * 0.2;
    const push = easeInOut(chapterProgressRef.current);
    const dollyX = dollyVec.x * push;
    const dollyY = dollyVec.y * push;
    const dollyZ = dollyVec.z * push;

    tmp.set(
      base.current.x + parallaxX + floatX + dollyX,
      base.current.y + parallaxY + floatY + dollyY,
      base.current.z + dollyZ
    );
    camera.position.lerp(tmp, 0.08);
    tmpLook.set(baseLookAt.current.x + state.pointer.x * 0.12, baseLookAt.current.y + state.pointer.y * 0.06, baseLookAt.current.z);
    camera.lookAt(tmpLook);
  });

  return null;
}

export type Chapter = {
  id: number;
  title: string;
  year: string | null;
  description: string;
  camera: { x: number; y: number; z: number };
  shot: {
    lookAt: { x: number; y: number; z: number };
    fov: number;
    dolly: { x: number; y: number; z: number };
  };
  color: string;
  fog: { color: string; near: number; far: number };
  lights: {
    key: { color: string; intensity: number };
    rim: { color: string; intensity: number };
  };
  environment: 'temple' | 'grid' | 'stage' | 'observe' | 'ai';
  screen: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  };
  screenshot: string;
};

export const chapters: Chapter[] = [
  {
    id: 0,
    title: 'TOOM TIME',
    year: null,
    description: '从航空到前端：用工程化与 3D 交互打造可感知的体验。',
    camera: { x: 0, y: 1, z: 8 },
    shot: {
      lookAt: { x: 0, y: 0.15, z: 0 },
      fov: 50,
      dolly: { x: 0, y: 0.05, z: -0.9 }
    },
    color: '#ffffff',
    fog: { color: '#020617', near: 2.0, far: 16 },
    lights: {
      key: { color: '#ffffff', intensity: 0.85 },
      rim: { color: '#38bdf8', intensity: 0.35 }
    },
    environment: 'temple',
    screen: {
      position: { x: 0.75, y: 0.32, z: -2.55 },
      rotation: { x: -0.05, y: -0.32, z: 0 },
      scale: 1.0
    },
    screenshot: '/screenshots/chapter-0.svg'
  },
  {
    id: 1,
    title: 'EDITOR',
    year: 'H5',
    description: '云会场零代码编辑器：重构设计、通用能力沉淀与迭代效率提升。',
    camera: { x: 2, y: 1.1, z: 6.2 },
    shot: {
      lookAt: { x: 0.15, y: 0.1, z: 0 },
      fov: 48,
      dolly: { x: -0.1, y: 0.04, z: -1.1 }
    },
    color: '#ffbb88',
    fog: { color: '#050816', near: 2.2, far: 15.5 },
    lights: {
      key: { color: '#ffbb88', intensity: 0.95 },
      rim: { color: '#22c55e', intensity: 0.25 }
    },
    environment: 'grid',
    screen: {
      position: { x: 1.05, y: 0.25, z: -2.2 },
      rotation: { x: -0.06, y: -0.12, z: 0.03 },
      scale: 1.05
    },
    screenshot: '/screenshots/chapter-1.svg'
  },
  {
    id: 2,
    title: '3D STAGE',
    year: '202? ',
    description: '活动主会场：交互 3D 背景 + 粒子系统，平衡表现力与性能成本。',
    camera: { x: -2, y: 1.05, z: 7 },
    shot: {
      lookAt: { x: -0.1, y: 0.1, z: 0 },
      fov: 52,
      dolly: { x: 0.15, y: 0.03, z: -1.25 }
    },
    color: '#88ccff',
    fog: { color: '#020617', near: 2.1, far: 16.5 },
    lights: {
      key: { color: '#88ccff', intensity: 0.95 },
      rim: { color: '#fb923c', intensity: 0.25 }
    },
    environment: 'stage',
    screen: {
      position: { x: 0.65, y: 0.18, z: -2.35 },
      rotation: { x: -0.08, y: 0.18, z: -0.02 },
      scale: 1.02
    },
    screenshot: '/screenshots/chapter-2.svg'
  },
  {
    id: 3,
    title: 'OBSERVE',
    year: 'NOW',
    description: '阿里云监控：性能 / 稳定性 / 工程化，持续提升核心链路体验。',
    camera: { x: 1.2, y: 1.0, z: 6.8 },
    shot: {
      lookAt: { x: 0.05, y: 0.12, z: 0 },
      fov: 46,
      dolly: { x: -0.08, y: 0.04, z: -0.95 }
    },
    color: '#a7f3d0',
    fog: { color: '#020617', near: 2.3, far: 16.5 },
    lights: {
      key: { color: '#a7f3d0', intensity: 0.9 },
      rim: { color: '#38bdf8', intensity: 0.2 }
    },
    environment: 'observe',
    screen: {
      position: { x: 1.15, y: 0.12, z: -2.15 },
      rotation: { x: -0.05, y: -0.06, z: 0.02 },
      scale: 1.08
    },
    screenshot: '/screenshots/chapter-3.svg'
  },
  {
    id: 4,
    title: 'AI STACK',
    year: 'NEXT',
    description: '短期目标：结合 AI 的全栈开发，打通从体验到闭环交付。',
    camera: { x: -1.2, y: 1.0, z: 7.6 },
    shot: {
      lookAt: { x: -0.05, y: 0.14, z: 0 },
      fov: 54,
      dolly: { x: 0.12, y: 0.02, z: -1.35 }
    },
    color: '#ccccff',
    fog: { color: '#00000a', near: 2.7, far: 18 },
    lights: {
      key: { color: '#a78bfa', intensity: 0.9 },
      rim: { color: '#fb7185', intensity: 0.22 }
    },
    environment: 'ai',
    screen: {
      position: { x: 0.55, y: 0.24, z: -2.55 },
      rotation: { x: -0.1, y: 0.28, z: 0 },
      scale: 1.0
    },
    screenshot: '/screenshots/chapter-4.svg'
  }
];

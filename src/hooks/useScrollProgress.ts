import { useEffect, useMemo, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

export type ScrollState = {
  progress: number;
  chapterIndex: number;
  chapterProgress: number;
};

type UseScrollProgressOptions = {
  totalChapters: number;
  pageHeightVh?: number;
};

export function useScrollProgress({ totalChapters, pageHeightVh = 500 }: UseScrollProgressOptions) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useEffect(() => {
    // 将整页滚动映射到 0~1 的 progress（用于章节切换、相机/灯光/粒子联动）
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';

    const st = ScrollTrigger.create({
      start: 0,
      end: () => (window.innerHeight * pageHeightVh) / 100 - window.innerHeight,
      onUpdate: (self) => {
        setProgress(self.progress);
      }
    });

    const onResize = () => st.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      st.kill();
    };
  }, [pageHeightVh]);

  return useMemo<ScrollState>(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    const scaled = clamped * totalChapters;
    const idx = Math.min(totalChapters - 1, Math.max(0, Math.floor(scaled)));
    const within = scaled - idx;
    return { progress: clamped, chapterIndex: idx, chapterProgress: within };
  }, [progress, totalChapters]);
}

export type ChapterTransitionType = 'fade' | 'slide' | 'flip';

export type ChapterTransitionConfig = {
  durationMs: number;
  ease: string;
  type: ChapterTransitionType;
  outRatio: number;
};

export const defaultChapterTransition: ChapterTransitionConfig = {
  durationMs: 1800,
  ease: 'power3.inOut',
  type: 'fade',
  outRatio: 0.4
};

export function transitionForChapter(index: number): ChapterTransitionType {
  const types: ChapterTransitionType[] = ['fade', 'slide', 'flip'];
  return types[index % types.length];
}

export function normalizeTransitionConfig(
  cfg: Partial<ChapterTransitionConfig> & Pick<ChapterTransitionConfig, 'type'>
): ChapterTransitionConfig {
  return {
    durationMs: cfg.durationMs ?? defaultChapterTransition.durationMs,
    ease: cfg.ease ?? defaultChapterTransition.ease,
    type: cfg.type,
    outRatio: cfg.outRatio ?? defaultChapterTransition.outRatio
  };
}

export function effectiveTransitionConfig(
  cfg: ChapterTransitionConfig,
  opts: { reducedMotion: boolean; lowPower: boolean }
): ChapterTransitionConfig {
  if (opts.reducedMotion) {
    return { ...cfg, durationMs: 800, type: 'fade', ease: 'power2.inOut', outRatio: 0.5 };
  }
  if (opts.lowPower) {
    return { ...cfg, durationMs: Math.min(cfg.durationMs, 1200), type: cfg.type === 'flip' ? 'slide' : cfg.type, ease: 'power2.inOut' };
  }
  return cfg;
}


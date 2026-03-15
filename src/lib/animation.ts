import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

let registered = false;

export function ensureGsapPlugins() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  registered = true;
}

export function scrollToChapter(chapterIndex: number, totalChapters: number, duration = 1.1) {
  ensureGsapPlugins();
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const t = totalChapters <= 1 ? 0 : chapterIndex / (totalChapters - 1);
  const y = t * max;
  gsap.to(window, { duration, ease: 'power3.inOut', scrollTo: { y, autoKill: true } });
}


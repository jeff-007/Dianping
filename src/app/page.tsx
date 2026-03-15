import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Scene from '../components/Scene';
import ChapterTitle from '../components/ChapterTitle';
import Timeline from '../components/Timeline';
import { chapters } from '../data/chapters';
import { useScrollProgress } from '../hooks/useScrollProgress';

export default function ImmersiveHomePage() {
  // 单页叙事：页面高度固定为 500vh，通过滚动驱动章节变化（ScrollTrigger -> progress）
  const { chapterIndex } = useScrollProgress({ totalChapters: chapters.length, pageHeightVh: 500 });
  const chapter = useMemo(() => chapters[chapterIndex], [chapterIndex]);

  return (
    <div className="relative w-full bg-black text-white">
      {/* WebGL Canvas 固定在背景 */}
      <div className="fixed inset-0 z-0">
        <Scene chapter={chapter} chapterIndex={chapterIndex} totalChapters={chapters.length} />
      </div>

      {/* Overlay UI（标题/描述/时间轴） */}
      <div className="relative z-10 pointer-events-none">
        <header className="fixed top-0 left-0 right-0 z-10 px-6 md:px-10 py-6 flex items-center justify-between">
          <div className="font-mono text-xs tracking-[0.28em] text-white/70">
            TOOM · ARCHIVES
          </div>
          <div className="flex items-center gap-5 font-mono text-xs tracking-[0.22em] text-white/70 pointer-events-auto">
            <Link to="/legacy" className="hover:text-white">LEGACY</Link>
            <Link to="/auth/login" className="hover:text-white">LOGIN</Link>
            <Link to="/auth/register" className="hover:text-white">REGISTER</Link>
            <button type="button" className="hover:text-white">MENU</button>
          </div>
        </header>

        <main className="min-h-[500vh]">
          <section className="sticky top-0 h-screen px-6 md:px-10">
            <div className="relative w-full h-full max-w-6xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full max-w-[520px] pointer-events-auto">
                <div className="font-mono text-xs tracking-[0.28em] text-white/70">
                  {chapter.year ?? '—'}
                </div>
                <div className="mt-4 text-sm md:text-base text-white/80 leading-relaxed">
                  {chapter.description}
                </div>
                <div className="mt-6 flex flex-wrap gap-3 pointer-events-auto">
                  <a
                    href={chapter.screenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
                  >
                    SCREENSHOT
                  </a>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ChapterTitle title={chapter.title} year={null} color={chapter.color} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 bottom-28 flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border border-white/25 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center">
                    <div className="text-xs font-mono tracking-[0.22em] text-white/80">
                      {chapter.year ?? '—'}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono tracking-[0.28em] text-white/60">REVEAL</div>
              </div>
            </div>
          </section>
        </main>

        <Timeline activeIndex={chapterIndex} />
      </div>
    </div>
  );
}

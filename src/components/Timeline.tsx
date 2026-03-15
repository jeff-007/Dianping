import { chapters } from '../data/chapters';
import { scrollToChapter } from '../lib/animation';

type TimelineProps = {
  activeIndex: number;
};

export default function Timeline({ activeIndex }: TimelineProps) {
  const prev = Math.max(0, activeIndex - 1);
  const next = Math.min(chapters.length - 1, activeIndex + 1);

  return (
    <div className="fixed bottom-10 left-0 right-0 z-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={() => scrollToChapter(prev, chapters.length)}
          className="font-mono text-xs tracking-[0.22em] text-white/70 hover:text-white transition"
        >
          PREV.
        </button>

        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/35 border border-white/10 backdrop-blur-md">
          {chapters.map((c, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={c.id}
                type="button"
                aria-label={`Go to chapter ${c.title}`}
                onClick={() => scrollToChapter(i, chapters.length)}
                className="group relative"
              >
                <span
                  className={[
                    'block rounded-full transition',
                    isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-75'
                  ].join(' ')}
                  style={{
                    width: 12,
                    height: 12,
                    background: isActive ? c.color : '#ffffff',
                    transform: isActive ? 'scale(1.55)' : 'scale(1)'
                  }}
                />
                <span className="absolute left-1/2 -translate-x-1/2 -top-9 text-[10px] font-mono tracking-[0.18em] text-white/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {c.year ?? c.title}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollToChapter(next, chapters.length)}
          className="font-mono text-xs tracking-[0.22em] text-white/70 hover:text-white transition"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}

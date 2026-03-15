import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

type ChapterTitleProps = {
  title: string;
  year: string | null;
  color: string;
};

export default function ChapterTitle({ title, year, color }: ChapterTitleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chars = useMemo(() => title.split(''), [title]);

  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const letters = Array.from(root.querySelectorAll('[data-letter="1"]'));
    gsap.killTweensOf([root, letters]);

    gsap.fromTo(root, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' });
    gsap.fromTo(
      letters,
      { opacity: 0, y: 22, scale: 0.92, filter: 'blur(12px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.02 }
    );
  }, [title, year]);

  return (
    <div ref={ref} className="pointer-events-none select-none text-center">
      {year && (
        <div className="text-xs tracking-[0.35em] text-white/70 mb-2">{year}</div>
      )}
      <div
        className="font-extralight tracking-[0.14em] leading-none"
        style={{
          fontSize: '12vw',
          color,
          textShadow: `0 0 18px ${color}66, 0 0 64px ${color}22`
        }}
      >
        {chars.map((c, i) => (
          <span key={`${c}-${i}`} data-letter="1" className="inline-block">
            {c === ' ' ? '\u00A0' : c}
          </span>
        ))}
      </div>
    </div>
  );
}

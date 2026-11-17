import React, { useEffect, useRef, useState } from 'react';
import { soundtrackEngine } from '../utils/soundtrackEngine';

interface LyricCue {
  time: number; // seconds into THAMA - Drawn (231.39s total)
  text: string;
  isChorus?: boolean;
}

const LYRIC_CUES: LyricCue[] = [
  { time: 0.0, text: 'THAMA — Drawn (그려본다)' },
  // Verse 1 (00:14.5 – 00:44.0)
  { time: 14.5, text: 'I saw your face, you looked my way' },
  { time: 19.3, text: '니 사소한 표정 안에' },
  { time: 24.1, text: 'One little smile, One little touch' },
  { time: 29.0, text: 'I never knew love could be this much' },
  { time: 34.0, text: 'out of the blue, into my heart' },
  { time: 39.0, text: '잠시도 넌 떠나지 않아' },

  // Pre-Chorus 1 (00:44.0 – 01:08.0)
  { time: 44.0, text: 'you came like the morning light', isChorus: true },
  { time: 48.8, text: '꿈처럼 널 놓칠까' },
  { time: 53.5, text: '이 시간이 기적인듯' },
  { time: 58.5, text: 'now I’m falling into you', isChorus: true },
  { time: 63.5, text: 'All because of you' },

  // Chorus 1 (01:08.0 – 01:46.8)
  { time: 68.0, text: 'You’re all I need, You’re all I see', isChorus: true },
  { time: 73.5, text: '어두운 내 세상이 이젠 너로 가득해' },
  { time: 79.2, text: 'Closer to you, 멀리서도' },
  { time: 84.6, text: 'right where I belong' },
  { time: 90.0, text: 'I’ve been waiting all my life' },
  { time: 95.6, text: 'Now you’re here all along' },
  { time: 101.2, text: 'Drawn to you', isChorus: true },

  // Verse 2 (01:47.6 – 02:03.2)
  { time: 107.6, text: '달라진 매일 날이 갠 듯' },
  { time: 111.5, text: '거리까지 향이 밴 듯' },
  { time: 115.4, text: 'Your hand in mine, so easy now' },
  { time: 119.3, text: 'No need for words, we know somehow' },

  // Pre-Chorus 2 (02:03.2 – 02:27.0)
  { time: 123.2, text: 'you came like the morning light', isChorus: true },
  { time: 127.8, text: '꿈처럼 널 놓칠까' },
  { time: 132.5, text: '이 순간이 기적인 듯' },
  { time: 137.5, text: 'now I’m falling into you', isChorus: true },
  { time: 142.5, text: 'All because of you' },

  // Chorus 2 (02:27.0 – 03:00.5)
  { time: 147.0, text: 'You’re all I need, You’re all I see', isChorus: true },
  { time: 152.5, text: '어두운 내 세상이 이젠 너로 가득해' },
  { time: 158.0, text: 'Closer to you, 멀리 서도' },
  { time: 163.5, text: 'right where I belong' },
  { time: 169.0, text: 'I’ve been waiting all my life' },
  { time: 174.5, text: 'Now you’re here all along' },

  // Vocal Breakdown (03:00.5 – 03:11.0)
  { time: 180.5, text: 'Ooh...' },

  // Final Chorus (03:11.0 – 03:49.0)
  { time: 191.0, text: 'You’re all I need, You’re all I see', isChorus: true },
  { time: 196.5, text: '어두운 내 세상이 이젠 너로 가득해' },
  { time: 202.0, text: 'Closer to you, 멀리 서도' },
  { time: 207.5, text: 'right where I belong' },
  { time: 213.0, text: 'I’ve been waiting all my life' },
  { time: 218.5, text: 'Now you’re here all along' },
  { time: 223.8, text: 'Drawn to you', isChorus: true },
];

export const BackgroundLyrics: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeIndexRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const findCueIndex = (currentTime: number): number => {
      let idx = 0;
      for (let i = 0; i < LYRIC_CUES.length; i++) {
        if (currentTime >= LYRIC_CUES[i].time - 0.15) {
          idx = i;
        } else {
          break;
        }
      }
      return idx;
    };

    const tick = () => {
      const currentTime = soundtrackEngine.getCurrentTime();
      const nextIdx = findCueIndex(currentTime);

      if (nextIdx !== activeIndexRef.current) {
        activeIndexRef.current = nextIdx;
        setActiveIndex(nextIdx);
      }

      const container = scrollRef.current;
      const targetLine = lineRefs.current[nextIdx];
      if (container && targetLine) {
        // Center the active lyric line vertically inside the viewport
        const containerHeight = container.clientHeight;
        const targetTop =
          targetLine.offsetTop - containerHeight / 2 + targetLine.offsetHeight / 2;
        const clampedTarget = Math.max(0, targetTop);
        const diff = clampedTarget - container.scrollTop;

        if (Math.abs(diff) > 0.5) {
          // Smooth easing interpolation toward active lyric line
          container.scrollTop += diff * 0.085;
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden flex justify-center w-full">
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 bg-radial from-amber-950/20 via-[#030303]/50 to-[#030303] pointer-events-none z-0" />

      {/* Centered Lyrics Stream fitted to viewport, synced to real audio */}
      <div
        ref={scrollRef}
        className="w-full max-w-full h-full overflow-y-hidden no-scrollbar flex flex-col items-center justify-start z-0 relative"
      >
        <div className="w-full max-w-full flex flex-col items-center gap-10 sm:gap-14 text-center px-4 sm:px-8 py-[46vh]">
          {LYRIC_CUES.map((cue, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            const isKorean = /[가-힣]/.test(cue.text);

            return (
              <div
                key={`${cue.time}-${idx}`}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                className="w-full max-w-full flex items-center justify-center overflow-hidden"
              >
                <p
                  className={`max-w-full tracking-wide sm:tracking-wider leading-tight transition-all duration-700 ease-out ${
                    isKorean ? 'font-sans font-black' : 'font-serif italic font-extrabold'
                  } ${
                    isActive
                      ? cue.isChorus
                        ? 'text-[clamp(1.6rem,4.4vw,4.6rem)] text-amber-300/85 scale-[1.03] drop-shadow-[0_4px_28px_rgba(245,158,11,0.5)]'
                        : 'text-[clamp(1.45rem,4vw,4.2rem)] text-neutral-100/75 scale-[1.02] drop-shadow-[0_4px_24px_rgba(255,255,255,0.22)]'
                      : isPast
                        ? cue.isChorus
                          ? 'text-[clamp(1.3rem,3.4vw,3.6rem)] text-amber-300/20'
                          : 'text-[clamp(1.15rem,3vw,3.2rem)] text-neutral-400/15'
                        : cue.isChorus
                          ? 'text-[clamp(1.35rem,3.6vw,3.8rem)] text-amber-300/35'
                          : 'text-[clamp(1.2rem,3.1vw,3.3rem)] text-neutral-200/25'
                  }`}
                  style={{
                    letterSpacing: isKorean ? '0.04em' : '0.08em',
                  }}
                >
                  {cue.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soft Vignettes at Top and Bottom */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#030303] via-[#030303]/85 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

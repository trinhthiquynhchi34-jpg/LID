import React, { useEffect, useRef } from 'react';

const FULL_LYRIC_LINES: string[] = [
  "I saw your face, you looked my way",
  "니 사소한 표정 안에",
  "One little smile, One little touch",
  "I never knew love could be this much",
  "out of the blue, into my heart",
  "잠시도 넌 떠나지 않아",
  "you came like the morning light",
  "꿈처럼 널 놓칠까",
  "이 시간이 기적인듯",
  "now I’m falling into you",
  "All because of you",
  "You’re all I need, You’re all I see",
  "어두운 내 세상이 이젠 너로 가득해",
  "Closer to you, 멀리서도",
  "right where I belong",
  "I’ve been waiting all my life",
  "Now you’re here all along",
  "Drawn to you",
  "달라진 매일 날이 갠 듯",
  "거리까지 향이 밴 듯",
  "Your hand in mine, so easy now",
  "No need for words, we know somehow",
  "you came like the morning light",
  "꿈처럼 널 놓칠까",
  "이 순간이 기적인 듯",
  "now I’m falling into you",
  "All because of you",
  "You’re all I need, You’re all I see",
  "어두운 내 세상이 이젠 너로 가득해",
  "Closer to you, 멀리 서도",
  "right where I belong",
  "I’ve been waiting all my life",
  "Now you’re here all along",
  "You’re all I need, You’re all I see",
  "어두운 내 세상이 이젠 너로 가득해",
  "Closer to you, 멀리 서도",
  "right where I belong",
  "I’ve been waiting all my life",
  "Now you’re here all along",
  "Drawn to you"
];

interface BackgroundLyricsProps {
  isPlaying?: boolean;
}

export const BackgroundLyrics: React.FC<BackgroundLyricsProps> = ({ isPlaying = true }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Triple lyrics for continuous seamless loop
  const repeatedLyrics = [...FULL_LYRIC_LINES, ...FULL_LYRIC_LINES, ...FULL_LYRIC_LINES];

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const el = scrollRef.current;
      if (el && isPlaying) {
        el.scrollTop += 32 * delta;

        const oneThird = el.scrollHeight / 3;
        if (el.scrollTop >= el.scrollHeight - el.clientHeight - 40) {
          el.scrollTop = oneThird;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden flex justify-center w-full">
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 bg-radial from-amber-950/20 via-[#030303]/50 to-[#030303] pointer-events-none z-0" />

      {/* Centered Lyrics Stream fitted to viewport */}
      <div
        ref={scrollRef}
        className="w-full max-w-full h-full overflow-y-hidden no-scrollbar py-20 flex flex-col items-center justify-start z-0"
      >
        <div className="w-full max-w-full flex flex-col items-center gap-10 sm:gap-14 text-center px-4 sm:px-8">
          {repeatedLyrics.map((line, idx) => {
            const isChorus =
              line.includes('Drawn to you') ||
              line.includes('You’re all I need') ||
              line.includes('morning light') ||
              line.includes('falling into you');

            const isKorean = /[가-힣]/.test(line);

            return (
              <div
                key={idx}
                className="w-full max-w-full flex items-center justify-center overflow-hidden"
              >
                <p
                  className={`max-w-full tracking-wide sm:tracking-wider leading-none transition-all ${
                    isKorean ? 'font-sans font-black' : 'font-serif italic font-extrabold'
                  } ${
                    isChorus
                      ? 'text-[clamp(1.5rem,4.2vw,4.5rem)] text-amber-300/60 drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)]'
                      : 'text-[clamp(1.25rem,3.4vw,3.75rem)] text-neutral-100/40 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]'
                  }`}
                  style={{
                    letterSpacing: isKorean ? '0.04em' : '0.08em',
                  }}
                >
                  {line}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soft Vignettes at Top and Bottom */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#030303] via-[#030303]/85 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

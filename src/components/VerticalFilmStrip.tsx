import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilmRoll, FilmStock } from '../types/film';
import { SprocketTrackVertical } from './SprocketTrack';

interface VerticalFilmStripProps {
  roll: FilmRoll;
  isPlaying?: boolean;
  speed?: number;
  direction?: 'forward' | 'backward';
  stockFilter?: FilmStock;
  onTogglePlay?: () => void;
}

export const VerticalFilmStrip: React.FC<VerticalFilmStripProps> = ({
  roll,
  isPlaying = true,
  speed = 1,
  direction = 'forward',
  stockFilter = 'kodak-portra',
  onTogglePlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTopState, setScrollTopState] = useState(0);

  // Triple photos for continuous seamless vertical loop
  const duplicatedPhotos = [...roll.photos, ...roll.photos, ...roll.photos];

  const getFilterClass = (stock: FilmStock) => {
    switch (stock) {
      case 'kodak-portra':
        return 'filter-kodak-portra';
      case 'ilford-hp5':
        return 'filter-ilford-hp5';
      case 'fuji-velvia':
        return 'filter-fuji-velvia';
      case 'vintage-1920':
        return 'filter-vintage-1920';
      default:
        return '';
    }
  };

  // Continuous smooth scroll like before
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const container = containerRef.current;
      if (container && isPlaying && !isDragging) {
        const move = 90 * speed * delta * (direction === 'forward' ? 1 : -1);
        container.scrollTop += move;

        const maxScroll = container.scrollHeight - container.clientHeight;
        const oneThird = container.scrollHeight / 3;

        if (container.scrollTop >= maxScroll - 30) {
          container.scrollTop = oneThird;
        } else if (container.scrollTop <= 15 && direction === 'backward') {
          container.scrollTop = oneThird;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed, direction, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollTopState(containerRef.current.scrollTop);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const y = e.pageY - containerRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    containerRef.current.scrollTop = scrollTopState - walk;
  }, [isDragging, startY, scrollTopState]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* 35mm Film Reel Column - Solid opaque dark background that covers the lyrics behind the center */}
      <div className="relative w-full max-w-2xl h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] bg-[#040404] rounded-2xl border border-neutral-900 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex overflow-hidden z-10">
        {/* Left Sprocket Holes */}
        <SprocketTrackVertical side="left" currentStock={roll.stockLabel} count={34} />

        {/* Continuous Film Strip Canal */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={onTogglePlay}
          title="Nhấp để tạm dừng / tiếp tục cuộn phim"
          className="flex-1 overflow-y-scroll no-scrollbar py-10 px-4 sm:px-6 flex flex-col items-center gap-10 cursor-grab active:cursor-grabbing bg-[#040404]"
        >
          {duplicatedPhotos.map((photo, index) => {
            const originalIndex = index % roll.photos.length;
            const displayFrameNum = `${String(originalIndex + 1).padStart(2, '0')}A`;
            const effectiveStock =
              photo.filmStockFilter && photo.filmStockFilter !== 'match-roll'
                ? photo.filmStockFilter
                : stockFilter;

            return (
              <div
                key={`${photo.id}-${index}`}
                className="film-frame-item relative w-full max-w-lg shrink-0 flex flex-col items-center transition-transform hover:scale-[1.01]"
              >
                {/* 35mm Top Edge Markings */}
                <div className="w-full flex items-center justify-between px-2 mb-1.5 font-mono text-[10px] text-amber-500/80 tracking-widest">
                  <span className="font-semibold">▶ FRAME {displayFrameNum}</span>
                  <span className="text-neutral-500 tracking-wider">KODAK 35MM SAFETY FILM</span>
                  <span>ISO 400</span>
                </div>

                {/* 35mm Image Frame */}
                <div className="relative w-full aspect-[16/10] bg-neutral-950 rounded-sm border-2 border-neutral-850 overflow-hidden shadow-2xl">
                  <img
                    src={photo.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{
                      objectPosition: photo.objectPosition || 'center',
                      objectFit: photo.objectFit || 'cover',
                      transform: `scale(${photo.zoom || 1}) translate(${photo.panX || 0}%, ${photo.panY || 0}%)`,
                      transformOrigin: 'center center',
                    }}
                    className={`w-full h-full object-cover transition-transform duration-75 ${getFilterClass(
                      effectiveStock
                    )}`}
                    loading="lazy"
                  />

                  {/* Gentle Cinematic Vignette Shadow */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.65)]" />
                </div>

                {/* 35mm Bottom Edge Markings (Pure Film Metadata Only, No Titles) */}
                <div className="w-full flex items-center justify-between px-2 mt-1.5 font-mono text-[9px] text-amber-500/70 tracking-widest">
                  <span>{roll.stockLabel}</span>
                  <span className="text-neutral-600">35MM FILM</span>
                  <span>KHUNG {displayFrameNum}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sprocket Holes */}
        <SprocketTrackVertical side="right" currentStock={roll.stockLabel} count={34} />

        {/* Smooth Vignette Gradients at Top and Bottom of Reel */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#040404] via-[#040404]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#040404] via-[#040404]/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

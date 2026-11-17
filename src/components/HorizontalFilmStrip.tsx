import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilmRoll, FilmStock } from '../types/film';
import { SprocketTrackHorizontal } from './SprocketTrack';

interface HorizontalFilmStripProps {
  roll: FilmRoll;
  isPlaying?: boolean;
  speed?: number;
  direction?: 'forward' | 'backward';
  stockFilter?: FilmStock;
  onTogglePlay?: () => void;
}

export const HorizontalFilmStrip: React.FC<HorizontalFilmStripProps> = ({
  roll,
  isPlaying = true,
  speed = 1,
  direction = 'forward',
  stockFilter = 'kodak-portra',
  onTogglePlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const didDragRef = useRef(false);

  // Triple photos for continuous seamless horizontal loop
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

  // Start near the beginning of the middle loop for seamless backward/forward scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const oneThird = container.scrollWidth / 3;
      if (oneThird > 0 && container.scrollLeft < 10) {
        container.scrollLeft = oneThird;
      }
    }
  }, [roll.photos.length]);

  // Continuous smooth horizontal scroll
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const container = containerRef.current;
      if (container && isPlaying && !isDragging) {
        const move = 95 * speed * delta * (direction === 'forward' ? 1 : -1);
        container.scrollLeft += move;

        const maxScroll = container.scrollWidth - container.clientWidth;
        const oneThird = container.scrollWidth / 3;

        if (container.scrollLeft >= maxScroll - 30) {
          container.scrollLeft -= oneThird;
        } else if (container.scrollLeft <= 15 && direction === 'backward') {
          container.scrollLeft += oneThird;
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
    didDragRef.current = false;
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      if (Math.abs(x - startX) > 4) {
        didDragRef.current = true;
      }
      const walk = (x - startX) * 1.5;
      containerRef.current.scrollLeft = scrollLeftState - walk;
    },
    [isDragging, startX, scrollLeftState]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!didDragRef.current && onTogglePlay) {
      onTogglePlay();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none overflow-hidden z-10">
      {/* 35mm Horizontal Film Strip Band - Solid opaque dark backing covers the center of background lyrics */}
      <div
        className="relative w-full bg-[#040404] border-y border-neutral-900 shadow-[0_0_80px_rgba(0,0,0,0.98)] overflow-hidden py-1.5"
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Top Sprocket Track */}
        <SprocketTrackHorizontal filmStockLabel={roll.stockLabel} count={48} isBottom={false} />

        {/* Rolling Horizontal Film Canal */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          title="Nhấp để tạm dừng / tiếp tục cuộn phim"
          className="flex items-center gap-6 sm:gap-8 py-5 sm:py-6 px-8 overflow-x-scroll no-scrollbar cursor-grab active:cursor-grabbing bg-[#040404]"
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
                className="film-frame-item relative w-[290px] sm:w-[370px] md:w-[430px] lg:w-[470px] shrink-0 flex flex-col items-center transition-transform hover:scale-[1.01]"
              >
                {/* 35mm Top Edge Markings */}
                <div className="w-full flex items-center justify-between px-2 mb-1.5 font-mono text-[10px] text-amber-500/80 tracking-widest">
                  <span className="font-semibold">▶ FRAME {displayFrameNum}</span>
                  <span className="text-neutral-500 tracking-wider hidden sm:inline">
                    KODAK 35MM SAFETY FILM
                  </span>
                  <span>ISO 400</span>
                </div>

                {/* 35mm Image Frame */}
                <div className="relative w-full aspect-[16/10] bg-neutral-950 rounded-sm border-2 border-neutral-850 overflow-hidden shadow-2xl">
                  <img
                    src={photo.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    draggable={false}
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

        {/* Bottom Sprocket Track */}
        <SprocketTrackHorizontal filmStockLabel={roll.stockLabel} count={48} isBottom={true} />

        {/* Left & Right Depth Vignette Shadows */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#040404] via-[#040404]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#040404] via-[#040404]/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

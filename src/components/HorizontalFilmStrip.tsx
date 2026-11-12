import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilmRoll, FilmPhoto, FilmStock } from '../types/film';
import { SprocketTrackHorizontal } from './SprocketTrack';
import { ZoomIn, Info, Camera, MapPin, Calendar, Crop } from 'lucide-react';
import { filmAudio } from '../utils/audio';

interface HorizontalFilmStripProps {
  roll: FilmRoll;
  isPlaying: boolean;
  speed: number;
  direction: 'forward' | 'backward';
  stockFilter: FilmStock;
  onSelectPhoto: (photo: FilmPhoto) => void;
  onLaunchProjector: (photoIndex: number) => void;
  onOpenSettings?: () => void;
  onEditPhoto?: (photo: FilmPhoto) => void;
}

export const HorizontalFilmStrip: React.FC<HorizontalFilmStripProps> = ({
  roll,
  isPlaying,
  speed,
  direction,
  stockFilter,
  onSelectPhoto,
  onLaunchProjector,
  onOpenSettings,
  onEditPhoto,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const lastSoundTickRef = useRef<number>(0);

  // Duplicate photos for infinite seamless loop illusion
  const duplicatedPhotos = [...roll.photos, ...roll.photos, ...roll.photos];

  // Map stock to CSS filter class
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

  // Continuous animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const container = containerRef.current;
      if (container && isPlaying && !isDragging) {
        // Base scroll speed: 110 px per second * speed multiplier
        const move = 110 * speed * delta * (direction === 'forward' ? 1 : -1);
        container.scrollLeft += move;

        // Periodic click sound on reel advance (every ~450px)
        const currentScroll = container.scrollLeft;
        if (Math.abs(currentScroll - lastSoundTickRef.current) > 380) {
          lastSoundTickRef.current = currentScroll;
          filmAudio.playFrameClick();
        }

        // Loop seamlessly when reaching bounds
        const maxScroll = container.scrollWidth - container.clientWidth;
        const oneThird = container.scrollWidth / 3;

        if (container.scrollLeft >= maxScroll - 20) {
          container.scrollLeft = oneThird;
        } else if (container.scrollLeft <= 10 && direction === 'backward') {
          container.scrollLeft = oneThird;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed, direction, isDragging]);

  // Mouse drag scrubbing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    containerRef.current.scrollLeft = scrollLeftState - walk;
  }, [isDragging, startX, scrollLeftState]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-6 select-none">
      {/* Film Header Details & Editorial Kicker */}
      <div className="w-full max-w-6xl px-6 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">
            <span>CUỘN PHIM 35MM</span>
            <span aria-hidden="true">·</span>
            <span>{roll.era}</span>
            <span aria-hidden="true">·</span>
            <span>{roll.stockLabel}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-neutral-100 tracking-tight">
            {roll.title}
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-xl">
            {roll.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors flex items-center gap-1.5"
            >
              <Crop className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉnh Kích Thước & Vị Trí</span>
            </button>
          )}

          <div className="text-right text-xs font-mono text-neutral-400 hidden md:block">
            <div>TỔNG {roll.photos.length} KHUNG HÌNH TIÊU CHUẨN</div>
            <div className="text-amber-500/80">KÉO CHUỘT ĐỂ CUỘN TAY HOẶC BẤM CHẠY</div>
          </div>
        </div>
      </div>

      {/* Main Continuous Film Strip Container */}
      <div
        className="w-full bg-[#050505] border-y-2 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden cursor-grab active:cursor-grabbing relative py-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsDragging(false);
        }}
      >
        {/* Top Sprocket Track */}
        <SprocketTrackHorizontal filmStockLabel={roll.stockLabel} count={36} isBottom={false} />

        {/* Rolling Film Frames Strip */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex items-center gap-6 py-6 px-12 overflow-x-scroll no-scrollbar scroll-smooth"
        >
          {duplicatedPhotos.map((photo, index) => {
            const originalIndex = index % roll.photos.length;
            const displayFrameNum = `${String(originalIndex + 1).padStart(2, '0')}A`;
            const aspect = photo.aspect || roll.defaultAspect || '16:9';
            const aspectClass =
              aspect === '1:1'
                ? 'aspect-square'
                : aspect === '4:3'
                ? 'aspect-[4/3]'
                : aspect === '3:2'
                ? 'aspect-[3/2]'
                : 'aspect-[16/9]';
            const frameWidth = roll.frameWidth || 420;
            const effectiveStock =
              photo.filmStockFilter && photo.filmStockFilter !== 'match-roll'
                ? photo.filmStockFilter
                : stockFilter;

            return (
              <div
                key={`${photo.id}-${index}`}
                className="group relative shrink-0 flex flex-col items-center transition-transform duration-300 hover:scale-[1.02]"
              >
                {/* Film Frame Header Mark */}
                <div className="w-full flex items-center justify-between px-2 mb-1.5 font-mono text-[10px] text-amber-500/80 tracking-wider">
                  <span>▶ {displayFrameNum}</span>
                  <span className="hidden group-hover:inline text-[9px] text-neutral-400">
                    {photo.camera?.split(' ')[0] || '35mm'}
                  </span>
                  <span>SAFETY FILM</span>
                </div>

                {/* Frame Canvas with 35mm aperture border - Click to edit position, size, and color */}
                <div
                  style={{ width: `${frameWidth}px` }}
                  onClick={() => {
                    if (onEditPhoto) {
                      onEditPhoto(photo);
                    } else {
                      onSelectPhoto(photo);
                    }
                  }}
                  title="Bấm để chỉnh vị trí, kích thước, di ảnh và đổi màu phim"
                  className={`relative ${aspectClass} bg-neutral-900 rounded-sm border-2 border-neutral-800/90 hover:border-amber-500/80 shadow-2xl overflow-hidden cursor-pointer transition-colors`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    style={{
                      objectPosition: photo.objectPosition || 'center',
                      objectFit: photo.objectFit || 'cover',
                      transform: `scale(${photo.zoom || 1}) translate(${photo.panX || 0}%, ${photo.panY || 0}%)`,
                      transformOrigin: 'center center',
                    }}
                    className={`w-full h-full transition-transform duration-75 ${getFilterClass(
                      effectiveStock
                    )}`}
                    loading="lazy"
                  />

                  {/* Dark gradient scrim on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3.5">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 mb-1">
                      {photo.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {photo.location}
                        </span>
                      )}
                      {photo.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {photo.year}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white truncate mb-1">
                      {photo.title}
                    </h4>

                    {photo.caption && (
                      <p className="text-[11px] text-neutral-300 line-clamp-1 mb-2.5">
                        {photo.caption}
                      </p>
                    )}

                    {/* Prominent Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditPhoto) {
                          onEditPhoto(photo);
                        } else {
                          onSelectPhoto(photo);
                        }
                      }}
                      className="w-full py-1.5 px-2 text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded shadow-md shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-colors mb-2"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Chỉnh Vị Trí, Kích Thước & Màu</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchProjector(originalIndex);
                        }}
                        className="flex-1 px-2 py-1 text-[11px] font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>Máy Chiếu</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPhoto(photo);
                        }}
                        className="flex-1 px-2 py-1 text-[11px] font-medium bg-neutral-800/90 text-neutral-200 rounded hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1 border border-neutral-700"
                      >
                        <Info className="w-3 h-3" />
                        <span>EXIF</span>
                      </button>
                    </div>
                  </div>

                  {/* Vintage Frame Vignette Overlay */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
                </div>

                {/* Film Frame Footer Mark */}
                <div className="w-full flex items-center justify-between px-2 mt-1.5 font-mono text-[9px] text-amber-500/70 tracking-widest uppercase">
                  <span>{photo.filmStockFilter && photo.filmStockFilter !== 'match-roll' ? photo.filmStockFilter : roll.stockLabel.split(' ')[0]}</span>
                  <span>• • •</span>
                  <span>{displayFrameNum}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sprocket Track */}
        <SprocketTrackHorizontal filmStockLabel={roll.stockLabel} count={36} isBottom={true} />

        {/* Vintage Light Flare / Edge Fog Effect */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-neutral-950 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none z-10" />
      </div>

      {/* Interactive Helper Hint */}
      <div className="mt-3 flex items-center gap-4 text-xs font-mono text-neutral-400">
        <span>◀ Dùng chuột kéo thước phim để xem tự do ▶</span>
      </div>
    </div>
  );
};

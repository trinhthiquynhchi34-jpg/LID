import React, { useState, useEffect } from 'react';
import { FilmRoll, FilmStock, FilmPhoto } from '../types/film';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  Maximize,
  Minimize,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { filmAudio } from '../utils/audio';

interface ProjectorModeProps {
  roll: FilmRoll;
  initialPhotoIndex?: number;
  stockFilter: FilmStock;
  isFlickerOn: boolean;
  isGrainOn: boolean;
  onClose: () => void;
  onOpenDetail: (photo: FilmPhoto) => void;
}

export const ProjectorMode: React.FC<ProjectorModeProps> = ({
  roll,
  initialPhotoIndex = 0,
  stockFilter,
  isFlickerOn,
  isGrainOn,
  onClose,
  onOpenDetail,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideDuration, setSlideDuration] = useState(4); // seconds per slide
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const currentPhoto = roll.photos[currentIndex] || roll.photos[0];

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

  const handleNext = () => {
    filmAudio.playShutterSnap();
    setCurrentIndex((prev) => (prev + 1) % roll.photos.length);
  };

  const handlePrev = () => {
    filmAudio.playShutterSnap();
    setCurrentIndex((prev) => (prev - 1 + roll.photos.length) % roll.photos.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roll.photos.length]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying || countdown !== null) return;

    const timer = setInterval(() => {
      handleNext();
    }, slideDuration * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, slideDuration, roll.photos.length, countdown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Classic countdown trigger
  const runCountdownLeader = () => {
    setCountdown(3);
    filmAudio.playShutterSnap();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          filmAudio.playFrameClick();
          return null;
        }
        filmAudio.playFrameClick();
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030303] flex flex-col items-center justify-between p-4 md:p-6 overflow-hidden">
      {/* Projector Light Beam Cone Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[700px] bg-gradient-to-b from-amber-100/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between text-neutral-400 z-10">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-amber-200 text-lg">
            {roll.title}
          </span>
          <span className="text-xs font-mono text-amber-500/80 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
            KHUNG {currentIndex + 1} / {roll.photos.length}
          </span>
          <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
            {currentPhoto.frameNumber} · {currentPhoto.filmStockName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCountdownLeader}
            title="Chạy đếm ngược đầu phim (Countdown Leader)"
            className="px-2.5 py-1 text-xs font-mono bg-neutral-900 hover:bg-neutral-800 text-amber-300 rounded border border-neutral-800 transition-colors"
          >
            Đếm Ngược 3..2..1
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Projection Screen Canvas */}
      <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4">
        {/* Countdown Leader Overlay if active */}
        {countdown !== null ? (
          <div className="w-full max-w-3xl aspect-[16/9] bg-neutral-900 border-4 border-neutral-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Spinning crosshair sweep */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border-2 border-neutral-600 border-dashed animate-spin" />
              <div className="absolute w-72 h-[1px] bg-neutral-600" />
              <div className="absolute h-72 w-[1px] bg-neutral-600" />
            </div>
            <div className="text-8xl md:text-9xl font-serif font-black text-amber-400 z-10">
              {countdown}
            </div>
            <div className="font-mono text-xs tracking-widest text-neutral-400 uppercase mt-4">
              CHẾ ĐỘ ĐẦU THƯỚC PHIM CỔ ĐIỂN
            </div>
          </div>
        ) : (
          <div
            className={`relative w-full max-w-4xl aspect-[16/9] rounded-sm bg-black border-[6px] border-[#0a0a0a] shadow-[0_0_80px_rgba(245,158,11,0.08)] overflow-hidden transition-all duration-300 ${
              isFlickerOn ? 'animate-projector-flicker' : ''
            }`}
          >
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              referrerPolicy="no-referrer"
              style={{
                objectPosition: currentPhoto.objectPosition || 'center',
                objectFit: currentPhoto.objectFit || 'cover',
                transform: `scale(${currentPhoto.zoom || 1}) translate(${currentPhoto.panX || 0}%, ${currentPhoto.panY || 0}%)`,
                transformOrigin: 'center center',
              }}
              className={`w-full h-full transition-transform duration-75 ${getFilterClass(
                currentPhoto.filmStockFilter && currentPhoto.filmStockFilter !== 'match-roll'
                  ? currentPhoto.filmStockFilter
                  : stockFilter
              )}`}
            />

            {/* Simulated Vintage Lens Vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]" />

            {/* Optional Film Grain Texture Overlay */}
            {isGrainOn && (
              <div className="absolute inset-0 film-grain pointer-events-none opacity-80" />
            )}

            {/* Left/Right Click Nav Zones */}
            <button
              onClick={handlePrev}
              title="Khung trước (Phím mũi tên trái)"
              className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-start pl-4 text-white/40 hover:text-white hover:bg-black/30 transition-all opacity-0 hover:opacity-100"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={handleNext}
              title="Khung kế tiếp (Phím mũi tên phải)"
              className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end pr-4 text-white/40 hover:text-white hover:bg-black/30 transition-all opacity-0 hover:opacity-100"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>
        )}
      </div>

      {/* Frame Story & Caption Bar */}
      <div className="w-full max-w-4xl bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 backdrop-blur-md">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-xs font-mono text-amber-400 mb-1">
            <span className="font-bold">{currentPhoto.frameNumber}</span>
            {currentPhoto.location && (
              <span className="flex items-center gap-1 text-neutral-300">
                <MapPin className="w-3 h-3 text-amber-500" />
                {currentPhoto.location}
              </span>
            )}
            {currentPhoto.year && (
              <span className="flex items-center gap-1 text-neutral-300">
                <Calendar className="w-3 h-3 text-amber-500" />
                {currentPhoto.year}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-white">
            {currentPhoto.title}
          </h3>
          {currentPhoto.caption && (
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
              {currentPhoto.caption}
            </p>
          )}
        </div>

        {/* Projector Controls: Play/Pause, Slide Speed, Info */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenDetail(currentPhoto)}
            className="px-3 py-1.5 text-xs font-mono text-neutral-300 bg-neutral-900 hover:bg-neutral-850 rounded border border-neutral-800 flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>EXIF</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded p-1 text-neutral-300">
            <button
              onClick={() => setSlideDuration(2)}
              className={`px-1.5 py-0.5 rounded ${slideDuration === 2 ? 'bg-amber-500 text-neutral-950 font-bold' : ''}`}
            >
              2s
            </button>
            <button
              onClick={() => setSlideDuration(4)}
              className={`px-1.5 py-0.5 rounded ${slideDuration === 4 ? 'bg-amber-500 text-neutral-950 font-bold' : ''}`}
            >
              4s
            </button>
            <button
              onClick={() => setSlideDuration(6)}
              className={`px-1.5 py-0.5 rounded ${slideDuration === 6 ? 'bg-amber-500 text-neutral-950 font-bold' : ''}`}
            >
              6s
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                : 'bg-neutral-900 text-amber-400 border border-amber-500/40 hover:bg-neutral-800'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-amber-400" />}
            <span>{isPlaying ? 'Tạm Dừng' : 'Chiếu Tự Động'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

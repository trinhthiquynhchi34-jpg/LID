import React from 'react';
import { FilmPhoto, FilmStock } from '../types/film';
import { X, Camera, MapPin, Calendar, Film, Aperture, Layers } from 'lucide-react';

interface PhotoDetailModalProps {
  photo: FilmPhoto | null;
  stockFilter: FilmStock;
  onClose: () => void;
  onLaunchProjector: () => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  stockFilter,
  onClose,
  onLaunchProjector,
}) => {
  if (!photo) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-neutral-300 hover:text-white hover:bg-black/90 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: 35mm Frame View */}
        <div className="w-full md:w-3/5 bg-black p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-800">
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-amber-500/80 mb-2 px-1">
            <span>▶ KHUNG {photo.frameNumber}</span>
            <span>SAFETY FILM 35MM</span>
          </div>

          <div className="relative w-full aspect-[16/9] bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800 shadow-xl">
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
                photo.filmStockFilter && photo.filmStockFilter !== 'match-roll'
                  ? photo.filmStockFilter
                  : stockFilter
              )}`}
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
          </div>

          <div className="w-full flex items-center justify-between text-[9px] font-mono text-amber-500/60 mt-2 px-1">
            <span>{photo.filmStockName}</span>
            <span>DX 35MM EXP</span>
          </div>
        </div>

        {/* Right: Technical Notes & Story */}
        <div className="w-full md:w-2/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <span>{photo.frameNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{photo.filmStockName}</span>
            </div>

            <h3 className="text-xl font-serif font-bold text-neutral-100 mb-2">
              {photo.title}
            </h3>

            {photo.caption && (
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                {photo.caption}
              </p>
            )}

            {/* Technical EXIF Spec Grid */}
            <div className="space-y-3 border-t border-neutral-800/80 pt-4 text-xs font-mono">
              {photo.location && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> Địa điểm
                  </span>
                  <span className="text-neutral-200 font-sans">{photo.location}</span>
                </div>
              )}

              {photo.year && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Năm chụp
                  </span>
                  <span className="text-neutral-200">{photo.year}</span>
                </div>
              )}

              {photo.camera && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <Camera className="w-3.5 h-3.5 text-amber-500" /> Thân máy
                  </span>
                  <span className="text-neutral-200 font-sans">{photo.camera}</span>
                </div>
              )}

              {photo.lens && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <Aperture className="w-3.5 h-3.5 text-amber-500" /> Ống kính
                  </span>
                  <span className="text-neutral-200 font-sans">{photo.lens}</span>
                </div>
              )}

              {photo.iso && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <Layers className="w-3.5 h-3.5 text-amber-500" /> Độ nhạy sáng
                  </span>
                  <span className="text-amber-400">ISO {photo.iso}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onLaunchProjector();
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Film className="w-4 h-4" />
              <span>Chiếu Rạp Phim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

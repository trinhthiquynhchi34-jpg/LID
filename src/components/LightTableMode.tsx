import React, { useState } from 'react';
import { FilmRoll, FilmStock, FilmPhoto } from '../types/film';
import { Search, ZoomIn, Info, Eye } from 'lucide-react';

interface LightTableModeProps {
  roll: FilmRoll;
  stockFilter: FilmStock;
  onSelectPhoto: (photo: FilmPhoto) => void;
  onLaunchProjector: (photoIndex: number) => void;
}

export const LightTableMode: React.FC<LightTableModeProps> = ({
  roll,
  stockFilter,
  onSelectPhoto,
  onLaunchProjector,
}) => {
  const [loupeActive, setLoupeActive] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<FilmPhoto | null>(null);

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
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">
            <span>BÀN SOI ÂM BẢN 35MM (LIGHT TABLE)</span>
            <span aria-hidden="true">·</span>
            <span>{roll.stockLabel}</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-neutral-100">
            Bản In Tiếp Xúc & Soi Khung Hình (Contact Sheet)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Mô phỏng bàn ánh sáng phòng tối của nhiếp ảnh gia để phân tích từng khung hình
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoupeActive(!loupeActive)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              loupeActive
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loupeActive ? 'Kính Lúp: Đang Bật' : 'Bật Kính Lúp Soi'}</span>
          </button>
        </div>
      </div>

      {/* Illuminated Light Table Surface */}
      <div className="relative w-full bg-neutral-900/60 rounded-xl border border-neutral-700/60 p-6 md:p-8 shadow-[inset_0_0_100px_rgba(255,255,255,0.06)] backdrop-blur-sm">
        {/* Soft Backlit Diffusion Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/5 via-white/5 to-transparent rounded-xl pointer-events-none" />

        {/* Contact Sheet Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roll.photos.map((photo, index) => {
            return (
              <div
                key={photo.id}
                onMouseEnter={() => setHoveredPhoto(photo)}
                className="group relative bg-[#070707] rounded-sm p-3 border border-neutral-800 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/40"
              >
                {/* Frame Header with Sprocket Dots & Frame Num */}
                <div className="flex items-center justify-between font-mono text-[10px] text-amber-500/80 mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2.5 bg-neutral-900 border border-neutral-700 rounded-[1px]" />
                    <span className="w-2 h-2.5 bg-neutral-900 border border-neutral-700 rounded-[1px]" />
                    <span>▶ {photo.frameNumber}</span>
                  </div>
                  <span className="text-neutral-400">{photo.filmStockName}</span>
                </div>

                {/* Photo Negative/Slide Preview */}
                <div className="relative aspect-[16/9] bg-neutral-950 rounded-sm overflow-hidden border border-neutral-800">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    style={{
                      objectPosition: photo.objectPosition || 'center',
                      objectFit: photo.objectFit || 'cover',
                      transform: `scale(${(photo.zoom || 1) * (loupeActive ? 1.25 : 1)}) translate(${photo.panX || 0}%, ${photo.panY || 0}%)`,
                      transformOrigin: 'center center',
                    }}
                    className={`w-full h-full transition-transform duration-75 ${getFilterClass(
                      photo.filmStockFilter && photo.filmStockFilter !== 'match-roll'
                        ? photo.filmStockFilter
                        : stockFilter
                    )}`}
                    loading="lazy"
                  />

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => onLaunchProjector(index)}
                      className="p-2 bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400 transition-colors shadow-lg"
                      title="Chiếu trên máy chiếu"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectPhoto(photo)}
                      className="p-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-600 shadow-lg"
                      title="Xem thông số ảnh"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Frame Footer Mark */}
                <div className="mt-2.5 px-1">
                  <h4 className="text-xs font-semibold text-neutral-200 truncate group-hover:text-amber-300 transition-colors">
                    {photo.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-1">
                    <span>{photo.camera?.split(' ')[0] || '35mm'}</span>
                    <span>{photo.year || '1990'}</span>
                    <span>ISO {photo.iso || '400'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

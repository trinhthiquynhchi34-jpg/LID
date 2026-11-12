import React from 'react';
import { FilmRoll } from '../types/film';
import { Film, Play, Trash2 } from 'lucide-react';

interface RollCatalogProps {
  rolls: FilmRoll[];
  activeRollId: string;
  onSelectRoll: (rollId: string) => void;
  onOpenUpload: () => void;
  onRequestDeleteRoll?: (roll: FilmRoll) => void;
  onDeleteRoll?: (rollId: string) => void;
}

export const RollCatalog: React.FC<RollCatalogProps> = ({
  rolls,
  activeRollId,
  onSelectRoll,
  onOpenUpload,
  onRequestDeleteRoll,
  onDeleteRoll,
}) => {
  const handleDeleteClick = (e: React.MouseEvent, roll: FilmRoll) => {
    e.stopPropagation();
    if (onRequestDeleteRoll) {
      onRequestDeleteRoll(roll);
    } else if (onDeleteRoll) {
      onDeleteRoll(roll.id);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-10 border-t border-neutral-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1.5">
            <span>HỘP LƯU TRỮ CUỘN PHIM (FILM ARCHIVE)</span>
            <span aria-hidden="true">·</span>
            <span>35MM FORMAT</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-neutral-100">
            Kho Cuộn Phim Nghệ Thuật & Ký Ức
          </h3>
          <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-xl">
            Chọn các cuộn phim với chất màu giả lập từ các thương hiệu huyền thoại Kodak, Ilford, Fujifilm.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="self-start md:self-auto px-4 py-2 text-xs font-semibold text-amber-400 border border-amber-500/30 hover:border-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors whitespace-nowrap"
        >
          + Tạo Cuộn Phim Cá Nhân
        </button>
      </div>

      {/* Grid of Film Rolls (Designed like authentic 35mm film cartridges / canisters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {rolls.map((roll) => {
          const isActive = roll.id === activeRollId;
          const canDelete = rolls.length > 1;

          return (
            <div
              key={roll.id}
              onClick={() => onSelectRoll(roll.id)}
              className={`group cursor-pointer rounded-xl bg-neutral-900/80 border transition-all duration-300 p-4 flex flex-col justify-between overflow-hidden relative ${
                isActive
                  ? 'border-amber-500/80 bg-neutral-900 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                  : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
              }`}
            >
              {/* Top Film Canister Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                  {roll.stockLabel}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {roll.totalCapacity ? `${roll.photos.length}/${roll.totalCapacity} EXP` : `${roll.photos.length} KHUNG`}
                </span>
              </div>

              {/* Cover Image inside 35mm perforated mini-frame */}
              <div className="relative aspect-[16/10] bg-black rounded overflow-hidden border border-neutral-800 mb-3 group-hover:border-neutral-700 transition-colors">
                <img
                  src={roll.coverUrl || roll.photos[0]?.url}
                  alt={roll.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Sprocket track overlay on top and bottom of cover */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-black/80 flex items-center justify-around px-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1 bg-neutral-900 rounded-[1px]" />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/80 flex items-center justify-around px-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1 bg-neutral-900 rounded-[1px]" />
                  ))}
                </div>

                {isActive && (
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                    <span className="px-2 py-1 bg-black/80 text-amber-300 text-[10px] font-mono font-bold rounded border border-amber-500/40">
                      ĐANG CHIẾU
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {roll.title}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                  {roll.subtitle}
                </p>
              </div>

              {/* Bottom footer button & delete action */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">
                  {roll.era}
                </span>

                <div className="flex items-center gap-2">
                  {/* Delete button: Clear, accessible, unmistakable */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, roll)}
                    title={canDelete ? `Xóa cuộn phim "${roll.title}"` : 'Cần giữ lại ít nhất 1 cuộn phim'}
                    className={`p-1.5 rounded transition-colors ${
                      canDelete
                        ? 'text-neutral-500 hover:text-red-400 hover:bg-red-950/60'
                        : 'text-neutral-700 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    isActive ? 'text-amber-400' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}>
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isActive ? 'Đang chạy' : 'Lắp cuộn'}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

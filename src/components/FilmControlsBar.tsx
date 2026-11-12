import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  SkipBack,
  SkipForward,
  Trash2,
  Music
} from 'lucide-react';
import { FilmStock, FilmRoll } from '../types/film';

interface FilmControlsBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  direction: 'forward' | 'backward';
  onToggleDirection: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  currentStock: FilmStock;
  onSelectStock: (stock: FilmStock) => void;
  isFlickerOn: boolean;
  onToggleFlicker: () => void;
  isGrainOn: boolean;
  onToggleGrain: () => void;
  rolls: FilmRoll[];
  activeRollId: string;
  onSelectRoll: (rollId: string) => void;
  onPrevFrame?: () => void;
  onNextFrame?: () => void;
  currentFrameIndex?: number;
  totalFrames?: number;
  onDeleteActiveRoll?: (rollId: string) => void;
  onRequestDeleteActiveRoll?: (roll: FilmRoll) => void;
  onOpenSoundtrack?: () => void;
  isPlayingMusic?: boolean;
}

export const FilmControlsBar: React.FC<FilmControlsBarProps> = ({
  isPlaying,
  onTogglePlay,
  direction,
  onToggleDirection,
  speed,
  onChangeSpeed,
  currentStock,
  onSelectStock,
  isFlickerOn,
  onToggleFlicker,
  isGrainOn,
  onToggleGrain,
  rolls,
  activeRollId,
  onSelectRoll,
  onPrevFrame,
  onNextFrame,
  currentFrameIndex,
  totalFrames,
  onDeleteActiveRoll,
  onRequestDeleteActiveRoll,
  onOpenSoundtrack,
  isPlayingMusic,
}) => {
  const activeRollObj = rolls.find((r) => r.id === activeRollId);
  const stockOptions: { value: FilmStock; label: string }[] = [
    { value: 'kodak-portra', label: 'Kodak Portra 400' },
    { value: 'ilford-hp5', label: 'Ilford HP5 B&W' },
    { value: 'fuji-velvia', label: 'Fuji Velvia 50' },
    { value: 'vintage-1920', label: 'Cổ Điển 1920s' },
    { value: 'normal', label: 'Chuẩn Màu Gốc' },
  ];

  return (
    <div className="bg-neutral-950/95 border-t border-neutral-800/90 py-3 px-4 sm:px-6 backdrop-blur-lg flex flex-wrap items-center justify-between gap-4 sticky bottom-0 z-30 shadow-2xl">
      {/* Left: Film Roll Selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Cuộn Phim:</span>
        </label>
        <select
          value={activeRollId}
          onChange={(e) => onSelectRoll(e.target.value)}
          aria-label="Chọn cuộn phim để xem"
          className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 hover:bg-neutral-850 cursor-pointer transition-colors max-w-[200px] truncate"
        >
          {rolls.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title} ({r.photos.length} ảnh)
            </option>
          ))}
        </select>

        {rolls.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (activeRollObj) {
                if (onRequestDeleteActiveRoll) {
                  onRequestDeleteActiveRoll(activeRollObj);
                } else if (onDeleteActiveRoll) {
                  onDeleteActiveRoll(activeRollId);
                }
              }
            }}
            title="Xóa cuộn phim đang chọn này"
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        
        {totalFrames !== undefined && currentFrameIndex !== undefined && (
          <span className="hidden lg:inline text-xs font-mono text-neutral-400 ml-2">
            Khung {currentFrameIndex + 1}/{totalFrames}
          </span>
        )}
      </div>

      {/* Center: Main Cinema Transport Controls */}
      <div className="flex items-center gap-2 sm:gap-3 mx-auto">
        {onPrevFrame && (
          <button
            onClick={onPrevFrame}
            title="Lùi 1 khung hình"
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onTogglePlay}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
              : 'bg-neutral-900 text-amber-400 border border-amber-500/30 hover:bg-neutral-850'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-400" />}
          <span className="font-semibold">{isPlaying ? 'Tạm Dừng' : 'Chạy Cuộn'}</span>
        </button>

        {onNextFrame && (
          <button
            onClick={onNextFrame}
            title="Tiến 1 khung hình"
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        )}

        {/* Direction Switch */}
        <button
          onClick={onToggleDirection}
          title={direction === 'forward' ? 'Đổi chiều: Cuộn Lùi' : 'Đổi chiều: Cuộn Tiến'}
          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${direction === 'backward' ? 'rotate-180 text-amber-400' : ''} transition-transform`} />
          <span className="text-[11px] font-mono hidden sm:inline">
            {direction === 'forward' ? 'Tiến ▶' : '◀ Lùi'}
          </span>
        </button>

        {/* Speed Tabs */}
        <div className="flex items-center p-1 bg-neutral-900/90 rounded-lg border border-neutral-800/80">
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-1 text-[11px] font-mono rounded-md transition-colors ${
                speed === s
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Right: Soundtrack Music, Film Stock Emulation & Vintage Effects */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenSoundtrack && (
          <button
            onClick={onOpenSoundtrack}
            title="Chọn bản nhạc nền điện ảnh"
            className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
              isPlayingMusic
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isPlayingMusic ? 'text-amber-400 animate-pulse' : ''}`} />
            <span className="hidden xl:inline text-[11px]">
              {isPlayingMusic ? 'Đang Phát Nhạc' : 'Nhạc Nền'}
            </span>
          </button>
        )}

        <select
          value={currentStock}
          onChange={(e) => onSelectStock(e.target.value as FilmStock)}
          aria-label="Bộ lọc màu phim"
          className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 hover:bg-neutral-850 cursor-pointer transition-colors"
        >
          {stockOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Flicker Toggle */}
        <button
          onClick={onToggleFlicker}
          title={isFlickerOn ? 'Tắt rung chớp máy chiếu' : 'Bật rung chớp máy chiếu cổ điển'}
          className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1 ${
            isFlickerOn
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Chớp Máy Chiếu</span>
        </button>

        {/* Film Grain Toggle */}
        <button
          onClick={onToggleGrain}
          title={isGrainOn ? 'Tắt hạt phim nhựa' : 'Bật hạt phim nhựa 35mm'}
          className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1 ${
            isGrainOn
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Hạt Phim</span>
        </button>
      </div>
    </div>
  );
};

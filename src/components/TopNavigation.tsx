import React from 'react';
import { Film, Clapperboard, Columns, Grid3X3, Plus, Volume2, VolumeX, Music } from 'lucide-react';
import { DisplayMode } from '../types/film';

interface TopNavigationProps {
  currentMode: DisplayMode;
  onSelectMode: (mode: DisplayMode) => void;
  onOpenUpload: () => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenSoundtrack: () => void;
  isPlayingMusic: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentMode,
  onSelectMode,
  onOpenUpload,
  isAudioOn,
  onToggleAudio,
  onOpenSoundtrack,
  isPlayingMusic,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-40">
      {/* Zone 1: Single element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="#" className="flex items-center gap-2.5 text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Film className="w-4 h-4" />
          </div>
          <span className="font-serif tracking-wider text-xl font-bold text-neutral-100">
            CinéRoll <span className="text-amber-400 font-mono text-xs font-normal tracking-normal px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/20">35mm</span>
          </span>
        </a>
      </div>

      {/* Zone 2: Navigation Modes */}
      <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-400 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800/80">
        <button
          onClick={() => onSelectMode('strip-vertical')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            currentMode === 'strip-vertical'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <Columns className="w-4 h-4 text-amber-400" />
          <span>Thước Phim Dọc</span>
        </button>

        <button
          onClick={() => onSelectMode('strip-horizontal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
            currentMode === 'strip-horizontal'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Thước Phim Ngang</span>
        </button>

        <button
          onClick={() => onSelectMode('projector')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
            currentMode === 'projector'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span>Máy Chiếu Rạp</span>
        </button>

        <button
          onClick={() => onSelectMode('light-table')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
            currentMode === 'light-table'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Bàn Soi Âm Bản</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action area */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenSoundtrack}
          title="Chọn bản nhạc nền cho thước phim"
          className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            isPlayingMusic
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
        >
          <Music className={`w-4 h-4 ${isPlayingMusic ? 'text-amber-400 animate-pulse' : ''}`} />
          <span className="hidden sm:inline text-xs">
            {isPlayingMusic ? 'Nhạc: Đang Bật' : 'Chọn Nhạc'}
          </span>
        </button>

        <button
          onClick={onToggleAudio}
          title={isAudioOn ? 'Tắt âm thanh máy chiếu cơ học' : 'Bật âm thanh máy chiếu cơ học'}
          className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            isAudioOn
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
        >
          {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline text-xs">{isAudioOn ? 'Tiếng Máy: Bật' : 'Tiếng Máy'}</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo & Thêm Ảnh Vào Cuộn</span>
        </button>
      </div>
    </header>
  );
};

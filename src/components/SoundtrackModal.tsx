import React, { useState } from 'react';
import { PRESET_SOUNDTRACKS, SoundtrackTrack } from '../types/soundtrack';
import { soundtrackEngine } from '../utils/soundtrackEngine';
import {
  X,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Disc3,
  Check,
  Radio
} from 'lucide-react';

interface SoundtrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrackId: string;
  isPlayingMusic: boolean;
  onSelectTrack: (trackId: string, customAudioUrl?: string) => void;
  onTogglePlayMusic: () => void;
}

export const SoundtrackModal: React.FC<SoundtrackModalProps> = ({
  isOpen,
  onClose,
  activeTrackId,
  isPlayingMusic,
  onSelectTrack,
  onTogglePlayMusic,
}) => {
  const [volume, setVolume] = useState(soundtrackEngine.getVolume());
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundtrackEngine.setVolume(newVol);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomTrackName(file.name.replace(/\.[^/.]+$/, ''));
      onSelectTrack('custom', url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-neutral-100">
              Chọn Nhạc Nền Cho Thước Phim
            </h2>
            <p className="text-xs text-neutral-400">
              Giai điệu điện ảnh hòa quyện cùng chuyển động cuộn phim 35mm
            </p>
          </div>
        </div>

        {/* Master Audio Controller Bar */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3.5 my-4 flex items-center justify-between gap-4">
          <button
            onClick={onTogglePlayMusic}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              isPlayingMusic
                ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-neutral-850 text-amber-400 border border-amber-500/30 hover:bg-neutral-800'
            }`}
          >
            {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlayingMusic ? 'Tạm Dừng Nhạc' : 'Bật Nhạc Nền'}</span>
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.5)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <span className="text-[11px] font-mono text-neutral-400 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {PRESET_SOUNDTRACKS.map((track) => {
            const isSelected = activeTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`group cursor-pointer rounded-lg p-3 border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-neutral-900 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/40'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-neutral-500 group-hover:text-neutral-300'
                  }`}>
                    {isSelected && isPlayingMusic ? (
                      <Disc3 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors">
                        {track.name}
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-800">
                        {track.genre}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {track.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 group-hover:text-neutral-200">
                      Chọn
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Custom Uploaded Track if present */}
          {customAudioUrl && (
            <div
              onClick={() => onSelectTrack('custom', customAudioUrl)}
              className={`cursor-pointer rounded-lg p-3 border transition-all flex items-center justify-between gap-3 ${
                activeTrackId === 'custom'
                  ? 'bg-neutral-900 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/40'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Disc3 className={`w-4 h-4 ${activeTrackId === 'custom' && isPlayingMusic ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-100">
                    {customTrackName || 'Bản nhạc cá nhân đã tải lên'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Âm thanh tùy chỉnh tải từ máy tính của bạn
                  </p>
                </div>
              </div>

              {activeTrackId === 'custom' && (
                <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Upload Custom Audio File Option */}
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-lg cursor-pointer bg-neutral-900/40 hover:bg-neutral-900 transition-colors">
            <Upload className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-neutral-300 font-medium">
              Tải tệp nhạc riêng từ máy tính (.mp3, .wav, .m4a)
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleCustomAudioUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end mt-5 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

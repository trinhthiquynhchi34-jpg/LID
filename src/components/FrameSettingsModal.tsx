import React from 'react';
import { FilmRoll, FilmPhoto } from '../types/film';
import {
  X,
  Maximize2,
  Sliders,
  Crop,
  ArrowLeft,
  ArrowRight,
  Move,
  AlignCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Check
} from 'lucide-react';

interface FrameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roll: FilmRoll;
  onUpdateRollSettings: (settings: {
    frameWidth?: number;
    defaultAspect?: '16:9' | '3:2' | '4:3' | '1:1';
  }) => void;
  onUpdatePhotoSettings: (photoId: string, settings: {
    aspect?: '16:9' | '3:2' | '4:3' | '1:1';
    objectPosition?: 'center' | 'top' | 'bottom';
    objectFit?: 'cover' | 'contain';
  }) => void;
  onMovePhoto: (index: number, direction: 'prev' | 'next') => void;
}

export const FrameSettingsModal: React.FC<FrameSettingsModalProps> = ({
  isOpen,
  onClose,
  roll,
  onUpdateRollSettings,
  onUpdatePhotoSettings,
  onMovePhoto,
}) => {
  const [selectedPhotoId, setSelectedPhotoId] = React.useState<string>(roll.photos[0]?.id || '');
  const currentPhoto = roll.photos.find((p) => p.id === selectedPhotoId) || roll.photos[0];
  const currentPhotoIndex = roll.photos.findIndex((p) => p.id === selectedPhotoId);

  if (!isOpen) return null;

  const currentWidth = roll.frameWidth || 420;
  const currentAspect = roll.defaultAspect || '16:9';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl my-6">
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
            <Crop className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-neutral-100">
              Chỉnh Kích Thước & Vị Trí Khung Hình
            </h2>
            <p className="text-xs text-neutral-400">
              Tùy chỉnh tỷ lệ, chiều rộng và vị trí cắt ảnh trong cuộn: <span className="text-amber-400 font-semibold">{roll.title}</span>
            </p>
          </div>
        </div>

        <div className="space-y-5 my-5">
          {/* SECTION 1: GLOBAL ROLL FRAME SIZE & ASPECT RATIO */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Kích thước & Tỷ lệ khung của cuộn phim</span>
            </h3>

            {/* Frame Width Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-300">Độ rộng khung hình trên thước phim:</span>
                <span className="font-mono text-amber-400 font-bold">{currentWidth}px</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="280"
                  max="620"
                  step="20"
                  value={currentWidth}
                  onChange={(e) => onUpdateRollSettings({ frameWidth: Number(e.target.value) })}
                  className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-1">
                <span>Nhỏ gọn (280px)</span>
                <span>Tiêu chuẩn (420px)</span>
                <span>Rộng lớn IMAX (620px)</span>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div>
              <span className="block text-xs text-neutral-300 mb-1.5">Tỷ lệ khung hình điện ảnh:</span>
              <div className="grid grid-cols-4 gap-2">
                {(['16:9', '3:2', '4:3', '1:1'] as const).map((aspect) => (
                  <button
                    key={aspect}
                    type="button"
                    onClick={() => onUpdateRollSettings({ defaultAspect: aspect })}
                    className={`py-2 px-1 rounded-lg border text-center text-xs font-mono transition-colors ${
                      currentAspect === aspect
                        ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <div>{aspect}</div>
                    <div className="text-[9px] opacity-80">
                      {aspect === '16:9' ? 'Màn ảnh rộng' : aspect === '3:2' ? 'Chuẩn 35mm' : aspect === '4:3' ? 'Cổ điển' : 'Vuông 6x6'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: PHOTO POSITIONING & ORDERING */}
          {currentPhoto && (
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  <span>2. Căn chỉnh vị trí & thứ tự ảnh cụ thể</span>
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Khung {currentPhotoIndex + 1}/{roll.photos.length}
                </span>
              </div>

              {/* Photo Selector Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {roll.photos.map((photo, idx) => {
                  const isSelected = photo.id === currentPhoto.id;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedPhotoId(photo.id)}
                      className={`relative shrink-0 w-16 h-12 rounded border overflow-hidden transition-all ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-500/40 scale-105'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] font-mono text-amber-300 px-1">
                        {String(idx + 1).padStart(2, '0')}A
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Photo Live Preview Canvas */}
              <div className="bg-black p-3 rounded border border-neutral-800 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-amber-500/80 mb-2">
                  <span>▶ KHUNG {currentPhoto.frameNumber} - {currentPhoto.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMovePhoto(currentPhotoIndex, 'prev')}
                      disabled={currentPhotoIndex <= 0}
                      title="Dịch vị trí ảnh sang trái (lên trước)"
                      className="p-1 rounded bg-neutral-850 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-amber-400"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMovePhoto(currentPhotoIndex, 'next')}
                      disabled={currentPhotoIndex >= roll.photos.length - 1}
                      title="Dịch vị trí ảnh sang phải (về sau)"
                      className="p-1 rounded bg-neutral-850 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-amber-400"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className={`relative w-full max-w-sm rounded overflow-hidden border border-neutral-700 bg-neutral-950 ${
                    (currentPhoto.aspect || currentAspect) === '1:1'
                      ? 'aspect-square'
                      : (currentPhoto.aspect || currentAspect) === '4:3'
                      ? 'aspect-[4/3]'
                      : (currentPhoto.aspect || currentAspect) === '3:2'
                      ? 'aspect-[3/2]'
                      : 'aspect-[16/9]'
                  }`}
                >
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.title}
                    referrerPolicy="no-referrer"
                    style={{
                      objectPosition: currentPhoto.objectPosition || 'center',
                      objectFit: currentPhoto.objectFit || 'cover',
                    }}
                    className="w-full h-full transition-all duration-200"
                  />
                </div>
              </div>

              {/* Photo Framing Alignment Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Vertical Alignment */}
                <div>
                  <span className="block text-xs text-neutral-300 mb-1.5">
                    Vị trí trọng tâm ảnh:
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => onUpdatePhotoSettings(currentPhoto.id, { objectPosition: 'top' })}
                      className={`p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors ${
                        (currentPhoto.objectPosition || 'center') === 'top'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Trên</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdatePhotoSettings(currentPhoto.id, { objectPosition: 'center' })}
                      className={`p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors ${
                        (currentPhoto.objectPosition || 'center') === 'center'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Giữa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdatePhotoSettings(currentPhoto.id, { objectPosition: 'bottom' })}
                      className={`p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors ${
                        (currentPhoto.objectPosition || 'center') === 'bottom'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Dưới</span>
                    </button>
                  </div>
                </div>

                {/* Object Fit: Cover vs Contain */}
                <div>
                  <span className="block text-xs text-neutral-300 mb-1.5">
                    Kiểu lấp đầy khung hình:
                  </span>
                  <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => onUpdatePhotoSettings(currentPhoto.id, { objectFit: 'cover' })}
                      className={`p-1.5 rounded text-xs text-center transition-colors ${
                        (currentPhoto.objectFit || 'cover') === 'cover'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="text-[10px]">Tràn Khung (Cover)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdatePhotoSettings(currentPhoto.id, { objectFit: 'contain' })}
                      className={`p-1.5 rounded text-xs text-center transition-colors ${
                        currentPhoto.objectFit === 'contain'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="text-[10px]">Trọn Vẹn (Contain)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <span className="text-xs font-mono text-neutral-400">
            Kích thước và vị trí sẽ được áp dụng trực tiếp cho thước phim đang chạy
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Áp Dụng & Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

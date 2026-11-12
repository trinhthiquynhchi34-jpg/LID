import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FilmRoll, FilmPhoto, FilmStock } from '../types/film';
import {
  X,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crop,
  Sparkles,
  RotateCcw,
  Check,
  Palette,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target,
  Play
} from 'lucide-react';
import { filmAudio } from '../utils/audio';

interface PhotoEditorModalProps {
  photo: FilmPhoto;
  roll: FilmRoll;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPhoto: FilmPhoto) => void;
  onResumePlay?: () => void;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  photo,
  roll,
  isOpen,
  onClose,
  onSave,
  onResumePlay,
}) => {
  // Editing state initialized from photo properties
  const [panX, setPanX] = useState<number>(photo.panX || 0);
  const [panY, setPanY] = useState<number>(photo.panY || 0);
  const [zoom, setZoom] = useState<number>(photo.zoom || 1);
  const [aspect, setAspect] = useState<'16:9' | '3:2' | '4:3' | '1:1'>(
    photo.aspect || roll.defaultAspect || '16:9'
  );
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>(photo.objectFit || 'cover');
  const [filmStockFilter, setFilmStockFilter] = useState<FilmStock | 'match-roll'>(
    photo.filmStockFilter || 'match-roll'
  );

  // Drag-to-pan interactive canvas state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragInitialPan, setDragInitialPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync state if photo changes
  useEffect(() => {
    setPanX(photo.panX || 0);
    setPanY(photo.panY || 0);
    setZoom(photo.zoom || 1);
    setAspect(photo.aspect || roll.defaultAspect || '16:9');
    setObjectFit(photo.objectFit || 'cover');
    setFilmStockFilter(photo.filmStockFilter || 'match-roll');
  }, [photo, roll]);

  if (!isOpen) return null;

  // Determine current effective film stock for preview
  const effectiveStock: FilmStock =
    filmStockFilter === 'match-roll' || !filmStockFilter
      ? roll.stockType
      : (filmStockFilter as FilmStock);

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

  const aspectClass =
    aspect === '1:1'
      ? 'aspect-square'
      : aspect === '4:3'
      ? 'aspect-[4/3]'
      : aspect === '3:2'
      ? 'aspect-[3/2]'
      : 'aspect-[16/9]';

  // --- MOUSE DRAG TO PAN HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragInitialPan({ x: panX, y: panY });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPixels = e.clientX - dragStart.x;
      const deltaYPixels = e.clientY - dragStart.y;

      // Convert pixel delta to percentage of frame dimension
      const percentDeltaX = (deltaXPixels / rect.width) * 100 * (1 / zoom);
      const percentDeltaY = (deltaYPixels / rect.height) * 100 * (1 / zoom);

      const newPanX = Math.max(-50, Math.min(50, Math.round(dragInitialPan.x + percentDeltaX)));
      const newPanY = Math.max(-50, Math.min(50, Math.round(dragInitialPan.y + percentDeltaY)));

      setPanX(newPanX);
      setPanY(newPanY);
    },
    [isDragging, dragStart, dragInitialPan, zoom]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Quick Nudge Buttons (arrow keys)
  const nudge = (dx: number, dy: number) => {
    setPanX((prev) => Math.max(-50, Math.min(50, prev + dx)));
    setPanY((prev) => Math.max(-50, Math.min(50, prev + dy)));
    filmAudio.playFrameClick();
  };

  const resetPosition = () => {
    setPanX(0);
    setPanY(0);
    setZoom(1);
    filmAudio.playFrameClick();
  };

  const handleApplyColorOfRoll = () => {
    setFilmStockFilter('match-roll');
    filmAudio.playShutterSnap();
  };

  const handleSaveAndResume = () => {
    const updated: FilmPhoto = {
      ...photo,
      panX,
      panY,
      zoom,
      aspect,
      objectFit,
      filmStockFilter,
      objectPosition: 'center', // handled via panX and panY translate
    };
    onSave(updated);
    filmAudio.playShutterSnap();
    if (onResumePlay) {
      onResumePlay();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl my-4 animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-100">
                  Chỉnh Vị Trí, Kích Thước & Màu Ảnh
                </h3>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  Khung {photo.frameNumber}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Cuộn phim: <strong className="text-neutral-200">{roll.title}</strong> ({roll.stockLabel})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* MAIN INTERACTIVE STAGE: DIRECT DRAG & PAN CANVAS */}
        {/* ============================================================== */}
        <div className="flex flex-col items-center justify-center bg-black/90 rounded-xl p-3 sm:p-4 border border-neutral-800/90 relative mb-5 select-none">
          {/* Film perforation top strip */}
          <div className="w-full h-3 bg-black flex items-center justify-around px-2 border-b border-neutral-850 mb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-2.5 h-1.5 bg-neutral-850 rounded-[1px]" />
            ))}
          </div>

          {/* Draggable Frame Container */}
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative w-full max-w-xl ${aspectClass} bg-neutral-900 rounded overflow-hidden border-2 border-amber-500/60 shadow-[0_0_30px_rgba(0,0,0,0.8)] ${
              isDragging ? 'cursor-grabbing ring-2 ring-amber-400' : 'cursor-grab hover:ring-1 hover:ring-amber-500/50'
            }`}
          >
            {/* The Image undergoing Transform Zoom & Pan */}
            <img
              src={photo.url}
              alt={photo.title}
              referrerPolicy="no-referrer"
              draggable={false}
              style={{
                objectFit,
                transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                transformOrigin: 'center center',
              }}
              className={`w-full h-full pointer-events-none transition-transform duration-75 ease-out ${getFilterClass(
                effectiveStock
              )}`}
            />

            {/* Vintage Frame Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_35px_rgba(0,0,0,0.7)]" />

            {/* Drag helper hint overlay on top corner */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 backdrop-blur-sm border border-neutral-700 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3 text-amber-400" />
              <span>Kéo chuột để di chuyển ảnh</span>
            </div>

            {/* Coordinates / Zoom readout badge */}
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/85 backdrop-blur-sm border border-neutral-700 text-[10px] font-mono text-neutral-300 pointer-events-none flex items-center gap-2">
              <span>X: {panX > 0 ? `+${panX}` : panX}%</span>
              <span>·</span>
              <span>Y: {panY > 0 ? `+${panY}` : panY}%</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">{zoom.toFixed(1)}x</span>
            </div>
          </div>

          {/* Film perforation bottom strip */}
          <div className="w-full h-3 bg-black flex items-center justify-around px-2 border-t border-neutral-850 mt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-2.5 h-1.5 bg-neutral-850 rounded-[1px]" />
            ))}
          </div>

          {/* Quick D-Pad & Zoom Controls bar */}
          <div className="flex items-center justify-between w-full max-w-xl mt-3 px-1 text-xs">
            {/* Directional Nudge D-Pad */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => nudge(-5, 0)}
                title="Di chuyển sang trái"
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => nudge(0, -5)}
                title="Di chuyển lên trên"
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetPosition}
                title="Căn giữa lại (0, 0)"
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 font-bold"
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => nudge(0, 5)}
                title="Di chuyển xuống dưới"
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => nudge(5, 0)}
                title="Di chuyển sang phải"
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-400"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Zoom Slider */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1">
              <ZoomOut className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 sm:w-32 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
              />
              <ZoomIn className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-mono text-[11px] text-amber-400 font-bold w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* EDITING CONTROLS: POSITION, SIZE, AND FILM COLOR SIMULATION */}
        {/* ============================================================== */}
        <div className="space-y-4">
          {/* SECTION 1: CHỈNH MÀU ẢNH GIỐNG TÊN CUỘN PHIM */}
          <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Màu Sắc Phim (Giả Lập Màu Tên Cuộn Phim)</span>
              </label>
              <span className="text-[10px] font-mono text-neutral-400">
                Đang dùng: <strong className="text-amber-400 uppercase">{effectiveStock}</strong>
              </span>
            </div>

            {/* Quick Action Button: Áp dụng màu đúng như tên cuộn phim */}
            <button
              type="button"
              onClick={handleApplyColorOfRoll}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                filmStockFilter === 'match-roll'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-bold'
                  : 'bg-neutral-950 border-amber-500/40 text-amber-300 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Áp dụng màu chuẩn theo tên cuộn phim: "{roll.stockLabel}"</span>
              </div>
              <span className="text-[10px] opacity-80 uppercase tracking-wider font-mono">
                {filmStockFilter === 'match-roll' ? '✓ Đang kích hoạt' : 'Bấm để đổi'}
              </span>
            </button>

            {/* 5 Film Simulation Palette Options */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { id: 'kodak-portra', name: 'Kodak Portra', sub: 'Ấm áp hoài niệm', tone: 'sepia(0.12)' },
                { id: 'ilford-hp5', name: 'Ilford HP5', sub: 'Đen trắng điện ảnh', tone: 'grayscale(1)' },
                { id: 'fuji-velvia', name: 'Fuji Velvia', sub: 'Rực rỡ sắc nét', tone: 'saturate(1.4)' },
                { id: 'vintage-1920', name: 'Cổ Điển 1920s', sub: 'Phim câm Sepia', tone: 'sepia(0.65)' },
                { id: 'normal', name: 'Chuẩn Gốc', sub: 'Màu sắc tự nhiên', tone: 'none' },
              ].map((stock) => {
                const isCurrent = effectiveStock === stock.id && filmStockFilter !== 'match-roll';

                return (
                  <button
                    key={stock.id}
                    type="button"
                    onClick={() => setFilmStockFilter(stock.id as FilmStock)}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold truncate">{stock.name}</span>
                      {isCurrent && <Check className="w-3 h-3 text-amber-400" />}
                    </div>
                    <span className="text-[9px] text-neutral-500 font-mono mt-1">{stock.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: KÍCH THƯỚC & TỶ LỆ KHUNG HÌNH */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Tỷ Lệ Khung Hình (Aspect Ratio):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['16:9', '3:2', '4:3', '1:1'] as const).map((asp) => (
                  <button
                    key={asp}
                    type="button"
                    onClick={() => {
                      setAspect(asp);
                      filmAudio.playFrameClick();
                    }}
                    className={`py-1.5 px-1 rounded text-center text-xs font-mono transition-colors border ${
                      aspect === asp
                        ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {asp}
                  </button>
                ))}
              </div>
            </div>

            {/* Object Fit mode */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Kiểu Hiển Thị (Fit Mode):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setObjectFit('cover');
                    filmAudio.playFrameClick();
                  }}
                  className={`py-1.5 px-2 rounded text-center text-xs transition-colors border ${
                    objectFit === 'cover'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Tràn Khung (Cover)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setObjectFit('contain');
                    filmAudio.playFrameClick();
                  }}
                  className={`py-1.5 px-2 rounded text-center text-xs transition-colors border ${
                    objectFit === 'contain'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Trọn Vẹn (Contain)
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: THANH TRƯỢT DI VỊ TRÍ CHI TIẾT (PAN X & Y) */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Thanh trượt dịch chuyển vị trí ảnh (Pan Offset):
              </label>
              <button
                type="button"
                onClick={resetPosition}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt Lại Ban Đầu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Trục Ngang (Trái ↔ Phải)</span>
                  <span className="font-mono text-amber-400 font-bold">{panX}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={panX}
                  onChange={(e) => setPanX(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-950 rounded"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Trục Dọc (Lên ↕ Xuống)</span>
                  <span className="font-mono text-amber-400 font-bold">{panY}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={panY}
                  onChange={(e) => setPanY(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-950 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-neutral-800">
          <div className="text-[11px] font-mono text-neutral-400 hidden sm:block">
            Mẹo: Giữ chuột trên ảnh để kéo di chuyển tự do
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSaveAndResume}
              className="px-5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu & Tiếp Tục Chạy Cuộn Phim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

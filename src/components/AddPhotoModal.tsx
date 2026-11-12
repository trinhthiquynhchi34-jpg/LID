import React, { useState } from 'react';
import { FilmRoll, FilmPhoto, FilmStock } from '../types/film';
import { generatePhotosForRoll } from '../data/samplePool';
import { PRESET_SOUNDTRACKS } from '../types/soundtrack';
import { soundtrackEngine } from '../utils/soundtrackEngine';
import {
  X,
  Upload,
  Plus,
  Film,
  ArrowUp,
  ArrowDown,
  Trash2,
  ListOrdered,
  PlusCircle,
  Layers,
  Sparkles,
  Crop,
  Music,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Check
} from 'lucide-react';

interface AddPhotoModalProps {
  rolls: FilmRoll[];
  activeRollId: string;
  onClose: () => void;
  onAddPhoto: (targetRollId: string, photo: FilmPhoto, insertIndex?: number) => void;
  onCreateRoll: (
    rollName: string,
    era: string,
    stockLabel: string,
    initialPhotos?: FilmPhoto[],
    capacity?: number,
    soundtrackId?: string,
    customAudioUrl?: string
  ) => string;
  onReorderPhotos?: (targetRollId: string, updatedPhotos: FilmPhoto[]) => void;
  onDeletePhoto?: (targetRollId: string, photoId: string) => void;
  onBatchAddPhotos?: (targetRollId: string, photos: FilmPhoto[]) => void;
  onOpenSoundtrackModal?: () => void;
  onSwitchAndPlayRoll?: (rollId: string) => void;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  rolls,
  activeRollId,
  onClose,
  onAddPhoto,
  onCreateRoll,
  onReorderPhotos,
  onDeletePhoto,
  onBatchAddPhotos,
  onOpenSoundtrackModal,
  onSwitchAndPlayRoll,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'batch' | 'reorder'>('add');
  const [selectedRollId, setSelectedRollId] = useState(activeRollId);

  // --- SINGLE PHOTO ADD STATE ---
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState('2024');
  const [camera, setCamera] = useState('Leica M6');
  const [lens, setLens] = useState('35mm f/2.0');
  const [iso, setIso] = useState('400');
  const [caption, setCaption] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Step 2: Size & Position Controls (Right after choosing photo from computer)
  const [photoAspect, setPhotoAspect] = useState<'16:9' | '3:2' | '4:3' | '1:1'>('16:9');
  const [photoObjectPosition, setPhotoObjectPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [photoObjectFit, setPhotoObjectFit] = useState<'cover' | 'contain'>('cover');
  const [positionType, setPositionType] = useState<'end' | 'start' | 'custom'>('end');
  const [customPositionIndex, setCustomPositionIndex] = useState<number>(0);

  // --- BATCH & NEW ROLL GENERATION STATE ---
  const [batchTarget, setBatchTarget] = useState<'new_roll' | 'existing_roll'>('new_roll');
  const [batchCount, setBatchCount] = useState<number>(12); // Default 12 standard exposures
  const [batchRollName, setBatchRollName] = useState('Cuộn Phim Mùa Hè 2024');
  const [batchRollEra, setBatchRollEra] = useState('2024');
  const [batchRollStock, setBatchRollStock] = useState<FilmStock>('kodak-portra');
  const [batchSource, setBatchSource] = useState<'auto_samples' | 'multi_files'>('auto_samples');
  const [uploadedBatchFiles, setUploadedBatchFiles] = useState<{ name: string; dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dedicated Soundtrack Selection for New Roll
  const [selectedSoundtrackId, setSelectedSoundtrackId] = useState<string>('cinema-nostalgia');
  const [customSoundtrackUrl, setCustomSoundtrackUrl] = useState<string | undefined>(undefined);
  const [customSoundtrackName, setCustomSoundtrackName] = useState<string>('');
  const [previewPlayingTrackId, setPreviewPlayingTrackId] = useState<string | null>(null);

  // Success Screen State after creating a new roll
  const [createdRollInfo, setCreatedRollInfo] = useState<{
    rollId: string;
    title: string;
    photoCount: number;
    soundtrackName: string;
  } | null>(null);

  // In-modal confirmation for deleting individual photos (No window.confirm)
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<string | null>(null);

  const currentRollObj = rolls.find((r) => r.id === selectedRollId) || rolls[0];
  const totalPhotosInRoll = currentRollObj ? currentRollObj.photos.length : 0;

  // Single insert position index
  const getInsertIndex = (): number => {
    if (positionType === 'start') return 0;
    if (positionType === 'custom') {
      return Math.min(Math.max(0, customPositionIndex), totalPhotosInRoll);
    }
    return totalPhotosInRoll;
  };

  const calculatedFrameIndex = getInsertIndex() + 1;
  const calculatedFrameNumber = `${String(calculatedFrameIndex).padStart(2, '0')}A`;

  // Handle single file upload
  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUrl(event.target.result as string);
          setPreviewError(false);
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multi-file upload for batch creation
  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const loadedFiles: { name: string; dataUrl: string }[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedFiles.push({
            name: file.name.replace(/\.[^/.]+$/, ''),
            dataUrl: event.target.result as string,
          });
          if (loadedFiles.length === fileList.length) {
            setUploadedBatchFiles(loadedFiles);
            setBatchCount(loadedFiles.length);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Audio preview handler inside modal
  const handleTogglePreviewAudio = (trackId: string, customUrl?: string) => {
    if (previewPlayingTrackId === trackId) {
      soundtrackEngine.stop();
      setPreviewPlayingTrackId(null);
    } else {
      soundtrackEngine.selectTrack(trackId, customUrl);
      soundtrackEngine.play();
      setPreviewPlayingTrackId(trackId);
    }
  };

  // Handle upload custom MP3 for roll soundtrack
  const handleUploadCustomMp3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setCustomSoundtrackUrl(audioUrl);
      setCustomSoundtrackName(file.name.replace(/\.[^/.]+$/, ''));
      setSelectedSoundtrackId('custom');
    }
  };

  // Handle Single Photo Submit
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const insertIdx = getInsertIndex();

    const newPhoto: FilmPhoto = {
      id: `photo-${Date.now()}`,
      url: url.trim(),
      title: title.trim() || `Khung hình ${calculatedFrameNumber}`,
      location: location.trim() || undefined,
      year: year.trim() || undefined,
      filmStockName: currentRollObj?.stockLabel || 'KODAK PORTRA 400',
      camera: camera.trim() || undefined,
      lens: lens.trim() || undefined,
      iso: iso.trim() || '400',
      frameNumber: calculatedFrameNumber,
      caption: caption.trim() || undefined,
      aspect: photoAspect,
      objectPosition: photoObjectPosition,
      objectFit: photoObjectFit,
    };

    onAddPhoto(selectedRollId, newPhoto, insertIdx);
    onClose();
  };

  // Handle Batch Roll Generation / New Roll with Dedicated Soundtrack
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const stockLabelMap: Record<FilmStock, string> = {
      'kodak-portra': 'KODAK PORTRA 400',
      'ilford-hp5': 'ILFORD HP5 PLUS 400',
      'fuji-velvia': 'FUJIFILM VELVIA 50',
      'vintage-1920': 'VINTAGE 1920s SEPIA',
      'normal': 'KODAK EKTACHROME 100',
    };
    const stockLabel = stockLabelMap[batchRollStock] || 'KODAK PORTRA 400';

    let photosToUse: FilmPhoto[] = [];

    if (batchSource === 'multi_files' && uploadedBatchFiles.length > 0) {
      photosToUse = uploadedBatchFiles.map((f, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        url: f.dataUrl,
        title: f.name || `Khung hình ${idx + 1}`,
        year: batchRollEra || '2024',
        filmStockName: stockLabel,
        camera: '35mm Film Camera',
        iso: '400',
        frameNumber: `${String(idx + 1).padStart(2, '0')}A`,
        caption: `Khung số ${idx + 1} tải từ tệp ảnh cá nhân`,
        aspect: '16:9',
        objectPosition: 'center',
        objectFit: 'cover',
      }));
    } else {
      photosToUse = generatePhotosForRoll(batchCount, stockLabel);
    }

    if (batchTarget === 'new_roll') {
      const createdId = onCreateRoll(
        batchRollName.trim() || `Cuộn Phim ${batchCount} Khung`,
        batchRollEra || '2024',
        stockLabel,
        photosToUse,
        batchCount,
        selectedSoundtrackId,
        customSoundtrackUrl
      );

      // Get track label for screen
      const foundTrack = PRESET_SOUNDTRACKS.find((t) => t.id === selectedSoundtrackId);
      const soundtrackName =
        selectedSoundtrackId === 'custom'
          ? customSoundtrackName || 'Nhạc cá nhân MP3'
          : foundTrack?.name || 'Hoài Niệm Điện Ảnh 1975';

      // Show the post-creation confirmation with direct music actions!
      setCreatedRollInfo({
        rollId: createdId,
        title: batchRollName.trim() || `Cuộn Phim ${batchCount} Khung`,
        photoCount: photosToUse.length,
        soundtrackName,
      });
      setIsGenerating(false);
    } else {
      // Append to existing roll
      if (onBatchAddPhotos) {
        onBatchAddPhotos(selectedRollId, photosToUse);
      } else {
        photosToUse.forEach((p) => onAddPhoto(selectedRollId, p));
      }
      setIsGenerating(false);
      onClose();
    }
  };

  // Reorder handlers
  const handleMoveUp = (index: number) => {
    if (!currentRollObj || index <= 0 || !onReorderPhotos) return;
    const items = [...currentRollObj.photos];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    onReorderPhotos(currentRollObj.id, items);
  };

  const handleMoveDown = (index: number) => {
    if (!currentRollObj || index >= currentRollObj.photos.length - 1 || !onReorderPhotos) return;
    const items = [...currentRollObj.photos];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    onReorderPhotos(currentRollObj.id, items);
  };

  const handleDeletePhotoItem = (photoId: string) => {
    if (!currentRollObj || !onDeletePhoto) return;
    onDeletePhoto(currentRollObj.id, photoId);
    setConfirmDeletePhotoId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl p-5 sm:p-6 shadow-2xl my-6">
        {/* Close Button */}
        <button
          onClick={() => {
            soundtrackEngine.stop();
            onClose();
          }}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <Film className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-serif font-bold text-neutral-100">
            Studio Thêm Ảnh & Tạo Cuộn Phim 35mm
          </h2>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Quy trình điện ảnh: Chọn ảnh từ máy → Chỉnh kích thước & vị trí ảnh → Gán thứ tự & Chọn bản nhạc riêng
        </p>

        {/* SUCCESS SCREEN AFTER CREATING NEW ROLL */}
        {createdRollInfo ? (
          <div className="py-6 px-4 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                KHỞI TẠO CUỘN PHIM THÀNH CÔNG
              </span>
              <h3 className="text-2xl font-serif font-bold text-neutral-100 mt-1">
                "{createdRollInfo.title}"
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Đã nạp <strong className="text-amber-300">{createdRollInfo.photoCount} khung hình</strong> tuần tự
                và gán bản nhạc riêng: <span className="text-amber-400 font-medium">"{createdRollInfo.soundtrackName}"</span>
              </p>
            </div>

            <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg max-w-md mx-auto text-left flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-neutral-200">{createdRollInfo.soundtrackName}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">Bản nhạc riêng theo cuộn phim</div>
                </div>
              </div>

              {onOpenSoundtrackModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSoundtrackModal();
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors"
                >
                  Đổi Bản Nhạc Khác
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  soundtrackEngine.stop();
                  if (onSwitchAndPlayRoll) {
                    onSwitchAndPlayRoll(createdRollInfo.rollId);
                  }
                  onClose();
                }}
                className="px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Chiếu Cuộn Phim & Mở Nhạc Ngay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundtrackEngine.stop();
                  onClose();
                }}
                className="px-4 py-2.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-850 rounded-lg transition-colors border border-neutral-800"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-lg border border-neutral-800/80 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Thêm Ảnh & Chỉnh Vị Trí</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'batch'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tạo Cuộn Phim Mới & Chọn Nhạc</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reorder')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'reorder'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Sắp Xếp Khung Hình ({totalPhotosInRoll})</span>
              </button>
            </div>

            {/* ============================================================== */}
            {/* TAB 1: ADD SINGLE PHOTO WITH SIZE & POSITION STEP RIGHT AFTER */}
            {/* ============================================================== */}
            {activeTab === 'add' && (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                {/* Cuộn phim nhận ảnh */}
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Gắn vào cuộn phim:
                  </label>
                  <select
                    value={selectedRollId}
                    onChange={(e) => {
                      setSelectedRollId(e.target.value);
                      setCustomPositionIndex(0);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {rolls.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.photos.length} khung hình hiện tại)
                      </option>
                    ))}
                  </select>
                </div>

                {/* BƯỚC 1: CHỌN ẢNH TỪ MÁY TÍNH HOẶC URL */}
                <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[11px] font-bold">1</span>
                      <span>Bước 1: Chọn ảnh từ máy tính hoặc dán URL ảnh</span>
                    </label>
                    {url && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã nạp ảnh thành công
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-lg cursor-pointer bg-neutral-950/60 hover:bg-neutral-900 transition-colors p-3 text-center">
                      <Upload className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-xs text-neutral-200 font-semibold">Chọn tệp ảnh từ máy tính</span>
                      <span className="text-[10px] text-neutral-400 mt-0.5">Hỗ trợ JPG, PNG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSingleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex flex-col justify-between h-28 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800">
                      <div>
                        <span className="text-[11px] text-neutral-400 block mb-1">Hoặc dán đường dẫn trực tiếp (URL):</span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            setPreviewError(false);
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <span className="text-[9px] text-neutral-500">
                        Chấp nhận liên kết ảnh trực tiếp từ Unsplash, Imgur, v.v.
                      </span>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 2: NÚT CHỈNH KÍCH THƯỚC VÀ VỊ TRÍ ẢNH NGAY SAU KHI CHỌN ẢNH TỪ MÁY */}
                {url && (
                  <div className="bg-neutral-900/90 border border-amber-500/50 rounded-lg p-3.5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[11px] font-bold">2</span>
                        <Crop className="w-4 h-4 text-amber-400" />
                        <span>Bước 2: Chỉnh Kích Thước & Vị Trí Khung Hình</span>
                      </label>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        Khung {calculatedFrameNumber}
                      </span>
                    </div>

                    {/* LIVE 35MM FRAME PREVIEW WITH CROP / POSITION EFFECT */}
                    <div className="bg-black p-3 rounded-lg border border-neutral-800 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between text-[9px] font-mono text-amber-500/90 mb-1.5 px-1">
                        <span>▶ XEM THỬ KHUNG HÌNH THỜI GIAN THỰC</span>
                        <span>TỶ LỆ: {photoAspect} · CĂN: {photoObjectPosition.toUpperCase()}</span>
                        <span>35MM SAFETY FILM</span>
                      </div>

                      {/* Mock 35mm film aperture frame */}
                      <div className="relative w-full max-w-md bg-neutral-950 rounded border-2 border-neutral-800 overflow-hidden shadow-2xl">
                        {/* Top sprocket strip preview */}
                        <div className="h-2.5 bg-black flex items-center justify-around px-2 border-b border-neutral-850">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <span key={i} className="w-2 h-1 bg-neutral-800 rounded-[1px]" />
                          ))}
                        </div>

                        {/* Image Canvas with Selected Aspect, Object Position & Fit */}
                        <div
                          className={`w-full overflow-hidden bg-neutral-900 transition-all duration-200 ${
                            photoAspect === '1:1'
                              ? 'aspect-square'
                              : photoAspect === '4:3'
                              ? 'aspect-[4/3]'
                              : photoAspect === '3:2'
                              ? 'aspect-[3/2]'
                              : 'aspect-[16/9]'
                          }`}
                        >
                          <img
                            src={url}
                            alt="Xem thử kích thước và vị trí"
                            referrerPolicy="no-referrer"
                            style={{
                              objectPosition: photoObjectPosition,
                              objectFit: photoObjectFit,
                            }}
                            className="w-full h-full transition-all duration-200"
                            onError={() => setPreviewError(true)}
                          />

                          {previewError && (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-xs text-red-400 p-3 text-center">
                              Không thể nạp tệp ảnh này. Vui lòng kiểm tra lại.
                            </div>
                          )}
                        </div>

                        {/* Bottom sprocket strip preview */}
                        <div className="h-2.5 bg-black flex items-center justify-around px-2 border-t border-neutral-850">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <span key={i} className="w-2 h-1 bg-neutral-800 rounded-[1px]" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SIZING & POSITION CONTROLS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Tỷ Lệ Khung Hình */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                          Tỷ Lệ Khung Hình (Aspect Ratio):
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['16:9', '3:2', '4:3', '1:1'] as const).map((asp) => (
                            <button
                              key={asp}
                              type="button"
                              onClick={() => setPhotoAspect(asp)}
                              className={`py-1.5 px-1 rounded text-center text-xs font-mono transition-colors border ${
                                photoAspect === asp
                                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white'
                              }`}
                            >
                              {asp}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Căn Trọng Tâm Vị Trí Ảnh */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                          Căn Trọng Tâm Ảnh (Position):
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { value: 'top', label: 'Lấy Đỉnh' },
                            { value: 'center', label: 'Căn Giữa' },
                            { value: 'bottom', label: 'Lấy Đáy' },
                          ].map((pos) => (
                            <button
                              key={pos.value}
                              type="button"
                              onClick={() => setPhotoObjectPosition(pos.value as 'center' | 'top' | 'bottom')}
                              className={`py-1.5 px-1 rounded text-center text-xs transition-colors border ${
                                photoObjectPosition === pos.value
                                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kiểu Lấp Đầy Khung */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                          Kiểu Cắt Gọt (Fit):
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: 'cover', label: 'Tràn Khung (Cover)' },
                            { value: 'contain', label: 'Trọn Vẹn (Contain)' },
                          ].map((fit) => (
                            <button
                              key={fit.value}
                              type="button"
                              onClick={() => setPhotoObjectFit(fit.value as 'cover' | 'contain')}
                              className={`py-1.5 px-2 rounded text-center text-xs transition-colors border ${
                                photoObjectFit === fit.value
                                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white'
                              }`}
                            >
                              {fit.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Thứ Tự Xuất Hiện Trong Cuộn Phim */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                          Vị Trí Thứ Tự Trong Cuộn Phim:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPositionType('start')}
                            className={`py-1.5 px-1 rounded text-center text-xs transition-colors border ${
                              positionType === 'start'
                                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Đầu Cuộn
                          </button>
                          <button
                            type="button"
                            onClick={() => setPositionType('end')}
                            className={`py-1.5 px-1 rounded text-center text-xs transition-colors border ${
                              positionType === 'end'
                                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Cuối Cuộn
                          </button>
                          <button
                            type="button"
                            onClick={() => setPositionType('custom')}
                            className={`py-1.5 px-1 rounded text-center text-xs transition-colors border ${
                              positionType === 'custom'
                                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            Chèn Trước...
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Vị trí chèn tùy chọn nếu chọn custom */}
                    {positionType === 'custom' && totalPhotosInRoll > 0 && (
                      <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                        <span className="text-xs text-neutral-400 shrink-0">Chèn vào trước khung:</span>
                        <select
                          value={customPositionIndex}
                          onChange={(e) => setCustomPositionIndex(Number(e.target.value))}
                          className="flex-1 bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                        >
                          {currentRollObj?.photos.map((p, idx) => (
                            <option key={p.id} value={idx}>
                              Khung #{idx + 1} - "{p.title}" ({p.frameNumber})
                            </option>
                          ))}
                          <option value={totalPhotosInRoll}>
                            Khung #{totalPhotosInRoll + 1} - Cuối cùng
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* THÔNG TIN CHI TIẾT ẢNH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Tiêu đề ảnh</label>
                    <input
                      type="text"
                      placeholder="VD: Chiều Hoàng Hôn Trên Biển"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Địa điểm chụp</label>
                    <input
                      type="text"
                      placeholder="VD: Đà Lạt, Lâm Đồng"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Máy ảnh (Camera)</label>
                    <input
                      type="text"
                      placeholder="VD: Leica M6, Canon QL17, v.v."
                      value={camera}
                      onChange={(e) => setCamera(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Năm chụp / ISO</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Năm (2024)"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2 py-1.5 focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="ISO 400"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2 py-1.5 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-neutral-400 mb-1">Ghi chú câu chuyện ảnh (Caption)</label>
                    <textarea
                      rows={2}
                      placeholder="Ghi lại cảm xúc hoặc câu chuyện đằng sau bức ảnh này..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Action Submit */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <div className="text-[11px] font-mono text-neutral-400">
                    Sẽ gắn vào vị trí: <strong className="text-amber-400">Khung {calculatedFrameNumber}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!url || previewError}
                      className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Hoàn Tất & Gắn Vào Khung {calculatedFrameNumber}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ============================================================== */}
            {/* TAB 2: BATCH / CREATE NEW ROLL WITH SOUNDTRACK RIGHT AFTER */}
            {/* ============================================================== */}
            {activeTab === 'batch' && (
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                {/* Mục đích tạo */}
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    Mục đích:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBatchTarget('new_roll')}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        batchTarget === 'new_roll'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tạo Cuộn Phim Mới & Bản Nhạc Riêng</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-normal">
                        Tạo cuộn mới kèm bản nhạc điện ảnh riêng biệt
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchTarget('existing_roll')}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        batchTarget === 'existing_roll'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nạp Thêm Vào Cuộn Này</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-normal truncate">
                        Thêm vào: {currentRollObj?.title}
                      </div>
                    </button>
                  </div>

                  {batchTarget === 'new_roll' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-800">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-neutral-400 mb-1">Tên cuộn phim mới</label>
                        <input
                          type="text"
                          placeholder="VD: Chuyến Đi Mùa Hè 2024"
                          value={batchRollName}
                          onChange={(e) => setBatchRollName(e.target.value)}
                          required
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Năm</label>
                        <input
                          type="text"
                          value={batchRollEra}
                          onChange={(e) => setBatchRollEra(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <label className="block text-[11px] text-neutral-400 mb-1">Chọn cuộn phim nhận ảnh:</label>
                      <select
                        value={selectedRollId}
                        onChange={(e) => setSelectedRollId(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                      >
                        {rolls.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title} (Hiện có {r.photos.length} ảnh)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* SỐ LƯỢNG ẢNH TRONG CUỘN */}
                <div className="bg-neutral-900/80 border border-amber-500/30 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Số lượng ảnh cần tạo trong cuộn:</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                      {batchCount} Kiểu Phim (EXP)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[6, 12, 24, 36].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBatchCount(num)}
                        className={`py-2 px-1 rounded-lg border text-center transition-all ${
                          batchCount === num
                            ? 'bg-amber-500 text-neutral-950 font-black border-amber-400 shadow-md'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <div className="text-sm font-mono">{num} Ảnh</div>
                        <div className="text-[9px] opacity-80 uppercase tracking-tight">
                          {num === 12 ? 'Cuộn Ngắn' : num === 24 ? 'Phổ Biến' : num === 36 ? 'Tiêu Chuẩn' : 'Bản Thử'}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-neutral-400 whitespace-nowrap">Tùy chỉnh số lượng:</span>
                    <input
                      type="range"
                      min="2"
                      max="48"
                      value={batchCount}
                      onChange={(e) => setBatchCount(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-amber-300 w-12 text-right">
                      {batchCount} ảnh
                    </span>
                  </div>
                </div>

                {/* NGUỒN ẢNH */}
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    Nguồn hình ảnh:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBatchSource('auto_samples')}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-start gap-2 ${
                        batchSource === 'auto_samples'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div>Tự động tạo {batchCount} ảnh mẫu nghệ thuật</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                          Đầy đủ {batchCount} khung hình điện ảnh 35mm đánh số từ 01A
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchSource('multi_files')}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-start gap-2 ${
                        batchSource === 'multi_files'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div>Chọn nhiều tệp ảnh cùng lúc từ máy</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                          Chọn đồng thời nhiều ảnh từ máy tính cá nhân
                        </div>
                      </div>
                    </button>
                  </div>

                  {batchSource === 'multi_files' && (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-lg cursor-pointer bg-neutral-950/60 hover:bg-neutral-900 transition-colors p-2 text-center">
                        <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                        <span className="text-xs text-amber-400 font-semibold">
                          Bấm để chọn nhiều tệp ảnh từ máy tính (Multi-select)
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          Đã chọn: {uploadedBatchFiles.length} tệp ảnh
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMultiFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* BƯỚC CHỌN NHẠC SAU BƯỚC TẠO CUỘN PHIM MỚI */}
                {batchTarget === 'new_roll' && (
                  <div className="bg-neutral-900/90 border border-amber-500/50 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-amber-400" />
                        <span>Bước Tiếp Theo: Chọn Bản Nhạc Riêng Cho Cuộn Phim Này</span>
                      </label>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Phát riêng khi chiếu cuộn này
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400">
                      Mỗi cuộn phim được gắn một bản nhạc nền riêng biệt. Khi cuộn phim này chạy, bản nhạc tương ứng sẽ tự động phát.
                    </p>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {PRESET_SOUNDTRACKS.map((track) => {
                        const isSelected = selectedSoundtrackId === track.id;
                        const isPreviewing = previewPlayingTrackId === track.id;

                        return (
                          <div
                            key={track.id}
                            onClick={() => setSelectedSoundtrackId(track.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-amber-400 bg-amber-400 text-neutral-950' : 'border-neutral-600'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </span>
                              <div className="min-w-0 truncate">
                                <div className="font-semibold text-xs text-neutral-100 truncate">{track.name}</div>
                                <div className="text-[10px] text-neutral-400 truncate font-mono">{track.genre}</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePreviewAudio(track.id);
                              }}
                              className="px-2 py-1 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 text-[10px] flex items-center gap-1 shrink-0 ml-2"
                            >
                              {isPreviewing ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3" />}
                              <span>{isPreviewing ? 'Dừng' : 'Nghe Thử'}</span>
                            </button>
                          </div>
                        );
                      })}

                      {/* Custom uploaded MP3 track option */}
                      {customSoundtrackUrl && (
                        <div
                          onClick={() => setSelectedSoundtrackId('custom')}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            selectedSoundtrackId === 'custom'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-3.5 h-3.5 rounded-full border border-amber-400 bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <div className="min-w-0 truncate">
                              <div className="font-semibold text-xs text-neutral-100 truncate">
                                {customSoundtrackName || 'Nhạc riêng đã tải lên'}
                              </div>
                              <div className="text-[10px] text-neutral-400">Tệp MP3 cá nhân</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePreviewAudio('custom', customSoundtrackUrl);
                            }}
                            className="px-2 py-1 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-[10px] flex items-center gap-1 shrink-0 ml-2"
                          >
                            {previewPlayingTrackId === 'custom' ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3" />}
                            <span>{previewPlayingTrackId === 'custom' ? 'Dừng' : 'Nghe Thử'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Upload MP3 button */}
                    <div className="pt-2 border-t border-neutral-800">
                      <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded cursor-pointer bg-neutral-950 text-neutral-400 hover:text-neutral-200 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px]">Tải tệp MP3 riêng cho cuộn phim này</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleUploadCustomMp3}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Action Submit */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <div className="text-xs font-mono text-neutral-400">
                    Sẽ tạo: <strong className="text-amber-400">{batchCount} khung hình</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundtrackEngine.stop();
                        onClose();
                      }}
                      className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isGenerating || (batchSource === 'multi_files' && uploadedBatchFiles.length === 0)}
                      className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Film className="w-4 h-4" />
                      <span>Tạo Cuộn Phim & Gán Bản Nhạc Riêng</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ============================================================== */}
            {/* TAB 3: REORDER & IN-MODAL DELETION (NO BLOCKED WINDOW.CONFIRM) */}
            {/* ============================================================== */}
            {activeTab === 'reorder' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
                  <div>
                    <span className="text-xs text-neutral-400">Cuộn phim đang quản lý:</span>
                    <h4 className="text-sm font-bold text-amber-300">{currentRollObj?.title}</h4>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Tổng {totalPhotosInRoll} khung hình
                  </span>
                </div>

                {totalPhotosInRoll === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    Chưa có ảnh nào trong cuộn phim này. Hãy chuyển sang tab "+ Thêm Ảnh & Chỉnh Vị Trí".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {currentRollObj?.photos.map((photo, index) => {
                      const isConfirming = confirmDeletePhotoId === photo.id;

                      return (
                        <div
                          key={photo.id}
                          className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 hover:border-neutral-700 transition-colors"
                        >
                          {/* Order indicator */}
                          <div className="w-10 text-center font-mono text-xs font-bold text-amber-400 shrink-0">
                            {String(index + 1).padStart(2, '0')}A
                          </div>

                          {/* Photo Thumbnail */}
                          <div className="w-16 h-10 rounded bg-black overflow-hidden shrink-0 border border-neutral-700">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Photo Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold text-neutral-200 truncate">
                              {photo.title}
                            </h5>
                            <p className="text-[10px] text-neutral-400 font-mono truncate">
                              {photo.location || photo.camera || photo.year || '35mm format'}
                            </p>
                          </div>

                          {/* Actions or In-App Delete Confirmation */}
                          {isConfirming ? (
                            <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 p-1 rounded">
                              <span className="text-[10px] text-red-300 font-bold px-1">Xóa?</span>
                              <button
                                type="button"
                                onClick={() => handleDeletePhotoItem(photo.id)}
                                className="px-2 py-0.5 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded font-bold"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePhotoId(null)}
                                className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-300 rounded"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                title="Di chuyển lên trước"
                                className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-amber-400 transition-colors"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === totalPhotosInRoll - 1}
                                title="Di chuyển xuống sau"
                                className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-amber-400 transition-colors"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {onDeletePhoto && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePhotoId(photo.id)}
                                  title="Xóa khung hình"
                                  className="p-1.5 rounded bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Số thứ tự khung hình tự động đánh số 01A, 02A, 03A...
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
                  >
                    Hoàn Tất
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

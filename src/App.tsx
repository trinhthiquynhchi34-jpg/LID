import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_FILM_ROLLS } from './data/defaultFilms';
import { FilmPhoto, FilmRoll } from './types/film';
import { PolaroidCameraStage } from './components/PolaroidCameraStage';
import { BackgroundLyrics } from './components/BackgroundLyrics';
import { soundtrackEngine } from './utils/soundtrackEngine';
import { filmAudio } from './utils/audio';

export default function App() {
  const [activeRoll, setActiveRoll] = useState<FilmRoll>(() => ({
    ...INITIAL_FILM_ROLLS[0],
    coverUrl: '',
    customAudioUrl: undefined,
    photos: [],
  }));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState<boolean>(false);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);

  const [trackName, setTrackName] = useState<string>('');
  const [customLyricsText, setCustomLyricsText] = useState<string>('');

  // Draft values inside the Music & Lyrics modal
  const [draftAudioFile, setDraftAudioFile] = useState<File | null>(null);
  const [draftTrackName, setDraftTrackName] = useState<string>('');
  const [draftLyricsText, setDraftLyricsText] = useState<string>('');

  const customAudioObjectUrlRef = useRef<string | null>(null);
  const customBackgroundObjectUrlRef = useRef<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const lyricsFileInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);

  // Start clean with no preset music; unlock WebAudio camera sound on first user interaction
  useEffect(() => {
    soundtrackEngine.setVolume(0.7);
    soundtrackEngine.clearTrack();
    setIsMusicPlaying(false);

    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlockCameraAudio);
      window.removeEventListener('click', unlockCameraAudio);
      window.removeEventListener('keydown', unlockCameraAudio);
    };

    const unlockCameraAudio = () => {
      filmAudio.unlock();
      removeUnlockListeners();
    };

    window.addEventListener('pointerdown', unlockCameraAudio);
    window.addEventListener('click', unlockCameraAudio);
    window.addEventListener('keydown', unlockCameraAudio);

    return () => {
      removeUnlockListeners();
      if (customAudioObjectUrlRef.current) {
        URL.revokeObjectURL(customAudioObjectUrlRef.current);
        customAudioObjectUrlRef.current = null;
      }
      if (customBackgroundObjectUrlRef.current) {
        URL.revokeObjectURL(customBackgroundObjectUrlRef.current);
        customBackgroundObjectUrlRef.current = null;
      }
    };
  }, []);

  const handleToggleScroll = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleToggleMusic = useCallback(() => {
    filmAudio.unlock();
    const nowPlaying = soundtrackEngine.togglePlay();
    setIsMusicPlaying(nowPlaying);
  }, []);

  const handleAddPhotos = useCallback((newPhotos: FilmPhoto[]) => {
    if (!newPhotos.length) return;
    setActiveRoll((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  }, []);

  const handleOpenMediaModal = useCallback(() => {
    setDraftAudioFile(null);
    setDraftTrackName(trackName);
    setDraftLyricsText(customLyricsText);
    setIsMediaModalOpen(true);
  }, [trackName, customLyricsText]);

  const handleAudioFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDraftAudioFile(file);
    setDraftTrackName(file.name.replace(/\.[^/.]+$/, ''));
    e.target.value = '';
  };

  const handleLyricsFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setDraftLyricsText(content);
    } catch {
      // ignore unreadable text file
    }
    e.target.value = '';
  };

  const handleApplyMedia = () => {
    filmAudio.unlock();

    if (draftAudioFile) {
      const prevUrl = customAudioObjectUrlRef.current;
      const nextUrl = URL.createObjectURL(draftAudioFile);
      customAudioObjectUrlRef.current = nextUrl;

      soundtrackEngine.selectTrack('custom', nextUrl);
      soundtrackEngine.play();
      setIsMusicPlaying(true);
      setTrackName(draftTrackName || draftAudioFile.name);
      setActiveRoll((prev) => ({
        ...prev,
        customAudioUrl: nextUrl,
      }));

      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
    } else if (soundtrackEngine.hasActiveAudio() && !soundtrackEngine.getIsPlaying()) {
      soundtrackEngine.play();
      setIsMusicPlaying(true);
    }

    setCustomLyricsText(draftLyricsText);
    setIsMediaModalOpen(false);
  };

  const handleClearMedia = () => {
    filmAudio.unlock();

    const prevUrl = customAudioObjectUrlRef.current;
    customAudioObjectUrlRef.current = null;

    soundtrackEngine.clearTrack();
    setIsMusicPlaying(false);

    setTrackName('');
    setCustomLyricsText('');
    setDraftAudioFile(null);
    setDraftTrackName('');
    setDraftLyricsText('');
    setActiveRoll((prev) => ({
      ...prev,
      customAudioUrl: undefined,
    }));

    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }

    setIsMediaModalOpen(false);
  };

  const handleOpenBackgroundModal = useCallback(() => {
    setIsBackgroundModalOpen(true);
  }, []);

  const handleUseBlackBackground = () => {
    const prevBgUrl = customBackgroundObjectUrlRef.current;
    customBackgroundObjectUrlRef.current = null;
    setCustomBackgroundUrl(null);
    if (prevBgUrl) {
      URL.revokeObjectURL(prevBgUrl);
    }
    setIsBackgroundModalOpen(false);
  };

  const handleBackgroundFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      e.target.value = '';
      return;
    }

    const prevBgUrl = customBackgroundObjectUrlRef.current;
    const nextBgUrl = URL.createObjectURL(file);
    customBackgroundObjectUrlRef.current = nextBgUrl;
    setCustomBackgroundUrl(nextBgUrl);

    if (prevBgUrl) {
      URL.revokeObjectURL(prevBgUrl);
    }

    e.target.value = '';
    setIsBackgroundModalOpen(false);
  };

  return (
    <div className="relative w-screen h-screen bg-[#030303] text-neutral-100 flex flex-col items-center justify-center overflow-hidden selection:bg-amber-500/20">
      {/* Hidden File Input for Custom Background Image */}
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundFilePick}
        className="hidden"
      />

      {/* Custom User Background Image or Default Soft Glow */}
      {customBackgroundUrl ? (
        <img
          src={customBackgroundUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />
      ) : (
        <div className="absolute inset-0 bg-radial from-amber-950/15 via-black/40 to-[#030303] pointer-events-none" />
      )}

      {/* Audio-Synced Lyrics Backdrop Behind Camera & Photos */}
      <BackgroundLyrics
        customLyricsText={customLyricsText}
        hasCustomBackground={Boolean(customBackgroundUrl)}
      />

      {/* Main Screen: Polaroid Now Camera Snap & Enlarged Printed Photos */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <PolaroidCameraStage
          roll={activeRoll}
          isPlaying={isPlaying}
          onTogglePlay={handleToggleScroll}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          onAddPhotos={handleAddPhotos}
          onOpenMediaModal={handleOpenMediaModal}
          onOpenBackgroundModal={handleOpenBackgroundModal}
        />
      </main>

      {/* Music & Lyrics Changer Modal (Opened via Polaroid Purple Button) */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMediaModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#111114] border border-purple-500/30 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-b from-purple-400 to-purple-700 ring-2 ring-purple-300/40" />
                  <h2 className="text-base font-semibold text-neutral-100">
                    Chọn nhạc &amp; Lyrics
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  aria-label="Đóng"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Hidden File Inputs */}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFilePick}
                  className="hidden"
                />
                <input
                  ref={lyricsFileInputRef}
                  type="file"
                  accept=".lrc,.txt,text/plain"
                  onChange={handleLyricsFilePick}
                  className="hidden"
                />

                {/* Section 1: Background Music */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Nhạc nền
                  </label>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-100 truncate">
                        {draftTrackName || 'Chưa chọn file nhạc'}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {draftAudioFile
                          ? 'File nhạc mới đã sẵn sàng'
                          : trackName
                            ? 'Bài hát đang chọn'
                            : 'Chọn file âm thanh từ thiết bị của bạn'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Chọn file nhạc
                    </button>
                  </div>
                </div>

                {/* Section 2: Lyrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Lời bài hát (Lyrics)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => lyricsFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-neutral-200 transition-colors cursor-pointer"
                      >
                        Tải file .lrc / .txt
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftLyricsText('')}
                        className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-neutral-300 transition-colors cursor-pointer"
                      >
                        Xoá trắng
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={draftLyricsText}
                    onChange={(e) => setDraftLyricsText(e.target.value)}
                    rows={7}
                    placeholder={'Nhập từng dòng lời bài hát hoặc định dạng LRC:\n[00:14.50] Dòng hát đầu tiên...\n[00:19.30] Dòng hát tiếp theo...'}
                    className="w-full rounded-xl bg-black/50 border border-white/10 focus:border-purple-400/70 focus:outline-none px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 font-mono leading-relaxed resize-y"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Hỗ trợ timestamp <span className="text-purple-300 font-mono">[mm:ss.xx]</span> hoặc chữ thường (tự chia đều theo thời lượng nhạc).
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-2 px-5 py-3.5 bg-white/[0.02] border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Xoá nhạc &amp; lyrics
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyMedia}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-900/40 transition-colors cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Selection Modal (Opened by clicking empty stage space) */}
      <AnimatePresence>
        {isBackgroundModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBackgroundModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#111114] border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="text-base font-semibold text-neutral-100">
                  Chọn Background
                </h2>
                <button
                  type="button"
                  onClick={() => setIsBackgroundModalOpen(false)}
                  aria-label="Đóng"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Options */}
              <div className="p-5 space-y-3">
                {/* Option 1: Keep / Use Solid Black Background */}
                <button
                  type="button"
                  onClick={handleUseBlackBackground}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    !customBackgroundUrl
                      ? 'bg-white/[0.08] border-amber-400/70 ring-1 ring-amber-400/40'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
                  <span className="w-10 h-10 rounded-lg bg-[#030303] border border-white/25 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-100">
                      Giữ nguyên nền đen
                    </p>
                    <p className="text-xs text-neutral-400">
                      Sử dụng nền tối mặc định
                    </p>
                  </div>
                </button>

                {/* Option 2: Pick from Image File */}
                <button
                  type="button"
                  onClick={() => backgroundInputRef.current?.click()}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    customBackgroundUrl
                      ? 'bg-white/[0.08] border-amber-400/70 ring-1 ring-amber-400/40'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                    {customBackgroundUrl ? (
                      <img
                        src={customBackgroundUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-100">
                      Chọn từ file ảnh
                    </p>
                    <p className="text-xs text-neutral-400">
                      Tải ảnh từ thiết bị làm hình nền
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



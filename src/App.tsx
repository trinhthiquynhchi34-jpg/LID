import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_FILM_ROLLS } from './data/defaultFilms';
import { FilmPhoto, FilmRoll } from './types/film';
import { PolaroidCameraStage } from './components/PolaroidCameraStage';
import { BackgroundLyrics, DEFAULT_LYRIC_CUES } from './components/BackgroundLyrics';
import { soundtrackEngine } from './utils/soundtrackEngine';
import { filmAudio } from './utils/audio';

const DEFAULT_TRACK_NAME = 'THAMA — Drawn (그려본다)';

function formatDefaultLyricsText(): string {
  return DEFAULT_LYRIC_CUES.map((cue) => {
    const mins = Math.floor(cue.time / 60);
    const secs = (cue.time % 60).toFixed(2).padStart(5, '0');
    return `[${String(mins).padStart(2, '0')}:${secs}] ${cue.text}`;
  }).join('\n');
}

export default function App() {
  const [activeRoll, setActiveRoll] = useState<FilmRoll>(() => INITIAL_FILM_ROLLS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);

  const [trackName, setTrackName] = useState<string>(DEFAULT_TRACK_NAME);
  const [customLyricsText, setCustomLyricsText] = useState<string | null>(null);

  // Draft values inside the Music & Lyrics modal
  const [draftAudioFile, setDraftAudioFile] = useState<File | null>(null);
  const [draftTrackName, setDraftTrackName] = useState<string>(DEFAULT_TRACK_NAME);
  const [draftLyricsText, setDraftLyricsText] = useState<string>(() => formatDefaultLyricsText());

  const userToggledMusicRef = useRef<boolean>(false);
  const customAudioObjectUrlRef = useRef<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const lyricsFileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize and auto-unlock background music + film camera audio on mount
  useEffect(() => {
    soundtrackEngine.setVolume(0.7);
    soundtrackEngine.selectTrack('thama-drawn', activeRoll.customAudioUrl);
    soundtrackEngine.play();
    setIsMusicPlaying(soundtrackEngine.getIsPlaying());

    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    const unlockAudio = () => {
      filmAudio.unlock();
      if (userToggledMusicRef.current) {
        removeUnlockListeners();
        return;
      }
      if (!soundtrackEngine.getIsPlaying()) {
        soundtrackEngine.play();
      }
      if (soundtrackEngine.getIsPlaying()) {
        setIsMusicPlaying(true);
        removeUnlockListeners();
      }
    };

    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      removeUnlockListeners();
      if (customAudioObjectUrlRef.current) {
        URL.revokeObjectURL(customAudioObjectUrlRef.current);
        customAudioObjectUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleScroll = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleToggleMusic = useCallback(() => {
    filmAudio.unlock();
    userToggledMusicRef.current = true;
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
    setDraftLyricsText(
      customLyricsText !== null ? customLyricsText : formatDefaultLyricsText()
    );
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
    userToggledMusicRef.current = true;

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
    } else if (!soundtrackEngine.getIsPlaying()) {
      soundtrackEngine.play();
      setIsMusicPlaying(true);
    }

    const trimmedLyrics = draftLyricsText.trim();
    const defaultFormatted = formatDefaultLyricsText().trim();
    if (!trimmedLyrics) {
      setCustomLyricsText('');
    } else if (trimmedLyrics === defaultFormatted && !draftAudioFile && trackName === DEFAULT_TRACK_NAME) {
      setCustomLyricsText(null);
    } else {
      setCustomLyricsText(draftLyricsText);
    }

    setIsMediaModalOpen(false);
  };

  const handleResetDefaultMedia = () => {
    filmAudio.unlock();
    userToggledMusicRef.current = true;

    const prevUrl = customAudioObjectUrlRef.current;
    customAudioObjectUrlRef.current = null;

    soundtrackEngine.selectTrack('thama-drawn');
    soundtrackEngine.play();
    setIsMusicPlaying(true);

    setTrackName(DEFAULT_TRACK_NAME);
    setCustomLyricsText(null);
    setDraftAudioFile(null);
    setDraftTrackName(DEFAULT_TRACK_NAME);
    setDraftLyricsText(formatDefaultLyricsText());
    setActiveRoll((prev) => ({
      ...prev,
      customAudioUrl: undefined,
    }));

    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }

    setIsMediaModalOpen(false);
  };

  return (
    <div className="relative w-screen h-screen bg-[#030303] text-neutral-100 flex flex-col items-center justify-center overflow-hidden selection:bg-amber-500/20">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-radial from-amber-950/15 via-black/40 to-[#030303] pointer-events-none" />

      {/* Audio-Synced Lyrics Backdrop Behind Camera & Photos */}
      <BackgroundLyrics customLyricsText={customLyricsText} />

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
                    Thay nhạc &amp; Lyrics
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
                        {draftTrackName}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {draftAudioFile ? 'File nhạc mới đã sẵn sàng' : 'Bài hát đang phát'}
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
                  onClick={handleResetDefaultMedia}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Mặc định (THAMA)
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
    </div>
  );
}


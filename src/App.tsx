import React, { useState, useEffect } from 'react';
import { INITIAL_FILM_ROLLS } from './data/defaultFilms';
import { FilmRoll } from './types/film';
import { VerticalFilmStrip } from './components/VerticalFilmStrip';
import { BackgroundLyrics } from './components/BackgroundLyrics';
import { soundtrackEngine } from './utils/soundtrackEngine';
import { Play, Pause, Volume2, VolumeX, Music, Disc3 } from 'lucide-react';

export default function App() {
  const activeRoll: FilmRoll = INITIAL_FILM_ROLLS[0];
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.65);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Initialize and play music
  useEffect(() => {
    soundtrackEngine.setVolume(volume);
    soundtrackEngine.selectTrack('thama-drawn', activeRoll.customAudioUrl);

    // Attempt autoplay
    try {
      soundtrackEngine.play();
      setIsPlayingMusic(true);
    } catch {
      // Browser autoplay restriction
    }

    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      if (!soundtrackEngine.getIsPlaying()) {
        soundtrackEngine.play();
        setIsPlayingMusic(true);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [activeRoll]);

  const handleTogglePlayMusic = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isNowPlaying = soundtrackEngine.togglePlay();
    setIsPlayingMusic(isNowPlaying);
  };

  const handleToggleScroll = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    soundtrackEngine.setVolume(val);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (volume > 0) {
      soundtrackEngine.setVolume(0);
      setVolume(0);
    } else {
      soundtrackEngine.setVolume(0.65);
      setVolume(0.65);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#030303] text-neutral-100 flex flex-col items-center justify-center overflow-hidden selection:bg-amber-500/20">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-radial from-amber-950/15 via-black/40 to-[#030303] pointer-events-none" />

      {/* Atmospheric Lyrics Backdrop Behind Slideshow */}
      <BackgroundLyrics isPlaying={isPlaying} />

      {/* Main Screen: Pure 35mm Vertical Slideshow */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center p-3 sm:p-5">
        <VerticalFilmStrip
          roll={activeRoll}
          isPlaying={isPlaying}
          speed={0.9}
          direction="forward"
          stockFilter="kodak-portra"
          onTogglePlay={handleToggleScroll}
        />
      </main>

      {/* Floating Bottom Cinema Music Bar */}
      <footer className="fixed bottom-4 sm:bottom-6 z-30 flex items-center gap-3 px-4 py-2.5 rounded-full bg-neutral-950/90 border border-neutral-800 shadow-2xl backdrop-blur-md">
        {/* Play / Pause Music Button */}
        <button
          type="button"
          onClick={handleTogglePlayMusic}
          title={isPlayingMusic ? 'Tạm dừng nhạc' : 'Phát nhạc'}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
            isPlayingMusic
              ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
              : 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
          }`}
        >
          {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Track Title with Soundwave/Disc Animation */}
        <div className="flex items-center gap-2.5 pr-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
            {isPlayingMusic ? (
              <Disc3 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Music className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-100 whitespace-nowrap">
              THAMA - Drawn (그려본다)
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono -mt-0.5">
              OST Part 3 · Ký Ức 35mm
            </span>
          </div>
        </div>

        {/* Volume Controller */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-800">
          <button
            type="button"
            onClick={handleToggleMute}
            className="text-neutral-400 hover:text-amber-400 transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg"
          />
        </div>
      </footer>

      {/* Gentle First Interaction Hint if Autoplay Blocked */}
      {!hasUserInteracted && !isPlayingMusic && (
        <div
          onClick={handleTogglePlayMusic}
          className="fixed top-6 z-30 cursor-pointer animate-bounce px-4 py-2 rounded-full bg-amber-500/90 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Nhấn vào màn hình để bật nhạc</span>
        </div>
      )}
    </div>
  );
}

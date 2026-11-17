import React, { useState, useEffect } from 'react';
import { INITIAL_FILM_ROLLS } from './data/defaultFilms';
import { FilmRoll } from './types/film';
import { PolaroidCameraStage } from './components/PolaroidCameraStage';
import { BackgroundLyrics } from './components/BackgroundLyrics';
import { soundtrackEngine } from './utils/soundtrackEngine';

export default function App() {
  const activeRoll: FilmRoll = INITIAL_FILM_ROLLS[0];
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Initialize and auto-unlock background music without displaying any audio bar
  useEffect(() => {
    soundtrackEngine.setVolume(0.7);
    soundtrackEngine.selectTrack('thama-drawn', activeRoll.customAudioUrl);
    soundtrackEngine.play();

    const unlockAudio = () => {
      if (!soundtrackEngine.getIsPlaying()) {
        soundtrackEngine.play();
      }
      if (soundtrackEngine.getIsPlaying()) {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      }
    };

    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [activeRoll]);

  const handleToggleScroll = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="relative w-screen h-screen bg-[#030303] text-neutral-100 flex flex-col items-center justify-center overflow-hidden selection:bg-amber-500/20">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-radial from-amber-950/15 via-black/40 to-[#030303] pointer-events-none" />

      {/* Audio-Synced Lyrics Backdrop Behind Camera & Photos */}
      <BackgroundLyrics />

      {/* Main Screen: Polaroid Now Camera Snap & Enlarged Printed Photos */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <PolaroidCameraStage
          roll={activeRoll}
          isPlaying={isPlaying}
          onTogglePlay={handleToggleScroll}
        />
      </main>
    </div>
  );
}

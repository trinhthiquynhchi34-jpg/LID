import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FilmRoll, FilmPhoto } from '../types/film';
import { filmAudio } from '../utils/audio';

const POLAROID_CAMERA_SRC = '/assets/aistudio/image_4956bb62.png';

// Crop region in 828x828 source image containing the Polaroid Now camera body
const CROP_X = 188;
const CROP_Y = 192;
const CROP_W = 454;
const CROP_H = 425;

interface PolaroidCameraStageProps {
  roll: FilmRoll;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onAddPhotos: (newPhotos: FilmPhoto[]) => void;
  onOpenMediaModal: () => void;
  onOpenBackgroundModal: () => void;
}

interface ActiveShot {
  photo: FilmPhoto;
  index: number;
  shotId: number;
}

interface PrintedItem {
  photo: FilmPhoto;
  printKey: number;
  index: number;
  tilt: number;
}

const TILTS = [-2.6, 2.1, -1.5, 2.5, -2.0, 1.4, -2.3, 1.8];

export const PolaroidCameraStage: React.FC<PolaroidCameraStageProps> = ({
  roll,
  isPlaying,
  onTogglePlay,
  isMusicPlaying,
  onToggleMusic,
  onAddPhotos,
  onOpenMediaModal,
  onOpenBackgroundModal,
}) => {
  const photos = roll.photos;
  const [activeShot, setActiveShot] = useState<ActiveShot | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isDeveloping, setIsDeveloping] = useState<boolean>(false);
  const [printedHistory, setPrintedHistory] = useState<PrintedItem[]>([]);
  const [cameraCutoutUrl, setCameraCutoutUrl] = useState<string | null>(null);
  const [isCameraSoundOn, setIsCameraSoundOn] = useState<boolean>(() =>
    filmAudio.getIsCameraSoundEnabled()
  );

  const nextIndexRef = useRef<number>(0);
  const shotIdRef = useRef<number>(0);
  const activeShotRef = useRef<ActiveShot | null>(null);
  const committedShotIdRef = useRef<number>(0);

  const autoTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const developTimerRef = useRef<number | null>(null);
  const commitTimerRef = useRef<number | null>(null);
  const trayScrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingJumpIndexRef = useRef<number | null>(null);
  const createdUrlsRef = useRef<string[]>([]);

  // Remove outer white studio background from the Polaroid Now PNG using edge flood-fill
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = POLAROID_CAMERA_SRC;

    img.onload = () => {
      if (cancelled) return;
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = w;
        srcCanvas.height = h;
        const srcCtx = srcCanvas.getContext('2d');
        if (!srcCtx) return;

        srcCtx.drawImage(img, 0, 0);
        const imageData = srcCtx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const visited = new Uint8Array(w * h);
        const removed = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isNearWhite = (idx: number) => {
          const p = idx * 4;
          return data[p] >= 246 && data[p + 1] >= 246 && data[p + 2] >= 246;
        };

        const enqueueIfWhite = (x: number, y: number) => {
          const idx = y * w + x;
          if (!visited[idx] && isNearWhite(idx)) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        for (let x = 0; x < w; x++) {
          enqueueIfWhite(x, 0);
          enqueueIfWhite(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueueIfWhite(0, y);
          enqueueIfWhite(w - 1, y);
        }

        while (head < tail) {
          const idx = queue[head++];
          removed[idx] = 1;
          data[idx * 4 + 3] = 0;

          const x = idx % w;
          const y = (idx - x) / w;

          if (x > 0) enqueueIfWhite(x - 1, y);
          if (x < w - 1) enqueueIfWhite(x + 1, y);
          if (y > 0) enqueueIfWhite(x, y - 1);
          if (y < h - 1) enqueueIfWhite(x, y + 1);
        }

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            if (removed[idx]) continue;
            const touchesBg =
              removed[idx - 1] ||
              removed[idx + 1] ||
              removed[idx - w] ||
              removed[idx + w];
            if (touchesBg) {
              const p = idx * 4;
              const minChan = Math.min(data[p], data[p + 1], data[p + 2]);
              if (minChan >= 232) {
                const factor = Math.max(0, Math.min(1, (248 - minChan) / 16));
                data[p + 3] = Math.round(255 * factor);
              }
            }
          }
        }

        srcCtx.putImageData(imageData, 0, 0);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = CROP_W;
        outCanvas.height = CROP_H;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) return;

        outCtx.drawImage(
          srcCanvas,
          CROP_X,
          CROP_Y,
          CROP_W,
          CROP_H,
          0,
          0,
          CROP_W,
          CROP_H
        );

        setCameraCutoutUrl(outCanvas.toDataURL('image/png'));
      } catch {
        // Fallback to raw image
      }
    };

    return () => {
      cancelled = true;
    };
  }, []);

  const commitShotToTray = useCallback((shot: ActiveShot) => {
    if (committedShotIdRef.current >= shot.shotId) return;
    committedShotIdRef.current = shot.shotId;

    setPrintedHistory((prev) => {
      const tilt = TILTS[shot.shotId % TILTS.length];
      const nextItem: PrintedItem = {
        photo: shot.photo,
        printKey: shot.shotId,
        index: shot.index,
        tilt,
      };
      const filtered = prev.filter((item) => item.index !== shot.index);
      return [...filtered, nextItem].slice(-7);
    });
  }, []);

  const snapPhoto = useCallback(
    (targetIdx?: number) => {
      if (!photos.length) return;

      // If a previous shot was still in the chute (e.g. rapid manual click), place it below first
      if (activeShotRef.current) {
        commitShotToTray(activeShotRef.current);
      }

      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (developTimerRef.current) window.clearTimeout(developTimerRef.current);
      if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);

      const idx =
        targetIdx !== undefined
          ? targetIdx % photos.length
          : nextIndexRef.current % photos.length;
      nextIndexRef.current = (idx + 1) % photos.length;

      const shotId = ++shotIdRef.current;
      const newShot: ActiveShot = {
        photo: photos[idx],
        index: idx,
        shotId,
      };
      activeShotRef.current = newShot;

      // 1. Camera flash + shutter snap sound FIRST
      setIsFlashing(true);
      setIsDeveloping(true);
      setActiveShot(newShot);
      filmAudio.playPolaroidSnap();

      flashTimerRef.current = window.setTimeout(() => {
        setIsFlashing(false);
      }, 340);

      // 2. Chemical development finishes at ~2.2s
      developTimerRef.current = window.setTimeout(() => {
        setIsDeveloping(false);
      }, 2200);

      // 3. After printing, expanding to full size, and developing (~3.25s), drop photo to bottom gallery
      commitTimerRef.current = window.setTimeout(() => {
        commitShotToTray(newShot);
        if (activeShotRef.current?.shotId === newShot.shotId) {
          activeShotRef.current = null;
          setActiveShot(null);
        }
      }, 3250);
    },
    [photos, commitShotToTray]
  );

  // Keep newest printed photo scrolled into view
  useEffect(() => {
    const el = trayScrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: el.scrollWidth,
      behavior: 'smooth',
    });
  }, [printedHistory]);

  // Clear pending timers and revoke object URLs on unmount
  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => {
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (developTimerRef.current) window.clearTimeout(developTimerRef.current);
      if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Immediately snap the first newly uploaded photo once added to roll
  useEffect(() => {
    if (pendingJumpIndexRef.current !== null && pendingJumpIndexRef.current < photos.length) {
      const targetIdx = pendingJumpIndexRef.current;
      pendingJumpIndexRef.current = null;
      snapPhoto(targetIdx);
    }
  }, [photos, snapPhoto]);

  // Auto-snap loop: take photo -> eject & develop -> drop below -> repeat
  useEffect(() => {
    if (!isPlaying) {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    const initialSnapTimeout =
      shotIdRef.current === 0
        ? window.setTimeout(() => {
            snapPhoto();
          }, 550)
        : null;

    autoTimerRef.current = window.setInterval(() => {
      snapPhoto();
    }, 4800);

    return () => {
      if (initialSnapTimeout) window.clearTimeout(initialSnapTimeout);
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [isPlaying, snapPhoto]);

  const handleLensClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleCameraBodyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenBackgroundModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const baseTime = Date.now();
    const addedPhotos: FilmPhoto[] = imageFiles.map((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      createdUrlsRef.current.push(objectUrl);
      return {
        id: `user-upload-${baseTime}-${idx}`,
        url: objectUrl,
        title: '',
        filmStockName: roll.stockLabel || 'POLAROID NOW',
        frameNumber: String(photos.length + idx + 1).padStart(2, '0'),
        objectFit: 'cover',
        objectPosition: 'center',
      };
    });

    pendingJumpIndexRef.current = photos.length;
    onAddPhotos(addedPhotos);
    e.target.value = '';
  };

  const handleToggleMusicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMusic();
  };

  const handleToggleCameraSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const enabled = filmAudio.toggleCameraSound();
    setIsCameraSoundOn(enabled);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between pt-0 pb-2 select-none overflow-y-auto overflow-x-hidden no-scrollbar px-2">
      {/* Hidden File Input for Adding User Image Files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Soft Full-Screen Camera Flash Overlay */}
      <AnimatePresence>
        {isFlashing && activeShot && (
          <motion.div
            key={`flash-${activeShot.shotId}`}
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 bg-amber-50 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Center Stage: Polaroid Now Camera flush to top + Active Ejecting Photo */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-start min-h-0">
        {/* Polaroid Now Camera — body chooses background; lens selects photos; red toggles music; flash toggles camera sound; purple changes music & lyrics */}
        <motion.div
          onClick={handleCameraBodyClick}
          animate={
            isFlashing
              ? { y: [0, 3, 0], scale: [1, 0.985, 1] }
              : { y: 0, scale: 1 }
          }
          transition={{ duration: 0.25 }}
          title="Bấm máy ảnh để chọn Background • Ống kính: chọn ảnh • Nút đỏ: nhạc • Flash: âm thanh • Nút tím: đổi nhạc & lyrics"
          className="relative z-20 w-[132px] sm:w-[156px] md:w-[172px] lg:w-[186px] aspect-[454/425] cursor-pointer group shrink-0"
        >
          <img
            src={cameraCutoutUrl || POLAROID_CAMERA_SRC}
            alt="Polaroid Now"
            draggable={false}
            className={`w-full h-full object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.85)] transition-opacity duration-200 ${
              cameraCutoutUrl ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Interactive Camera Lens: Opens File Picker ONLY when clicking the lens */}
          <button
            type="button"
            onClick={handleLensClick}
            aria-label="Chọn hoặc thay ảnh"
            title="Bấm vào ống kính để chọn / thay ảnh"
            style={{ left: '35.2%', top: '12.0%', width: '33.0%', height: '33.4%' }}
            className="absolute rounded-full cursor-pointer hover:ring-2 hover:ring-sky-300/70 hover:bg-sky-300/10 active:scale-95 transition-all z-10"
          />

          {/* Interactive Flash Window: Toggles Camera Sound ON/OFF */}
          <button
            type="button"
            onClick={handleToggleCameraSound}
            aria-label={isCameraSoundOn ? 'Tắt âm thanh máy ảnh' : 'Bật âm thanh máy ảnh'}
            title={
              isCameraSoundOn
                ? 'Bấm vào đèn flash để tắt âm thanh máy ảnh'
                : 'Bấm vào đèn flash để bật âm thanh máy ảnh'
            }
            style={{ left: '4.8%', top: '7.1%', width: '22.5%', height: '24.2%' }}
            className={`absolute rounded-full cursor-pointer active:scale-95 transition-all z-10 ${
              isCameraSoundOn
                ? 'hover:ring-2 hover:ring-white/65'
                : 'bg-black/40 ring-2 ring-white/45 hover:ring-amber-300/85'
            }`}
          />

          {/* Xenon Flash Glow right over the camera flash window */}
          <AnimatePresence>
            {isFlashing && activeShot && (
              <motion.div
                key={`lens-flash-${activeShot.shotId}`}
                initial={{ opacity: 1, scale: 0.85 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ left: '4.8%', top: '7.1%', width: '22.5%', height: '24.2%' }}
                className="absolute z-20 rounded-full bg-white shadow-[0_0_50px_22px_rgba(255,255,255,0.95)] pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Interactive Red Button: Toggles Music Play/Pause */}
          <button
            type="button"
            onClick={handleToggleMusicClick}
            aria-label={isMusicPlaying ? 'Dừng nhạc' : 'Phát nhạc'}
            title={isMusicPlaying ? 'Bấm nút đỏ để dừng nhạc' : 'Bấm nút đỏ để phát nhạc'}
            style={{ left: '11.5%', top: '38.8%', width: '10.8%', height: '10.0%' }}
            className={`absolute rounded-full cursor-pointer active:scale-90 transition-all z-10 ${
              isMusicPlaying
                ? 'hover:ring-2 hover:ring-red-300/80'
                : 'bg-black/40 ring-2 ring-white/55 hover:ring-amber-300/90'
            }`}
          />

          {/* Interactive Purple Button: Opens Music & Lyrics Changer */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMediaModal();
            }}
            aria-label="Thay nhạc và lyrics"
            title="Bấm nút tím để thay nhạc và lyrics"
            style={{ left: '79.4%', top: '39.0%', width: '9.8%', height: '9.8%' }}
            className="absolute rounded-full cursor-pointer bg-gradient-to-b from-purple-400 via-purple-600 to-purple-800 border border-purple-200/80 shadow-[0_2px_10px_rgba(168,85,247,0.75),inset_0_1px_2px_rgba(255,255,255,0.55)] hover:brightness-110 hover:ring-2 hover:ring-purple-300/80 active:scale-90 transition-all z-10"
          />
        </motion.div>

        {/* Ejection Chute: photo prints at exact slot width first, then expands smoothly to full size */}
        <div
          className="relative z-30 -mt-[17px] sm:-mt-[20px] md:-mt-[22px] lg:-mt-[24px] pt-[14px] sm:pt-[17px] md:pt-[19px] lg:pt-[20px] translate-x-[2px] sm:translate-x-[3px] px-6 pb-4 min-h-[195px] sm:min-h-[235px] md:min-h-[258px] lg:min-h-[282px] overflow-hidden flex flex-col items-center shrink-0"
        >
          <AnimatePresence mode="wait">
            {activeShot && (
              <motion.div
                key={`polaroid-${activeShot.shotId}-${activeShot.photo.id}`}
                initial={{ y: -155, opacity: 0.96, scale: 0.49, rotate: 0 }}
                animate={{
                  y: [-155, 0, 0],
                  opacity: [0.96, 1, 1],
                  scale: [0.49, 0.49, 1],
                  rotate: [0, 0, activeShot.shotId % 2 === 0 ? 1.1 : -1.1],
                }}
                exit={{
                  y: 120,
                  opacity: 0,
                  scale: 0.78,
                  transition: { duration: 0.42, ease: [0.4, 0, 1, 1] },
                }}
                transition={{
                  duration: 1.85,
                  delay: 0.12,
                  times: [0, 0.52, 1],
                  ease: ['easeOut', [0.22, 1, 0.36, 1]],
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                title={isPlaying ? 'Nhấn để tạm dừng chụp tự động' : 'Nhấn để tiếp tục chụp tự động'}
                className="relative origin-top w-52 sm:w-64 md:w-72 lg:w-80 bg-[#faf7f0] p-2 sm:p-2.5 pb-5 sm:pb-7 rounded-[4px] shadow-[0_24px_60px_rgba(0,0,0,0.92)] border border-neutral-300/60 cursor-pointer"
              >
                <div className="relative w-full aspect-[16/10] bg-[#0b0d12] overflow-hidden shadow-inner">
                  <motion.img
                    src={activeShot.photo.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    draggable={false}
                    initial={{
                      filter: 'brightness(0.12) contrast(0.7) saturate(0.15) blur(4px)',
                    }}
                    animate={{
                      filter: 'brightness(1) contrast(1.04) saturate(1.06) blur(0px)',
                    }}
                    transition={{ duration: 1.9, delay: 0.38, ease: 'easeOut' }}
                    style={{
                      objectPosition: activeShot.photo.objectPosition || 'center',
                      objectFit: activeShot.photo.objectFit || 'cover',
                      transform: `scale(${activeShot.photo.zoom || 1}) translate(${activeShot.photo.panX || 0}%, ${activeShot.photo.panY || 0}%)`,
                      transformOrigin: 'center center',
                    }}
                    className="w-full h-full object-cover"
                  />

                  {/* Chemical Development Dark Wash Layer */}
                  <motion.div
                    initial={{ opacity: 0.94 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.85, delay: 0.32, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-[#121620] pointer-events-none"
                  />

                  {/* Subtle Photo Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/10 pointer-events-none" />
                </div>

                {/* Minimal Film Counter Stamp */}
                <div className="absolute bottom-1.5 sm:bottom-2 left-2.5 right-2.5 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-widest text-neutral-400">
                  <span>
                    {String(activeShot.index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] uppercase text-neutral-400/80">
                    {isDeveloping ? 'DEVELOPING...' : 'PRINTED'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Enlarged Printed Polaroid Gallery — only populated AFTER a shot completes */}
      <div
        ref={trayScrollRef}
        className="relative z-20 w-full min-h-[168px] sm:min-h-[212px] md:min-h-[236px] lg:min-h-[256px] overflow-x-auto no-scrollbar shrink-0 pb-1 flex items-center"
      >
        {printedHistory.length > 0 && (
          <div className="w-max mx-auto flex items-center gap-4 sm:gap-5 md:gap-6 px-6 py-3">
            {printedHistory.map((item) => {
              const isLatestPrinted =
                printedHistory[printedHistory.length - 1]?.printKey === item.printKey;
              return (
                <motion.button
                  key={`${item.photo.id}-${item.printKey}`}
                  type="button"
                  initial={{ opacity: 0, y: -28, scale: 0.85 }}
                  animate={{
                    opacity: isLatestPrinted ? 1 : 0.92,
                    y: 0,
                    scale: 1,
                    rotate: item.tilt,
                  }}
                  whileHover={{ scale: 1.06, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => {
                    e.stopPropagation();
                    snapPhoto(item.index);
                  }}
                  title={`Chụp lại tấm #${item.index + 1}`}
                  className={`shrink-0 w-52 sm:w-64 md:w-72 lg:w-80 bg-[#faf7f0] p-2 sm:p-2.5 pb-5 sm:pb-7 rounded-[4px] shadow-[0_18px_42px_rgba(0,0,0,0.88)] border transition-shadow ${
                    isLatestPrinted
                      ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-amber-500/20'
                      : 'border-neutral-300/50 hover:border-amber-300/80'
                  }`}
                >
                  <div className="w-full aspect-[16/10] bg-neutral-900 overflow-hidden">
                    <img
                      src={item.photo.url}
                      alt=""
                      referrerPolicy="no-referrer"
                      draggable={false}
                      style={{
                        objectPosition: item.photo.objectPosition || 'center',
                        transform: `scale(${item.photo.zoom || 1})`,
                        transformOrigin: 'center center',
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

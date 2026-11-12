// Cinematic Soundtrack Engine
// Procedural ambient synthesizer for vintage film atmosphere + Custom audio file player

import { SoundtrackTrack, PRESET_SOUNDTRACKS } from '../types/soundtrack';

class SoundtrackEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private currentTrackId: string = 'cinema-nostalgia';
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;

  // Custom audio element for user uploaded files
  private audioElement: HTMLAudioElement | null = null;
  private customTrackUrl: string | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string {
    return this.currentTrackId;
  }

  public selectTrack(trackId: string, customUrl?: string) {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentTrackId = trackId;
    if (customUrl) {
      this.customTrackUrl = customUrl;
    } else if (trackId !== 'custom') {
      this.customTrackUrl = null;
    }
    if (wasPlaying) {
      this.play();
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    this.init();
    this.isPlaying = true;

    // Check if current track is a custom audio or a preset with an audioUrl (such as THAMA - Drawn OST)
    const preset = PRESET_SOUNDTRACKS.find((p) => p.id === this.currentTrackId);
    const audioUrl = this.customTrackUrl || preset?.audioUrl;

    if (audioUrl) {
      this.playCustomAudio(audioUrl);
      return;
    }

    // Play procedural cinematic music based on trackId
    this.startProceduralMusic(this.currentTrackId);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  private playCustomAudio(url: string) {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
    }
    if (this.audioElement.src !== url && !this.audioElement.src.endsWith(url)) {
      this.audioElement.src = url;
    }
    this.audioElement.volume = this.volume;
    this.audioElement.play().catch((err) => {
      console.warn('Audio play auto-play policy:', err);
    });
  }

  private startProceduralMusic(trackId: string) {
    if (!this.ctx || !this.masterGain) return;

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    // Note scales for procedural composition
    // F Minor / Pentatonic ambient notes
    const pianoNotes = [
      174.61, // F3
      220.00, // A3
      261.63, // C4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
    ];

    const synthPadChords = [
      [174.61, 261.63, 349.23, 440.00], // Fmaj7
      [146.83, 220.00, 293.66, 349.23], // Dm7
      [130.81, 196.00, 261.63, 329.63], // Cmaj7
      [116.54, 174.61, 233.08, 293.66], // Bbmaj7
    ];

    let chordStep = 0;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      if (trackId === 'cinema-nostalgia' || trackId === 'cafe-acoustic') {
        // Play gentle bell-like piano/guitar note
        const noteFreq = pianoNotes[Math.floor(Math.random() * pianoNotes.length)];
        this.playPianoTone(noteFreq, 2.5);

        // Occasionally play bass root
        if (Math.random() > 0.6) {
          this.playPianoTone(noteFreq / 2, 4.0, 0.4);
        }
      } else if (trackId === 'tokyo-synth') {
        // Lush analog synth chords
        const chord = synthPadChords[chordStep % synthPadChords.length];
        chordStep++;
        chord.forEach((freq) => {
          this.playSynthPadTone(freq, 3.8);
        });
      } else if (trackId === 'vinyl-rain') {
        // Rain wash & gentle vinyl tape pulse
        this.playVinylCrackle();
        const noteFreq = pianoNotes[Math.floor(Math.random() * 4)];
        this.playPianoTone(noteFreq, 3.0, 0.3);
      }
    };

    // Immediate first tone
    playStep();

    // Loop interval
    const intervalMs = trackId === 'tokyo-synth' ? 3600 : 2000;
    this.timerId = window.setInterval(playStep, intervalMs);
  }

  // Soft warm sine/triangle piano tone
  private playPianoTone(freq: number, duration: number, gainMul = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Warm attack and long soft decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 * gainMul, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Low pass filter for warm vintage feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // safe
    }
  }

  // Analog synth pad tone
  private playSynthPadTone(freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(800, now + 1.5);
      filter.frequency.linearRampToValueAtTime(300, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // safe
    }
  }

  // Vinyl record dust noise crackle
  private playVinylCrackle() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.96 ? 0.2 : 0.015);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    } catch {
      // safe
    }
  }
}

export const soundtrackEngine = new SoundtrackEngine();

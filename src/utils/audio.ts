// Vintage Film Projector Web Audio Synthesizer
// Generates authentic mechanical projector motor hum, sprocket clicks, and shutter snaps

class FilmAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private motorNode: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isRunning: boolean = false;
  private cameraSoundEnabled: boolean = true;
  private cameraMasterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (!this.cameraMasterGain && this.ctx) {
      this.cameraMasterGain = this.ctx.createGain();
      this.cameraMasterGain.gain.setValueAtTime(
        this.cameraSoundEnabled ? 1 : 0,
        this.ctx.currentTime
      );
      this.cameraMasterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMotor();
    } else if (this.isRunning) {
      this.startMotor();
    }
    return !this.isMuted;
  }

  public getIsAudioActive(): boolean {
    return !this.isMuted;
  }

  public startReelSound() {
    this.isRunning = true;
    if (!this.isMuted) {
      this.startMotor();
    }
  }

  public stopReelSound() {
    this.isRunning = false;
    this.stopMotor();
  }

  private startMotor() {
    this.initContext();
    if (!this.ctx || this.motorNode) return;

    try {
      // Low motor hum (60Hz / 120Hz harmonics)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(64, this.ctx.currentTime);

      // Low pass filter to make it sound warm and mechanical
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();

      this.motorNode = osc;
      this.motorGain = gain;
    } catch {
      // Audio might be blocked by browser policy until user interacts
    }
  }

  private stopMotor() {
    if (this.motorNode) {
      try {
        this.motorNode.stop();
        this.motorNode.disconnect();
      } catch {
        // ignore
      }
      this.motorNode = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
  }

  // Play a single mechanical click when a frame advances or user clicks
  public playFrameClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio policy safe
    }
  }

  // Play projector shutter snap
  public playShutterSnap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // safe
    }
  }

  public unlock() {
    try {
      this.initContext();
    } catch {
      // safe
    }
  }

  public getIsCameraSoundEnabled(): boolean {
    return this.cameraSoundEnabled;
  }

  public toggleCameraSound(): boolean {
    this.cameraSoundEnabled = !this.cameraSoundEnabled;
    try {
      this.initContext();
      if (this.cameraMasterGain && this.ctx) {
        this.cameraMasterGain.gain.setValueAtTime(
          this.cameraSoundEnabled ? 1 : 0,
          this.ctx.currentTime
        );
      }
    } catch {
      // safe
    }
    return this.cameraSoundEnabled;
  }

  // Play authentic vintage film camera shutter ("cách-tách!") followed by geared film ejection & paper print sound
  public playPolaroidSnap() {
    if (!this.cameraSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.cameraMasterGain) return;

      const triggerSounds = () => {
        if (!this.ctx || !this.cameraMasterGain || !this.cameraSoundEnabled) return;
        const now = this.ctx.currentTime;
        const output = this.cameraMasterGain;

        // 1A. First mechanical curtain / mirror release ("cách")
        const createBurst = (startTime: number, dur: number, freq: number, q: number, level: number) => {
          if (!this.ctx) return;
          const size = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
          const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for (let i = 0; i < size; i++) {
            const env = Math.exp(-i / (size * 0.22));
            ch[i] = (Math.random() * 2 - 1) * env;
          }
          const src = this.ctx.createBufferSource();
          src.buffer = buf;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, startTime);
          filter.Q.setValueAtTime(q, startTime);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(level, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

          src.connect(filter);
          filter.connect(gain);
          gain.connect(output);
          src.start(startTime);
        };

        // Metallic shutter thump
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(210, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(68, now + 0.045);
        bodyGain.gain.setValueAtTime(0.18, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        bodyOsc.connect(bodyGain);
        bodyGain.connect(output);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.055);

        createBurst(now, 0.032, 2300, 1.4, 0.34);

        // 1B. Second shutter curtain snap ("tách") at +42ms
        const secondSnap = now + 0.042;
        createBurst(secondSnap, 0.038, 3400, 1.6, 0.38);

        // 2. Film advance & Polaroid ejection roller print sound (0.12s -> 1.04s, matching slide-out)
        const motorStart = now + 0.12;
        const motorDur = 0.92;

        // Geared motor oscillator modulated by 28Hz gear-tooth pulse
        const motorOsc = this.ctx.createOscillator();
        motorOsc.type = 'sawtooth';
        motorOsc.frequency.setValueAtTime(145, motorStart);
        motorOsc.frequency.linearRampToValueAtTime(185, motorStart + 0.14);
        motorOsc.frequency.setValueAtTime(180, motorStart + motorDur - 0.18);
        motorOsc.frequency.linearRampToValueAtTime(135, motorStart + motorDur);

        const lfoOsc = this.ctx.createOscillator();
        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(28, motorStart);
        const lfoDepth = this.ctx.createGain();
        lfoDepth.gain.setValueAtTime(0.038, motorStart);

        const motorFilter = this.ctx.createBiquadFilter();
        motorFilter.type = 'bandpass';
        motorFilter.frequency.setValueAtTime(520, motorStart);
        motorFilter.Q.setValueAtTime(0.9, motorStart);

        const motorGain = this.ctx.createGain();
        motorGain.gain.setValueAtTime(0.001, motorStart);
        motorGain.gain.linearRampToValueAtTime(0.095, motorStart + 0.06);
        motorGain.gain.setValueAtTime(0.088, motorStart + motorDur - 0.12);
        motorGain.gain.exponentialRampToValueAtTime(0.001, motorStart + motorDur);

        lfoOsc.connect(lfoDepth);
        lfoDepth.connect(motorGain.gain);

        motorOsc.connect(motorFilter);
        motorFilter.connect(motorGain);
        motorGain.connect(output);

        motorOsc.start(motorStart);
        motorOsc.stop(motorStart + motorDur + 0.02);
        lfoOsc.start(motorStart);
        lfoOsc.stop(motorStart + motorDur + 0.02);

        // Paper sliding friction hiss through the film slot ("shhh...")
        const slideSize = Math.floor(this.ctx.sampleRate * motorDur);
        const slideBuf = this.ctx.createBuffer(1, slideSize, this.ctx.sampleRate);
        const slideCh = slideBuf.getChannelData(0);
        for (let i = 0; i < slideSize; i++) {
          const progress = i / slideSize;
          const env = Math.sin(Math.min(1, progress * 6) * (Math.PI / 2)) * (1 - Math.pow(progress, 4));
          slideCh[i] = (Math.random() * 2 - 1) * env;
        }
        const slideSrc = this.ctx.createBufferSource();
        slideSrc.buffer = slideBuf;

        const slideFilter = this.ctx.createBiquadFilter();
        slideFilter.type = 'bandpass';
        slideFilter.frequency.setValueAtTime(1450, motorStart);
        slideFilter.Q.setValueAtTime(0.85, motorStart);

        const slideGain = this.ctx.createGain();
        slideGain.gain.setValueAtTime(0.085, motorStart);

        slideSrc.connect(slideFilter);
        slideFilter.connect(slideGain);
        slideGain.connect(output);
        slideSrc.start(motorStart);

        // 3. Soft mechanical latch click when film sheet clears rollers
        createBurst(motorStart + motorDur - 0.03, 0.028, 1700, 1.5, 0.16);
      };

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(triggerSounds).catch(() => {});
      } else {
        triggerSounds();
      }
    } catch {
      // Audio autoplay policy safe
    }
  }
}

export const filmAudio = new FilmAudioEngine();

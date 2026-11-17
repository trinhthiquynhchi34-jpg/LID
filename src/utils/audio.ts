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

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
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

  // Play Polaroid shutter "tách!" + short mechanical ejection whir
  public playPolaroidSnap() {
    try {
      this.initContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;

      const now = this.ctx.currentTime;

      // 1. Crisp mechanical shutter click ("tách!")
      const clickBufferSize = Math.floor(this.ctx.sampleRate * 0.045);
      const clickBuffer = this.ctx.createBuffer(1, clickBufferSize, this.ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);
      for (let i = 0; i < clickBufferSize; i++) {
        const env = Math.exp(-i / (clickBufferSize * 0.22));
        clickData[i] = (Math.random() * 2 - 1) * env;
      }

      const clickNoise = this.ctx.createBufferSource();
      clickNoise.buffer = clickBuffer;

      const clickFilter = this.ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(1800, now);
      clickFilter.Q.setValueAtTime(1.2, now);

      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.28, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      clickNoise.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickNoise.start(now);

      // 2. Short Polaroid roller motor whir ("rrrr...")
      const motorStart = now + 0.06;
      const motorDur = 0.65;

      const motorOsc = this.ctx.createOscillator();
      motorOsc.type = 'sawtooth';
      motorOsc.frequency.setValueAtTime(135, motorStart);
      motorOsc.frequency.linearRampToValueAtTime(155, motorStart + 0.15);
      motorOsc.frequency.linearRampToValueAtTime(125, motorStart + motorDur);

      const motorFilter = this.ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(420, motorStart);

      const motorGain = this.ctx.createGain();
      motorGain.gain.setValueAtTime(0.001, motorStart);
      motorGain.gain.linearRampToValueAtTime(0.045, motorStart + 0.05);
      motorGain.gain.setValueAtTime(0.04, motorStart + motorDur - 0.12);
      motorGain.gain.exponentialRampToValueAtTime(0.001, motorStart + motorDur);

      motorOsc.connect(motorFilter);
      motorFilter.connect(motorGain);
      motorGain.connect(this.ctx.destination);

      motorOsc.start(motorStart);
      motorOsc.stop(motorStart + motorDur + 0.02);
    } catch {
      // Audio autoplay policy safe
    }
  }
}

export const filmAudio = new FilmAudioEngine();

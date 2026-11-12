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
}

export const filmAudio = new FilmAudioEngine();

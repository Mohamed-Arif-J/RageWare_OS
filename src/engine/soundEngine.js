/**
 * RAGEWARE — Authentic Windows 95 Retro Sound Engine
 * 
 * Synthesizes classic Windows 95 sound effects completely offline via Web Audio API:
 * - Win95 Startup Ambient Chord Swell (Brian Eno homage)
 * - Critical Stop (Stop.wav)
 * - Error Chord (Chord.wav)
 * - Information Bell (Ding.wav)
 * - Exclamation Warning (Exclam.wav)
 * - Ironic Fanfare (Tada.wav)
 * - PC Speaker Motherboard Beep
 * - Button & Icon Evasion Boing / Whoosh
 * - Virus Cascade Multiplied Chime Storm
 * - Mechanical Tactile UI Click
 */

let soundEngineInstance = null;

class SoundEngine {
  constructor() {
    soundEngineInstance = this;
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.85;
    this.masterGain = null;
    this.hasUnlocked = false;
    this.activeMelodyNodes = [];
    this.activeGainNodes = [];
  }

  // Initialize and unlock audio context on user interaction
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        // Connect directly using AudioNode prototype
        AudioNode.prototype.connect.call(this.masterGain, this.ctx.destination);

        // Global master routing: automatically route destination connections through masterGain
        if (!AudioNode.prototype._rageMasterHooked) {
          const originalConnect = AudioNode.prototype.connect;
          AudioNode.prototype.connect = function(target, output, input) {
            if (
              soundEngineInstance && 
              soundEngineInstance.masterGain && 
              target === soundEngineInstance.ctx?.destination
            ) {
              return originalConnect.call(this, soundEngineInstance.masterGain, output, input);
            }
            return originalConnect.call(this, target, output, input);
          };
          AudioNode.prototype._rageMasterHooked = true;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.hasUnlocked = true;
      });
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  getMuted() {
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  playSound(name) {
    switch (name) {
      case 'startup': return this.playStartup();
      case 'shutdown': return this.playShutdown();
      case 'spindown': return this.playDiskSpinDown();
      case 'stop': return this.playCriticalStop();
      case 'chord': return this.playChord();
      case 'ding': return this.playDing();
      case 'exclamation': return this.playExclamation();
      case 'pcspeaker': return this.playPCSpeaker();
      case 'boing': return this.playBoing();
      case 'virus': return this.playVirusStorm();
      case 'click': return this.playClick();
      case 'tada': return this.playTada();
      case 'shutter': return this.playCameraShutter();
      case 'open': return this.playWindowOpen();
      case 'close': return this.playWindowClose();
      case 'minimize': return this.playWindowMinimize();
      case 'recycle': return this.playRecycleEmpty();
      case 'laser': return this.playLaserScanner();
      case 'dialup': return this.playDialupModem();
      case 'hardware': return this.playHardwareConnect();
      case 'battery': return this.playBatteryAlarm();
      default: return this.playDing();
    }
  }

  // Helper to ensure context is ready
  getReadyContext() {
    this.init();
    if (this.isMuted || !this.ctx) return null;
    return this.ctx;
  }

  /**
   * 1. Windows 95 Startup Chime (The iconic Brian Eno 1995 masterpiece)
   * Plays ONCE when booted into the desktop. Ethereal Eb major 9th swell + crystalline bell chimes.
   */
  playStartup() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1A. Deep Warm Foundation Bass & Choir Pad (Eb2, Bb2, Eb3, G3, Bb3, D4, F4)
    const padNotes = [
      { f: 77.78, type: 'sine', peakGain: 0.14, attack: 0.8, decay: 3.5 },   // Eb2 deep sub
      { f: 116.54, type: 'triangle', peakGain: 0.09, attack: 0.9, decay: 3.4 }, // Bb2 warm fifth
      { f: 155.56, type: 'sine', peakGain: 0.12, attack: 0.7, decay: 3.4 },  // Eb3
      { f: 196.00, type: 'triangle', peakGain: 0.10, attack: 0.8, decay: 3.2 }, // G3
      { f: 233.08, type: 'sine', peakGain: 0.10, attack: 0.9, decay: 3.2 },  // Bb3
      { f: 293.66, type: 'triangle', peakGain: 0.08, attack: 1.0, decay: 3.0 }, // D4
      { f: 349.23, type: 'sine', peakGain: 0.07, attack: 1.1, decay: 3.0 },  // F4
    ];

    padNotes.forEach(({ f, type, peakGain, attack, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });

    // 1B. Iconic Crystalline Arpeggiated Chime Motifs (Eb4 -> G4 -> Bb4 -> D5 -> F5 -> Bb5 -> Eb6 bloom)
    const chimeNotes = [
      { f: 311.13, delay: 0.18, dur: 1.2, gain: 0.10 }, // Eb4
      { f: 392.00, delay: 0.45, dur: 1.2, gain: 0.11 }, // G4
      { f: 466.16, delay: 0.75, dur: 1.2, gain: 0.12 }, // Bb4
      { f: 587.33, delay: 1.05, dur: 1.3, gain: 0.13 }, // D5
      { f: 698.46, delay: 1.35, dur: 1.4, gain: 0.14 }, // F5
      { f: 932.33, delay: 1.68, dur: 1.8, gain: 0.15 }, // Bb5
      // Final celestial bloom chord
      { f: 622.25, delay: 1.95, dur: 2.0, gain: 0.12 }, // Eb5
      { f: 783.99, delay: 1.95, dur: 2.0, gain: 0.12 }, // G5
      { f: 932.33, delay: 1.95, dur: 2.0, gain: 0.12 }, // Bb5
      { f: 1244.5, delay: 1.95, dur: 2.2, gain: 0.10 }, // Eb6
    ];

    chimeNotes.forEach(({ f, delay, dur, gain: noteGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      const startTime = now + delay;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(noteGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  }

  /**
   * 1B. Windows 95 Shutdown Chime (Melancholic descending arpeggio)
   * Authentic descending tones: Bb5 -> G5 -> Eb5 -> C5 -> Bb4 -> G4 -> Eb4
   * Accompanied by warm analog sub-bass and a gentle mechanical relay click.
   */
  playShutdown() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Descending warm sine arpeggio
    const descNotes = [
      { f: 932.33, delay: 0.00, dur: 0.8, gain: 0.12 }, // Bb5
      { f: 783.99, delay: 0.28, dur: 0.8, gain: 0.12 }, // G5
      { f: 622.25, delay: 0.56, dur: 0.9, gain: 0.13 }, // Eb5
      { f: 523.25, delay: 0.84, dur: 0.9, gain: 0.13 }, // C5
      { f: 466.16, delay: 1.12, dur: 1.0, gain: 0.14 }, // Bb4
      { f: 392.00, delay: 1.40, dur: 1.2, gain: 0.13 }, // G4
      { f: 311.13, delay: 1.68, dur: 1.6, gain: 0.14 }, // Eb4 (resolving root)
    ];

    descNotes.forEach(({ f, delay, dur, gain: noteGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      const startTime = now + delay;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(noteGain, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });

    // Deep warm foundation sub-bass swell
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(77.78, now); // Eb2
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 3.1);

    // Hard drive head park click at end
    setTimeout(() => {
      if (this.ctx && !this.isMuted) {
        this.playKeyClick();
      }
    }, 2400);
  }

  /**
   * 1C. Vintage Hard Disk / Floppy Motor Spin-down
   * Simulates high-frequency motor inertia decaying into silent standstill.
   */
  playDiskSpinDown() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Spin down frequency sweep from 1800Hz to 60Hz
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.8);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.0);
  }

  /**
   * 1D. CRT Degauss Coil & Flyback Ignition ("THWUMMMMP-bzzzz")
   * Simulates high-voltage electromagnetic degaussing coil on retro monitors.
   */
  playCrtDegauss() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Heavy low frequency magnetic coil thump
    const coilOsc = ctx.createOscillator();
    const coilGain = ctx.createGain();
    coilOsc.type = 'sawtooth';
    coilOsc.frequency.setValueAtTime(140, now);
    coilOsc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

    coilGain.gain.setValueAtTime(0.25, now);
    coilGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    coilOsc.connect(coilGain);
    coilGain.connect(ctx.destination);
    coilOsc.start(now);
    coilOsc.stop(now + 1.3);

    // 15.75 kHz ultrasonic flyback transformer ping
    const flybackOsc = ctx.createOscillator();
    const flybackGain = ctx.createGain();
    flybackOsc.type = 'sine';
    flybackOsc.frequency.setValueAtTime(8000, now);
    flybackOsc.frequency.linearRampToValueAtTime(14000, now + 0.3);

    flybackGain.gain.setValueAtTime(0.0001, now);
    flybackGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
    flybackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    flybackOsc.connect(flybackGain);
    flybackGain.connect(ctx.destination);
    flybackOsc.start(now);
    flybackOsc.stop(now + 1.0);
  }

  /**
   * 1E. CRT Beam Collapse & Cathode Discharge ("Pop / Whine / Silence")
   * Simulates CRT television power-down beam collapse into dot and fade.
   */
  playCrtOff() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Mechanical power switch tactile click
    this.playKeyClick();

    // High frequency flyback decay whine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(12000, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.45);

    gain.gain.setValueAtTime(0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  /**
   * 1F. BIOS POST Memory Tick
   * Fast mechanical motherboard tick sound during RAM checking.
   */
  playMemoryTick() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * 2. Windows 95 Critical Stop (Stop.wav)
   * Low, dissonant, punchy square/saw impact when fatal error/BSOD occurs.
   */
  playCriticalStop() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [174.61, 220.00, 246.94]; // F3, A3, B3 (dissonant tritone cluster)

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    });
  }

  /**
   * 3. Windows 95 Error Chord (Chord.wav)
   * Classic solid chord chime for system dialogs and errors.
   */
  playChord() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C minor / diminished impact: C4, Eb4, Gb4, Bb4
    const notes = [261.63, 311.13, 369.99, 466.16];

    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  /**
   * 4. Windows 95 Ding (Ding.wav)
   * Pure crystalline high bell chime for tray notifications and info bubbles.
   */
  playDing() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.50, now); // C6 bell
    osc.frequency.exponentialRampToValueAtTime(1030, now + 0.4);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  /**
   * 5. Windows 95 Exclamation (Exclam.wav)
   * Two-note descending warning tone.
   */
  playExclamation() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: High
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now); // A5 - higher & more distinct
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: Lower
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now + 0.1); // D5
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.28, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.48);
  }

  /**
   * 6. Classic PC Speaker Beep (Motherboard BEEP)
   * 750Hz square wave pulse.
   */
  playPCSpeaker() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(750, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.setValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * 7. Evasive Button Boing / Spring Slide
   * Cartoon upward pitch bend when buttons or icons dodge the cursor.
   */
  playBoing() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.32);

    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * 8. Virus Storm Cascade (Rapid succession of staggered chimes)
   * Matches the Error 404 staircase cascade animation!
   */
  playVirusStorm() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const count = 8;
    const baseTime = ctx.currentTime;

    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      // Descending warning tones
      osc.frequency.setValueAtTime(600 - i * 35, baseTime + i * 0.06);

      gain.gain.setValueAtTime(0.001, baseTime + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, baseTime + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, baseTime + i * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(baseTime + i * 0.06);
      osc.stop(baseTime + i * 0.06 + 0.14);
    }
  }

  /**
   * 9. Tactile Mechanical UI Click
   */
  playClick() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.025);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * 10. Windows 95 Tada Fanfare (Tada.wav)
   */
  playTada() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Classic C major fanfare arpeggio: C4, E4, G4, C5 (tada!)
    const notes = [
      { f: 261.63, delay: 0, dur: 0.1 },
      { f: 329.63, delay: 0.1, dur: 0.1 },
      { f: 392.00, delay: 0.2, dur: 0.12 },
      { f: 523.25, delay: 0.32, dur: 0.6 },
    ];

    notes.forEach(({ f, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.14, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * 11. Camera Shutter Mechanical Snapshot (Click-Chik)
   */
  playCameraShutter() {
    const ctx = this.getReadyContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);

    setTimeout(() => {
      const ctx2 = this.getReadyContext();
      if (!ctx2) return;
      const now2 = ctx2.currentTime;
      const osc2 = ctx2.createOscillator();
      const gain2 = ctx2.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1500, now2);
      osc2.frequency.exponentialRampToValueAtTime(320, now2 + 0.05);
      gain2.gain.setValueAtTime(0.14, now2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.06);
      osc2.connect(gain2);
      gain2.connect(ctx2.destination);
      osc2.start(now2);
      osc2.stop(now2 + 0.07);
    }, 75);
  }

  /**
   * 12. Windows 95 Window Open (Short, subtle ascending blip ~80ms)
   * Simple, short, pleasant tone when a window opens.
   */
  playWindowOpen() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle 2-note ascending sweep (440Hz -> 740Hz)
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.06);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /**
   * 13. Windows 95 Window Close (Short, subtle descending blip ~80ms)
   * Simple, short, pleasant tone when a window closes.
   */
  playWindowClose() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle 2-note descending sweep (680Hz -> 360Hz)
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.06);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /**
   * 14. 80s & 90s Retro Synthesizer Jukebox Player
   * Synthesizes authentic analog synth melodies for the Retro Media Player
   */
  play80sMelody(melodyId) {
    this.stop80sMelody();
    const ctx = this.getReadyContext();
    if (!ctx) return;

    this.activeMelodyNodes = [];
    this.activeGainNodes = [];

    // Frequencies
    const C4 = 261.63, Cs4 = 277.18, D4 = 293.66, Eb4 = 311.13, E4 = 329.63,
          F4 = 349.23, Fs4 = 369.99, G4 = 392.00, Ab4 = 415.30, A4 = 440.00,
          Bb4 = 466.16, B4 = 493.88, C5 = 523.25, Cs5 = 554.37, D5 = 587.33,
          Eb5 = 622.25, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

    let score = [];

    if (melodyId === 'rickroll') {
      // Rick Astley - Never Gonna Give You Up (1987) chorus synth
      score = [
        { f: F4, d: 0.18 }, { f: G4, d: 0.18 }, { f: Bb4, d: 0.18 }, { f: G4, d: 0.18 },
        { f: D5, d: 0.32 }, { f: D5, d: 0.32 }, { f: C5, d: 0.5 },
        { f: F4, d: 0.18 }, { f: G4, d: 0.18 }, { f: Bb4, d: 0.18 }, { f: G4, d: 0.18 },
        { f: C5, d: 0.32 }, { f: C5, d: 0.32 }, { f: Bb4, d: 0.32 }, { f: A4, d: 0.2 }, { f: G4, d: 0.45 },
        { f: F4, d: 0.18 }, { f: G4, d: 0.18 }, { f: Bb4, d: 0.18 }, { f: G4, d: 0.18 },
        { f: Bb4, d: 0.32 }, { f: C5, d: 0.32 }, { f: A4, d: 0.32 }, { f: F4, d: 0.2 }, { f: F4, d: 0.25 }, { f: C5, d: 0.25 }, { f: Bb4, d: 0.7 }
      ];
    } else if (melodyId === 'takeonme') {
      // a-ha - Take On Me (1985) intro synth riff
      score = [
        { f: Fs4, d: 0.16 }, { f: Fs4, d: 0.16 }, { f: D4, d: 0.16 }, { f: B4, d: 0.16 },
        { f: B4, d: 0.2 }, { f: E5, d: 0.2 }, { f: E5, d: 0.2 }, { f: E5, d: 0.2 },
        { f: Gs4, d: 0.16 }, { f: Gs4, d: 0.16 }, { f: A4, d: 0.16 }, { f: B4, d: 0.2 },
        { f: A4, d: 0.2 }, { f: A4, d: 0.2 }, { f: A4, d: 0.2 }, { f: E4, d: 0.2 },
        { f: D4, d: 0.2 }, { f: Fs4, d: 0.2 }, { f: Fs4, d: 0.2 }, { f: Fs4, d: 0.2 },
      ];
    } else if (melodyId === 'axelf') {
      // Harold Faltermeyer - Axel F (1984) synth lead
      score = [
        { f: D4, d: 0.24 }, { f: F4, d: 0.2 }, { f: D4, d: 0.15 }, { f: D4, d: 0.12 },
        { f: G4, d: 0.2 }, { f: D4, d: 0.2 }, { f: C4, d: 0.25 },
        { f: D4, d: 0.24 }, { f: A4, d: 0.2 }, { f: D4, d: 0.15 }, { f: D4, d: 0.12 },
        { f: Bb4, d: 0.2 }, { f: A4, d: 0.2 }, { f: F4, d: 0.25 },
        { f: D4, d: 0.2 }, { f: A4, d: 0.2 }, { f: D5, d: 0.25 }, { f: D4, d: 0.15 },
        { f: C4, d: 0.15 }, { f: C4, d: 0.15 }, { f: A4, d: 0.2 }, { f: E4, d: 0.3 }, { f: D4, d: 0.6 }
      ];
    } else if (melodyId === 'billiejean') {
      // Michael Jackson - Billie Jean (1982) synth bassline
      score = [
        { f: Fs4, d: 0.2 }, { f: Cs4, d: 0.2 }, { f: E4, d: 0.2 }, { f: Fs4, d: 0.2 },
        { f: E4, d: 0.2 }, { f: Cs4, d: 0.2 }, { f: B4, d: 0.2 }, { f: Cs4, d: 0.2 },
        { f: Fs4, d: 0.2 }, { f: Cs4, d: 0.2 }, { f: E4, d: 0.2 }, { f: Fs4, d: 0.2 },
        { f: E4, d: 0.2 }, { f: Cs4, d: 0.2 }, { f: B4, d: 0.2 }, { f: Cs4, d: 0.2 }
      ];
    } else if (melodyId === 'sandstorm') {
      // Darude - Sandstorm (1999) trance beat
      score = [
        { f: B4, d: 0.13 }, { f: B4, d: 0.13 }, { f: B4, d: 0.13 }, { f: B4, d: 0.13 },
        { f: B4, d: 0.26 }, { f: B4, d: 0.13 }, { f: B4, d: 0.13 }, { f: B4, d: 0.13 },
        { f: B4, d: 0.13 }, { f: B4, d: 0.13 }, { f: B4, d: 0.13 }, { f: B4, d: 0.26 },
        { f: E5, d: 0.13 }, { f: E5, d: 0.13 }, { f: E5, d: 0.13 }, { f: E5, d: 0.13 },
        { f: E5, d: 0.13 }, { f: E5, d: 0.13 }, { f: E5, d: 0.26 }, { f: D5, d: 0.26 }
      ];
    } else {
      // Default 90s Eurodance synth hook
      score = [
        { f: C4, d: 0.2 }, { f: E4, d: 0.2 }, { f: G4, d: 0.2 }, { f: C5, d: 0.2 },
        { f: G4, d: 0.2 }, { f: E4, d: 0.2 }, { f: D4, d: 0.2 }, { f: F4, d: 0.2 },
        { f: A4, d: 0.2 }, { f: D5, d: 0.2 }, { f: A4, d: 0.2 }, { f: F4, d: 0.2 },
        { f: E4, d: 0.2 }, { f: G4, d: 0.2 }, { f: B4, d: 0.2 }, { f: E5, d: 0.2 },
        { f: C5, d: 0.6 }
      ];
    }

    let timeOffset = ctx.currentTime + 0.05;
    score.forEach(({ f, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, timeOffset);

      gain.gain.setValueAtTime(0.0001, timeOffset);
      gain.gain.linearRampToValueAtTime(0.08, timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, timeOffset + d - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(timeOffset);
      osc.stop(timeOffset + d);

      this.activeMelodyNodes.push(osc);
      this.activeGainNodes.push(gain);
      timeOffset += d;
    });

    return timeOffset - ctx.currentTime;
  }

  stop80sMelody() {
    if (this.activeMelodyNodes && this.activeMelodyNodes.length > 0) {
      this.activeMelodyNodes.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      this.activeMelodyNodes = [];
    }
    if (this.activeGainNodes && this.activeGainNodes.length > 0) {
      this.activeGainNodes.forEach(gain => {
        try { gain.disconnect(); } catch (e) {}
      });
      this.activeGainNodes = [];
    }
  }

  /**
   * 15. Award BIOS POST Beep (Crisp single 880Hz square wave ~100ms)
   * Classic motherboard self-test confirmation beep
   */
  playBiosBeep() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
    gain.gain.setValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * 16. BIOS Keyboard Navigation Click (~15ms soft pulse)
   */
  playKeyClick() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * 17. Windows 95 / 98 Shutdown Chime
   * Iconic descending harmonic chord progression (Bb4 -> F4 -> Eb4 -> Bb3)
   * with warm analog synth decay.
   */
  playShutdown() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Descending bell/synth tones
    const sequence = [
      { f: 466.16, delay: 0.0, dur: 0.9, peak: 0.16 }, // Bb4
      { f: 349.23, delay: 0.32, dur: 0.95, peak: 0.17 }, // F4
      { f: 311.13, delay: 0.64, dur: 1.1, peak: 0.18 },  // Eb4
      { f: 233.08, delay: 0.98, dur: 1.8, peak: 0.20 },  // Bb3
    ];

    sequence.forEach(({ f, delay, dur, peak }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(peak, now + delay + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });

    // Deep warm foundation drone
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(116.54, now + 0.8); // Bb2 deep resolution
    subGain.gain.setValueAtTime(0.0001, now + 0.8);
    subGain.gain.linearRampToValueAtTime(0.14, now + 1.1);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now + 0.8);
    subOsc.stop(now + 2.9);
  }

  /**
   * 15. Windows Hardware Disconnect Sound
   * Classic descending two-tone chime (High tone -> Low tone) for device unplug.
   */
  playHardwareDisconnect() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // High tone (E5 ~659 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.24, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Low tone (C5 ~523 Hz or G4 ~392 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(392.00, now + 0.11);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.24, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.11);
    osc2.stop(now + 0.34);
  }

  /**
   * 16. Windows Hardware Connect Sound
   * Ascending two-tone chime (Low tone -> High tone) for device plug.
   */
  playHardwareConnect() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Low tone (G4 ~392 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(392.00, now);
    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // High tone (E5 ~659 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now + 0.10);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.25, now + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.10);
    osc2.stop(now + 0.34);
  }

  /**
   * 17. Battery Alarm Urgent Beep
   * Motherboard urgent beep pulse for battery countdown.
   */
  playBatteryAlarm() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(950, now + offset);
      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.09);
    });
  }
}

export const soundEngine = new SoundEngine();


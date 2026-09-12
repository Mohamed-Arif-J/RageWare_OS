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

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
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
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.hasUnlocked = true;
      });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
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
}

export const soundEngine = new SoundEngine();


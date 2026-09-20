/**
 * RAGEWARE — System Settings Service
 * Single source of truth for OS personalization, display properties, audio levels,
 * adversarial behavior intensity, and hardware emulation parameters.
 * Persists all configuration in localStorage and broadcasts changes to listeners.
 */

const STORAGE_KEY = 'rageware_system_settings_v1';

export const THEMES = {
  standard: {
    id: 'standard',
    name: 'Windows Standard (Teal #008080)',
    desktop: '#008080',
    surface: '#c0c0c0',
    surfaceLight: '#dfdfdf',
    borderLight: '#ffffff',
    borderShadow: '#808080',
    borderDark: '#000000',
    titleStart: '#000080',
    titleEnd: '#1084d0',
    titleInactiveStart: '#808080',
    titleInactiveEnd: '#b5b5b5',
    titleText: '#ffffff',
    titleInactiveText: '#d4d0c8',
    text: '#000000',
    selectionBg: '#000080',
    selectionText: '#ffffff',
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast Matrix (Black & Neon)',
    desktop: '#000000',
    surface: '#111811',
    surfaceLight: '#1b2a1b',
    borderLight: '#00ff66',
    borderShadow: '#005522',
    borderDark: '#002200',
    titleStart: '#004411',
    titleEnd: '#00aa33',
    titleInactiveStart: '#002200',
    titleInactiveEnd: '#004400',
    titleText: '#00ff66',
    titleInactiveText: '#008833',
    text: '#00ff66',
    selectionBg: '#00ff66',
    selectionText: '#000000',
  },
  'rainy-day': {
    id: 'rainy-day',
    name: 'Rainy Day Slate (Steel Blue)',
    desktop: '#3f5661',
    surface: '#b0b8bc',
    surfaceLight: '#cdd3d6',
    borderLight: '#ffffff',
    borderShadow: '#697479',
    borderDark: '#2a3438',
    titleStart: '#2d4552',
    titleEnd: '#557282',
    titleInactiveStart: '#727e85',
    titleInactiveEnd: '#9ba5ab',
    titleText: '#ffffff',
    titleInactiveText: '#dce1e3',
    text: '#11181c',
    selectionBg: '#2d4552',
    selectionText: '#ffffff',
  },
  'hot-dog-stand': {
    id: 'hot-dog-stand',
    name: 'Hot Dog Stand (Retro 90s Red/Yellow)',
    desktop: '#d60000',
    surface: '#ffff00',
    surfaceLight: '#ffffaa',
    borderLight: '#ffffff',
    borderShadow: '#999900',
    borderDark: '#000000',
    titleStart: '#000000',
    titleEnd: '#333333',
    titleInactiveStart: '#555555',
    titleInactiveEnd: '#777777',
    titleText: '#ffff00',
    titleInactiveText: '#aaaaaa',
    text: '#000000',
    selectionBg: '#d60000',
    selectionText: '#ffffff',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk 1998 (Midnight & Cyan)',
    desktop: '#0c0e1e',
    surface: '#1b1a2e',
    surfaceLight: '#272642',
    borderLight: '#00ffff',
    borderShadow: '#441d6b',
    borderDark: '#070611',
    titleStart: '#4a157a',
    titleEnd: '#9013fe',
    titleInactiveStart: '#241038',
    titleInactiveEnd: '#3d1c5e',
    titleText: '#00ffff',
    titleInactiveText: '#a484c2',
    text: '#e6e6fa',
    selectionBg: '#ff007f',
    selectionText: '#ffffff',
  },
  'platinum-98': {
    id: 'platinum-98',
    name: 'Windows 98 Platinum (Royal Navy)',
    desktop: '#3a6ea5',
    surface: '#d4d0c8',
    surfaceLight: '#ece9d8',
    borderLight: '#ffffff',
    borderShadow: '#808080',
    borderDark: '#000000',
    titleStart: '#0a246a',
    titleEnd: '#a6caf0',
    titleInactiveStart: '#7a8a99',
    titleInactiveEnd: '#b5c0cc',
    titleText: '#ffffff',
    titleInactiveText: '#d4d0c8',
    text: '#000000',
    selectionBg: '#0a246a',
    selectionText: '#ffffff',
  },
  rosewood: {
    id: 'rosewood',
    name: 'Rosewood 95 (Burgundy & Cream)',
    desktop: '#5a2323',
    surface: '#d6cac4',
    surfaceLight: '#ece3df',
    borderLight: '#ffffff',
    borderShadow: '#826f68',
    borderDark: '#2c1914',
    titleStart: '#6b2020',
    titleEnd: '#a03838',
    titleInactiveStart: '#825a5a',
    titleInactiveEnd: '#b08b8b',
    titleText: '#fff3e6',
    titleInactiveText: '#dccac4',
    text: '#221111',
    selectionBg: '#6b2020',
    selectionText: '#ffffff',
  },
};

export const WALLPAPERS = [
  { id: 'win95', name: 'Windows 95 Homage Emblem' },
  { id: 'none', name: 'None (Solid Background Color)' },
  { id: 'matrix', name: 'Digital Rain Stream' },
  { id: 'clouds', name: 'Retro 90s Sky Clouds' },
  { id: 'blueprint', name: 'Cyber Blueprint CAD Grid' },
];

const DEFAULT_SETTINGS = {
  // Appearance
  theme: 'standard',
  wallpaper: 'win95',
  crtScanlines: false,
  dragContents: true,
  desktopIconScale: 'normal', // 'normal' | 'large'

  // Adversarial Behavior
  intensity: 'CHAOTIC', // 'LOW' | 'NORMAL' | 'CHAOTIC' | 'SAFE'
  adaptiveRage: true,
  soundClicks: true,
  ghostCursor: false,
  evasionDistance: 80, // px

  // Patience Engine
  maxRage: 100,
  decayRate: -0.5, // pts per sec
  frustrationMultiplier: 1.25,
  opticalTracking: false,

  // Audio / Sound
  masterVolume: 85, // 0 to 100
  isMuted: false,
  pcSpeakerEnabled: true,

  // System
  registeredOwner: 'Adversarial Cognitive Benchmark',
  registeredOrg: 'RAGEWARE Research Division',
};

class SystemSettingsService {
  constructor() {
    this.listeners = new Set();
    this.settings = this.loadSettings();
    this.applyTheme(this.settings.theme);
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
    this.applyTheme(this.settings.theme);
    this.notify();
    return this.settings;
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      try {
        cb(this.getAll());
      } catch (err) {
        console.error('Settings subscriber error:', err);
      }
    }
  }

  applyTheme(themeKey) {
    if (typeof document === 'undefined') return;
    const theme = THEMES[themeKey] || THEMES.standard;
    const root = document.documentElement;

    root.style.setProperty('--win-desktop', theme.desktop);
    root.style.setProperty('--win-surface', theme.surface);
    root.style.setProperty('--win-surface-light', theme.surfaceLight);
    root.style.setProperty('--win-border-light', theme.borderLight);
    root.style.setProperty('--win-border-shadow', theme.borderShadow);
    root.style.setProperty('--win-border-dark', theme.borderDark);
    root.style.setProperty('--win-titlebar-active-start', theme.titleStart);
    root.style.setProperty('--win-titlebar-active-end', theme.titleEnd);
    root.style.setProperty('--win-titlebar-inactive-start', theme.titleInactiveStart);
    root.style.setProperty('--win-titlebar-inactive-end', theme.titleInactiveEnd);
    root.style.setProperty('--win-titlebar-text', theme.titleText);
    root.style.setProperty('--win-titlebar-text-inactive', theme.titleInactiveText);
    root.style.setProperty('--win-text', theme.text);
    root.style.setProperty('--win-selection-bg', theme.selectionBg);
    root.style.setProperty('--win-selection-text', theme.selectionText);

    document.body.style.backgroundColor = theme.desktop;
    root.setAttribute('data-theme', themeKey);
  }

  resetToDefaults() {
    this.settings = { ...DEFAULT_SETTINGS };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    this.applyTheme(DEFAULT_SETTINGS.theme);
    this.notify();
    return this.settings;
  }
}

export const systemSettings = new SystemSettingsService();

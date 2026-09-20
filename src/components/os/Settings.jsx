import React, { useState, useEffect, useRef } from 'react';
import { systemSettings, THEMES, WALLPAPERS } from '../../services/systemSettings';
import { soundEngine } from '../../engine/soundEngine';
import { 
  getRageProfile, 
  resetSession, 
  increaseRage, 
  setMaxTolerableRage, 
  setEmotionalDecayRate, 
  setFrustrationMultiplier,
  setCameraStatus,
  isOpticalTrackingActive
} from '../../engine/rageEngine';
import { rageBaitEngineInstance } from '../../engine/rageBaitEngine';

const SOUND_LIST = [
  { id: 'startup', name: 'Windows 95 Startup Chime', desc: 'Brian Eno Eb-major 9th ambient swell and crystal chimes' },
  { id: 'stop', name: 'Critical Stop (Stop.wav)', desc: 'Low dissonant tritone sawtooth impact' },
  { id: 'chord', name: 'Error Chord (Chord.wav)', desc: 'Iconic minor 7th system dialog chime' },
  { id: 'ding', name: 'Information Bell (Ding.wav)', desc: 'Pure crystalline 1046Hz high bell tone' },
  { id: 'exclamation', name: 'Warning (Exclam.wav)', desc: 'Two-tone descending triangle warning blip' },
  { id: 'tada', name: 'Tada Fanfare (Tada.wav)', desc: 'Classic C-major fanfare arpeggio' },
  { id: 'pcspeaker', name: 'PC Speaker Motherboard Beep', desc: 'Authentic 750Hz square-wave hardware pulse' },
  { id: 'boing', name: 'Evasive Button Boing', desc: 'Cartoon upward pitch bend when buttons dodge' },
  { id: 'virus', name: 'Virus Storm Cascade', desc: 'Rapid 8-step chime cascade matching popup storm' },
  { id: 'click', name: 'Mechanical Tactile Click', desc: 'Fast transient triangular keyclick' },
  { id: 'shutter', name: 'Camera Shutter Snapshot', desc: 'Mechanical two-stage aperture click-chik' },
  { id: 'open', name: 'Window Open Tone', desc: 'Subtle 80ms ascending frequency blip' },
  { id: 'hardware', name: 'Hardware Connect', desc: 'Ascending two-tone device plug chime' },
  { id: 'battery', name: 'Battery Urgent Alarm', desc: 'Double 950Hz square pulse warning alert' },
];

export default function Settings({
  onClose,
  onOpenApp,
  onReboot,
  onShutdown,
  onRageUpdate,
}) {
  const [activeTab, setActiveTab] = useState('display'); // 'display' | 'behavior' | 'rage' | 'sound' | 'system'
  const [profile, setProfile] = useState(() => getRageProfile());

  // Current draft settings
  const [settings, setSettings] = useState(() => systemSettings.getAll());
  const [statusText, setStatusText] = useState('Ready');
  const [testSoundId, setTestSoundId] = useState('startup');
  const [sandboxPos, setSandboxPos] = useState({ x: 0, y: 0 });
  const [expandedDeviceGroup, setExpandedDeviceGroup] = useState('display');
  const [selectedDevice, setSelectedDevice] = useState('s3-virge');
  const [uptimeSec, setUptimeSec] = useState(142);

  // Live system uptime counter
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync profile periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setProfile(getRageProfile());
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setStatusText('Unapplied changes pending...');
  };

  const handleApply = (shouldClose = false) => {
    soundEngine.playClick();

    // 1. Persist and apply core settings & theme
    systemSettings.saveSettings(settings);

    // 2. Audio Engine updates
    soundEngine.setVolume(settings.masterVolume / 100);
    soundEngine.setMuted(settings.isMuted);

    // 3. Rage Bait Engine updates
    rageBaitEngineInstance.setIntensity(settings.intensity);
    rageBaitEngineInstance.setAdaptiveLearning(settings.adaptiveRage);

    // 4. Rage Engine calibration parameters
    setMaxTolerableRage(settings.maxRage);
    setEmotionalDecayRate(settings.decayRate);
    setFrustrationMultiplier(settings.frustrationMultiplier);
    setCameraStatus(settings.opticalTracking);

    const updatedProfile = getRageProfile();
    setProfile(updatedProfile);
    if (onRageUpdate) onRageUpdate(updatedProfile);

    setStatusText('Settings applied successfully.');

    if (shouldClose && onClose) {
      setTimeout(() => onClose(), 120);
    }
  };

  const handleCancel = () => {
    soundEngine.playClick();
    if (onClose) onClose();
  };

  const handleTestSound = () => {
    soundEngine.playSound(testSoundId);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    updateSetting('masterVolume', val);
    soundEngine.setVolume(val / 100);
  };

  const handleMuteToggle = (e) => {
    const checked = e.target.checked;
    updateSetting('isMuted', checked);
    soundEngine.setMuted(checked);
  };

  const handleTestRageSpike = () => {
    soundEngine.playExclamation();
    const result = increaseRage(15, 'control_panel_test');
    const updated = getRageProfile();
    setProfile(updated);
    if (onRageUpdate) onRageUpdate(updated);
    setStatusText(`Rage spike test triggered (+15). New score: ${result.newScore}`);
  };

  const handleResetRage = () => {
    soundEngine.playDing();
    const reset = resetSession();
    setProfile(reset);
    if (onRageUpdate) onRageUpdate(reset);
    setStatusText('Session rage score & telemetry reset to baseline.');
  };

  const handleSandboxHover = () => {
    const dist = settings.evasionDistance || 80;
    const angle = Math.random() * Math.PI * 2;
    const offsetX = Math.cos(angle) * (dist * 0.75);
    const offsetY = Math.sin(angle) * (dist * 0.4);

    setSandboxPos({
      x: Math.max(-110, Math.min(110, offsetX)),
      y: Math.max(-25, Math.min(25, offsetY)),
    });

    if (settings.soundClicks) {
      soundEngine.playPCSpeaker();
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Reset all RAGEWARE OS settings and appearance to factory defaults?')) {
      const defs = systemSettings.resetToDefaults();
      setSettings(defs);
      soundEngine.setVolume(defs.masterVolume / 100);
      soundEngine.setMuted(defs.isMuted);
      soundEngine.playTada();
      setStatusText('All settings restored to factory defaults.');
    }
  };

  // Compute live rage meter color
  const getRageMeterColor = (score) => {
    if (score < 25) return '#00a82d'; // Calm green
    if (score < 50) return '#8aa800'; // Annoyed yellow-green
    if (score < 75) return '#d67c00'; // Frustrated orange
    return '#c80000'; // Absolute rage crimson
  };

  const currentTheme = THEMES[settings.theme] || THEMES.standard;

  return (
    <div className="win95-tabbed-dialog" id="app-settings">
      {/* Tab Header Row */}
      <div className="win95-tabs-row">
        <button
          className={`win95-tab-btn ${activeTab === 'display' ? 'active' : ''}`}
          onClick={() => { soundEngine.playClick(); setActiveTab('display'); }}
        >
          Display
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
          onClick={() => { soundEngine.playClick(); setActiveTab('behavior'); }}
        >
          Behavior
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'rage' ? 'active' : ''}`}
          onClick={() => { soundEngine.playClick(); setActiveTab('rage'); }}
        >
          Patience Engine
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'sound' ? 'active' : ''}`}
          onClick={() => { soundEngine.playClick(); setActiveTab('sound'); }}
        >
          Sound
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => { soundEngine.playClick(); setActiveTab('system'); }}
        >
          System
        </button>
      </div>

      {/* Main Tab Sheet Surface */}
      <div className="win95-tab-sheet">
        {/* =================================================================== */}
        {/* TAB 1: DISPLAY (APPEARANCE & THEMES) */}
        {/* =================================================================== */}
        {activeTab === 'display' && (
          <div className="tab-pane">
            {/* Authentic Windows 95 Display Monitor Live Preview Box */}
            <div className="win95-monitor-wrapper">
              <div className="win95-monitor-case">
                <div 
                  className="win95-monitor-screen"
                  style={{ backgroundColor: currentTheme.desktop }}
                >
                  {/* Miniature Desktop Contents Preview */}
                  <div className="monitor-mini-window">
                    <div className="monitor-mini-titlebar">
                      <span className="monitor-mini-title">Active Window</span>
                    </div>
                    <div style={{ padding: '3px 4px', fontSize: '6px', color: currentTheme.text }}>
                      Palette Preview
                    </div>
                  </div>

                  {/* Miniature Taskbar */}
                  <div className="monitor-mini-taskbar">
                    <div className="monitor-mini-start">Start</div>
                  </div>
                </div>
                <div className="win95-monitor-bezel-brand">RAGEWARE 98</div>
              </div>
              <div className="win95-monitor-neck" />
              <div className="win95-monitor-stand" />
            </div>

            <fieldset className="win95-fieldset">
              <legend>Desktop Theme &amp; Color Scheme</legend>
              <div className="win95-form-row">
                <label style={{ width: '100px' }}>Color Scheme:</label>
                <select 
                  className="win95-select" 
                  value={settings.theme}
                  onChange={(e) => {
                    const next = e.target.value;
                    updateSetting('theme', next);
                    systemSettings.applyTheme(next); // instant live visual preview
                  }}
                  style={{ flex: 1 }}
                >
                  {Object.values(THEMES).map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="win95-form-row" style={{ marginTop: '6px' }}>
                <label style={{ width: '100px' }}>Wallpaper:</label>
                <select 
                  className="win95-select"
                  value={settings.wallpaper}
                  onChange={(e) => updateSetting('wallpaper', e.target.value)}
                  style={{ flex: 1 }}
                >
                  {WALLPAPERS.map((wp) => (
                    <option key={wp.id} value={wp.id}>
                      {wp.name}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Display Performance &amp; Effects</legend>
              <label className="win95-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.dragContents}
                  onChange={(e) => updateSetting('dragContents', e.target.checked)}
                />
                <span>Show window contents while dragging (Uncheck for retro wireframe outline)</span>
              </label>

              <label className="win95-checkbox-label" style={{ marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={settings.crtScanlines}
                  onChange={(e) => updateSetting('crtScanlines', e.target.checked)}
                />
                <span>Enable Hardware CRT Phosphor Scanline Filter</span>
              </label>
            </fieldset>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: BEHAVIOR (ADVERSARIAL INTERACTION) */}
        {/* =================================================================== */}
        {activeTab === 'behavior' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Adversarial Interaction Intensity</legend>
              <div className="win95-radio-group">
                <label className="win95-radio-label">
                  <input
                    type="radio"
                    name="intensity"
                    value="LOW"
                    checked={settings.intensity === 'LOW'}
                    onChange={() => updateSetting('intensity', 'LOW')}
                  />
                  <span>Mild (Subtle button evasion shifts and slow 20-40s cooldowns)</span>
                </label>
                <label className="win95-radio-label">
                  <input
                    type="radio"
                    name="intensity"
                    value="NORMAL"
                    checked={settings.intensity === 'NORMAL'}
                    onChange={() => updateSetting('intensity', 'NORMAL')}
                  />
                  <span>Standard (Balanced evasion velocity, 10-22s pacing, occasional traps)</span>
                </label>
                <label className="win95-radio-label">
                  <input
                    type="radio"
                    name="intensity"
                    value="CHAOTIC"
                    checked={settings.intensity === 'CHAOTIC'}
                    onChange={() => updateSetting('intensity', 'CHAOTIC')}
                  />
                  <span>Aggressive (High evasion velocity, nested traps, rapid 2-5s cascades)</span>
                </label>
                <label className="win95-radio-label">
                  <input
                    type="radio"
                    name="intensity"
                    value="SAFE"
                    checked={settings.intensity === 'SAFE'}
                    onChange={() => updateSetting('intensity', 'SAFE')}
                  />
                  <span>Safe Shield (Completely halt all evasion, popups, and traps)</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Button Evasion Parameters</legend>
              <div className="win95-form-row">
                <label style={{ width: '130px' }}>Evasion Leap Radius:</label>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="10"
                  value={settings.evasionDistance || 80}
                  onChange={(e) => updateSetting('evasionDistance', Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ width: '50px', textAlign: 'right', fontWeight: 'bold' }}>
                  {settings.evasionDistance || 80}px
                </span>
              </div>

              {/* Interactive Live Evasion Sandbox Playground */}
              <div className="evasion-playground" style={{ marginTop: '8px' }}>
                <span className="evasion-playground-watermark">Interactive Evasion Sandbox Test</span>
                <button
                  className="win95-btn"
                  style={{
                    transform: `translate(${sandboxPos.x}px, ${sandboxPos.y}px)`,
                    transition: 'transform 0.12s ease-out',
                    zIndex: 2,
                  }}
                  onMouseEnter={handleSandboxHover}
                  onClick={() => {
                    soundEngine.playTada();
                    alert('Impressive reflexes! You actually clicked the evasive button.');
                  }}
                >
                  Try Clicking Me
                </button>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Sensory &amp; Learning Triggers</legend>
              <label className="win95-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.adaptiveRage}
                  onChange={(e) => updateSetting('adaptiveRage', e.target.checked)}
                />
                <span>Dynamic Rage Learning (Focus hostile triggers on user behavioral weaknesses)</span>
              </label>

              <label className="win95-checkbox-label" style={{ marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={settings.soundClicks}
                  onChange={(e) => updateSetting('soundClicks', e.target.checked)}
                />
                <span>Play mechanical PC speaker click sound on cursor evasion events</span>
              </label>

              <label className="win95-checkbox-label" style={{ marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={settings.ghostCursor}
                  onChange={(e) => updateSetting('ghostCursor', e.target.checked)}
                />
                <span>Deploy trailing Ghost Cursor (Lagging phantom pointer)</span>
              </label>
            </fieldset>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PATIENCE ENGINE (RAGE CALIBRATION) */}
        {/* =================================================================== */}
        {activeTab === 'rage' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Real-Time Emotional Telemetry</legend>
              <div className="rage-meter-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    Current Frustration Score: <strong>{profile.rageScore}</strong> / {profile.maxRage || 100}
                  </span>
                  <span 
                    className="rage-meter-badge"
                    style={{ backgroundColor: getRageMeterColor(profile.rageScore), color: '#ffffff' }}
                  >
                    {profile.level}
                  </span>
                </div>
                <div className="rage-meter-track">
                  <div 
                    className="rage-meter-fill"
                    style={{ 
                      width: `${Math.min(100, (profile.rageScore / (profile.maxRage || 100)) * 100)}%`,
                      backgroundColor: getRageMeterColor(profile.rageScore),
                    }}
                  />
                </div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                  Primary Weakness: <strong>{profile.strongestCategoryDisplay || 'MOVING INTERFACE ELEMENTS'}</strong>
                </div>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Cognitive Calibration Parameters</legend>
              <div className="win95-form-row">
                <label style={{ width: '150px' }}>Maximum Tolerable Rage:</label>
                <input
                  type="number"
                  className="win95-input"
                  min="50"
                  max="200"
                  step="10"
                  value={settings.maxRage || 100}
                  onChange={(e) => updateSetting('maxRage', Number(e.target.value))}
                  style={{ width: '90px' }}
                />
                <span style={{ fontSize: '10px', color: '#666' }}>pts (Threshold for Session Conclusion)</span>
              </div>

              <div className="win95-form-row" style={{ marginTop: '6px' }}>
                <label style={{ width: '150px' }}>Emotional Decay Rate:</label>
                <select
                  className="win95-select"
                  value={settings.decayRate}
                  onChange={(e) => updateSetting('decayRate', Number(e.target.value))}
                  style={{ width: '220px' }}
                >
                  <option value={0.2}>+0.2 pts/sec (Hostile Automatic Surge)</option>
                  <option value={0.0}>0.0 pts/sec (Frozen Rage — No Decay)</option>
                  <option value={-0.5}>-0.5 pts/sec (Windows Standard Cooldown)</option>
                  <option value={-1.5}>-1.5 pts/sec (Rapid Calm Recovery)</option>
                </select>
              </div>

              <div className="win95-form-row" style={{ marginTop: '6px' }}>
                <label style={{ width: '150px' }}>Frustration Multiplier:</label>
                <select
                  className="win95-select"
                  value={settings.frustrationMultiplier}
                  onChange={(e) => updateSetting('frustrationMultiplier', Number(e.target.value))}
                  style={{ width: '220px' }}
                >
                  <option value={1.0}>1.00x (Standard Friction)</option>
                  <option value={1.25}>1.25x (Elevated Penalty)</option>
                  <option value={1.5}>1.50x (Repeat Failure Aggravation)</option>
                  <option value={2.0}>2.00x (Punishing Double Penalty)</option>
                </select>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Hardware Sensor &amp; Optical Interface</legend>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="win95-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.opticalTracking}
                    onChange={(e) => updateSetting('opticalTracking', e.target.checked)}
                  />
                  <span>Webcam Optical Facial Landmark Tracking</span>
                </label>
                <button
                  className="win95-btn"
                  onClick={() => {
                    if (onOpenApp) onOpenApp('camera');
                  }}
                >
                  Launch Optical Sensor
                </button>
              </div>
            </fieldset>

            {/* Direct Engine Action Row */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button className="win95-btn" onClick={handleTestRageSpike}>
                Test Rage Spike (+15)
              </button>
              <button className="win95-btn" onClick={handleResetRage}>
                Reset Rage &amp; Telemetry
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: SOUND (AUDIO & SYNTHESIZER SOUNDBOARD) */}
        {/* =================================================================== */}
        {activeTab === 'sound' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Master Audio Volume &amp; Mute</legend>
              <div className="win95-form-row">
                <label style={{ width: '110px' }}>Master Volume:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume ?? 85}
                  onChange={handleVolumeChange}
                  disabled={settings.isMuted}
                  style={{ flex: 1 }}
                />
                <span style={{ width: '45px', textAlign: 'right', fontWeight: 'bold' }}>
                  {settings.isMuted ? 'Muted' : `${settings.masterVolume}%`}
                </span>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', gap: '20px' }}>
                <label className="win95-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.isMuted}
                    onChange={handleMuteToggle}
                  />
                  <span>Mute all operating system sounds</span>
                </label>

                <label className="win95-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.pcSpeakerEnabled}
                    onChange={(e) => updateSetting('pcSpeakerEnabled', e.target.checked)}
                  />
                  <span>Enable PC Speaker 750Hz hardware emulation</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Synthesized Retro Soundboard &amp; Event Tester</legend>
              <p style={{ fontSize: '10px', color: '#555', marginBottom: '8px' }}>
                All sounds are synthesized completely offline in real-time via Web Audio API oscillators and filters:
              </p>

              <div className="win95-form-row">
                <label style={{ width: '110px' }}>Select Sound Event:</label>
                <select
                  className="win95-select"
                  value={testSoundId}
                  onChange={(e) => setTestSoundId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {SOUND_LIST.map((snd) => (
                    <option key={snd.id} value={snd.id}>
                      {snd.name}
                    </option>
                  ))}
                </select>
                <button 
                  className="win95-btn" 
                  onClick={handleTestSound}
                  style={{ minWidth: '95px', fontWeight: 'bold' }}
                >
                  ▶ Play Sound
                </button>
              </div>

              <div style={{ 
                marginTop: '8px', 
                padding: '6px 8px', 
                background: '#ffffff', 
                border: '1px solid #808080', 
                fontSize: '10px', 
                color: '#333' 
              }}>
                <strong>Description:</strong>{' '}
                {SOUND_LIST.find((s) => s.id === testSoundId)?.desc || 'Synthesized retro audio effect'}
              </div>
            </fieldset>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: SYSTEM (COMPUTER PROPERTIES & DEVICE MANAGER) */}
        {/* =================================================================== */}
        {activeTab === 'system' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Computer Information &amp; Licensing</legend>
              <div className="sys-info-table">
                <div className="sys-info-row">
                  <span>Operating System:</span>
                  <strong>RAGEWARE 98 (Synthetic Build 2200, SP1)</strong>
                </div>
                <div className="sys-info-row">
                  <span>Processor Unit:</span>
                  <span>Pentium II Adversarial Emotion Coprocessor @ 333 MHz</span>
                </div>
                <div className="sys-info-row">
                  <span>Allocated Memory:</span>
                  <span>65,536 KB RAM (Virtual Swap: 131,072 KB)</span>
                </div>
                <div className="sys-info-row">
                  <span>Live System Uptime:</span>
                  <strong style={{ color: '#000080' }}>{formatUptime(uptimeSec)}</strong>
                </div>
                <div className="sys-info-row">
                  <span>Architecture:</span>
                  <span className="text-success">100% Localhost In-Browser Virtualization</span>
                </div>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>User Registration</legend>
              <div className="win95-form-row">
                <label style={{ width: '100px' }}>Registered To:</label>
                <input
                  type="text"
                  className="win95-input"
                  value={settings.registeredOwner || ''}
                  onChange={(e) => updateSetting('registeredOwner', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <div className="win95-form-row" style={{ marginTop: '4px' }}>
                <label style={{ width: '100px' }}>Organization:</label>
                <input
                  type="text"
                  className="win95-input"
                  value={settings.registeredOrg || ''}
                  onChange={(e) => updateSetting('registeredOrg', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Virtual Hardware Device Manager</legend>
              <div className="device-manager-box">
                {/* Display Adapter */}
                <div 
                  className="device-tree-item"
                  onClick={() => setExpandedDeviceGroup(expandedDeviceGroup === 'display' ? null : 'display')}
                >
                  <span>{expandedDeviceGroup === 'display' ? '[-] ' : '[+] '}</span>
                  <strong>Display Adapters</strong>
                </div>
                {expandedDeviceGroup === 'display' && (
                  <div 
                    className={`device-tree-item device-tree-child ${selectedDevice === 's3-virge' ? 'selected' : ''}`}
                    onClick={() => setSelectedDevice('s3-virge')}
                  >
                    🖥️ S3 ViRGE/DX 3D Accelerator (4MB VRAM, PCI)
                  </div>
                )}

                {/* Mouse */}
                <div 
                  className="device-tree-item"
                  onClick={() => setExpandedDeviceGroup(expandedDeviceGroup === 'mouse' ? null : 'mouse')}
                >
                  <span>{expandedDeviceGroup === 'mouse' ? '[-] ' : '[+] '}</span>
                  <strong>Mouse &amp; Pointing Devices</strong>
                </div>
                {expandedDeviceGroup === 'mouse' && (
                  <div 
                    className={`device-tree-item device-tree-child ${selectedDevice === 'ps2-mouse' ? 'selected' : ''}`}
                    onClick={() => setSelectedDevice('ps2-mouse')}
                  >
                    🖱️ Hostile PS/2 Trackball with Evasion Firmware v1.4
                  </div>
                )}

                {/* Keyboard */}
                <div 
                  className="device-tree-item"
                  onClick={() => setExpandedDeviceGroup(expandedDeviceGroup === 'kb' ? null : 'kb')}
                >
                  <span>{expandedDeviceGroup === 'kb' ? '[-] ' : '[+] '}</span>
                  <strong>Keyboards</strong>
                </div>
                {expandedDeviceGroup === 'kb' && (
                  <div 
                    className={`device-tree-item device-tree-child ${selectedDevice === 'model-m' ? 'selected' : ''}`}
                    onClick={() => setSelectedDevice('model-m')}
                  >
                    ⌨️ Standard 101/102-Key IBM Model M Mechanical
                  </div>
                )}

                {/* Sound */}
                <div 
                  className="device-tree-item"
                  onClick={() => setExpandedDeviceGroup(expandedDeviceGroup === 'sound' ? null : 'sound')}
                >
                  <span>{expandedDeviceGroup === 'sound' ? '[-] ' : '[+] '}</span>
                  <strong>Sound, Video &amp; Game Controllers</strong>
                </div>
                {expandedDeviceGroup === 'sound' && (
                  <div 
                    className={`device-tree-item device-tree-child ${selectedDevice === 'sound-blaster' ? 'selected' : ''}`}
                    onClick={() => setSelectedDevice('sound-blaster')}
                  >
                    🔊 Creative Sound Blaster 16 AWE32 (Web Audio Synth)
                  </div>
                )}

                {/* Biometrics */}
                <div 
                  className="device-tree-item"
                  onClick={() => setExpandedDeviceGroup(expandedDeviceGroup === 'bio' ? null : 'bio')}
                >
                  <span>{expandedDeviceGroup === 'bio' ? '[-] ' : '[+] '}</span>
                  <strong>Biometric &amp; Emotion Sensors</strong>
                </div>
                {expandedDeviceGroup === 'bio' && (
                  <div 
                    className={`device-tree-item device-tree-child ${selectedDevice === 'landmark-sensor' ? 'selected' : ''}`}
                    onClick={() => setSelectedDevice('landmark-sensor')}
                  >
                    🧠 Optical Facial Landmark Coprocessor (Status: Standby)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '10px', color: '#008000', fontWeight: 'bold' }}>
                  ✓ Selected hardware device is operating properly.
                </span>
                <button
                  className="win95-btn"
                  onClick={() => {
                    if (onOpenApp) onOpenApp('system-monitor');
                  }}
                >
                  Launch System Monitor
                </button>
              </div>
            </fieldset>

            {/* System Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button 
                className="win95-btn" 
                onClick={handleRestoreDefaults}
              >
                Reset All Settings to Defaults
              </button>
              <button 
                className="win95-btn" 
                onClick={() => {
                  if (onReboot) onReboot();
                }}
              >
                Reboot System
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Status Strip */}
      <div style={{ 
        padding: '3px 8px', 
        fontSize: '10px', 
        color: statusText.includes('success') ? '#006600' : '#444', 
        borderTop: '1px solid #dfdfdf',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Status: <strong>{statusText}</strong></span>
        <span>RageWare OS 4.10</span>
      </div>

      {/* Dialog Bottom Action Row */}
      <div className="win95-dialog-footer">
        <button 
          className="win95-btn default-btn" 
          onClick={() => handleApply(true)}
          style={{ minWidth: '75px' }}
        >
          OK
        </button>
        <button 
          className="win95-btn" 
          onClick={handleCancel}
          style={{ minWidth: '75px' }}
        >
          Cancel
        </button>
        <button 
          className="win95-btn" 
          onClick={() => handleApply(false)}
          style={{ minWidth: '75px' }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

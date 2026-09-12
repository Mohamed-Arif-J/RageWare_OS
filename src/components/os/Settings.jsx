import React, { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('behavior'); // 'behavior' | 'rage' | 'appearance' | 'system'
  const [intensity, setIntensity] = useState('CHAOTIC');
  const [winAnimations, setWinAnimations] = useState(true);
  const [adaptiveRage, setAdaptiveRage] = useState(true);
  const [soundClicks, setSoundClicks] = useState(false);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);

  return (
    <div className="win95-tabbed-dialog" id="app-settings">
      {/* Tab Row */}
      <div className="win95-tabs-row">
        <button
          className={`win95-tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
          onClick={() => setActiveTab('behavior')}
        >
          Behavior
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'rage' ? 'active' : ''}`}
          onClick={() => setActiveTab('rage')}
        >
          Patience Engine
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Display
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>

      {/* Tab Sheet Surface */}
      <div className="win95-tab-sheet">
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
                    checked={intensity === 'LOW'}
                    onChange={() => setIntensity('LOW')}
                  />
                  <span>Mild (Subtle button shifts and modest delays)</span>
                </label>
                <label className="win95-radio-label">
                  <input
                    type="radio"
                    name="intensity"
                    value="NORMAL"
                    checked={intensity === 'NORMAL'}
                    onChange={() => setIntensity('NORMAL')}
                  />
                  <span>Standard (Normal evasion velocity and random prompts)</span>
                </label>
                <label className="win95-radio-label">
                  <input
                    type="radio"
                    name="intensity"
                    value="CHAOTIC"
                    checked={intensity === 'CHAOTIC'}
                    onChange={() => setIntensity('CHAOTIC')}
                  />
                  <span>Aggressive (High evasion velocity, nested confirmation traps)</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Adaptive Options</legend>
              <label className="win95-checkbox-label">
                <input
                  type="checkbox"
                  checked={adaptiveRage}
                  onChange={(e) => setAdaptiveRage(e.target.checked)}
                />
                <span>Enable Dynamic Rage Learning (Focus hostile triggers on user weaknesses)</span>
              </label>

              <label className="win95-checkbox-label">
                <input
                  type="checkbox"
                  checked={soundClicks}
                  onChange={(e) => setSoundClicks(e.target.checked)}
                />
                <span>Play PC Speaker click sound on cursor evasion events</span>
              </label>
            </fieldset>
          </div>
        )}

        {activeTab === 'rage' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Cognitive Calibration Parameters</legend>
              <div className="win95-form-row">
                <label>Maximum Tolerable Rage:</label>
                <input
                  type="text"
                  className="win95-input"
                  value="100 (Arbitrary Ceiling)"
                  readOnly
                  style={{ width: '160px' }}
                />
              </div>

              <div className="win95-form-row">
                <label>Emotional Decay Rate:</label>
                <input
                  type="text"
                  className="win95-input"
                  value="-0.5 pts / sec of calm"
                  readOnly
                  style={{ width: '160px' }}
                />
              </div>

              <div className="win95-form-row">
                <label>Frustration Penalty Multiplier:</label>
                <input
                  type="text"
                  className="win95-input"
                  value="1.25x Repeat Failure"
                  readOnly
                  style={{ width: '160px' }}
                />
              </div>
            </fieldset>

            <fieldset className="win95-fieldset">
              <legend>Hardware Sensor Interface</legend>
              <p className="fieldset-desc">
                Webcam & optical facial landmark tracking is reserved for Step 4. All biometric calculations currently use deterministic interaction analytics.
              </p>
            </fieldset>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Desktop Appearance</legend>
              <div className="win95-form-row">
                <label>Color Scheme:</label>
                <select className="win95-select" defaultValue="standard" style={{ width: '200px' }}>
                  <option value="standard">Windows Standard (Teal #008080)</option>
                  <option value="high-contrast">High Contrast #1</option>
                  <option value="rainy-day">Rainy Day Slate</option>
                </select>
              </div>

              <label className="win95-checkbox-label">
                <input
                  type="checkbox"
                  checked={winAnimations}
                  onChange={(e) => setWinAnimations(e.target.checked)}
                />
                <span>Show window contents while dragging</span>
              </label>

              <label className="win95-checkbox-label">
                <input
                  type="checkbox"
                  checked={hardwareAcceleration}
                  onChange={(e) => setHardwareAcceleration(e.target.checked)}
                />
                <span>Hardware 2D Graphic Acceleration</span>
              </label>
            </fieldset>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="tab-pane">
            <fieldset className="win95-fieldset">
              <legend>Computer Information</legend>
              <div className="sys-info-table">
                <div className="sys-info-row">
                  <span>System:</span>
                  <strong>RAGEWARE 98 Operating System</strong>
                </div>
                <div className="sys-info-row">
                  <span>Version:</span>
                  <span>4.10.1998 (Synthetic Build 2200)</span>
                </div>
                <div className="sys-info-row">
                  <span>Registered To:</span>
                  <span>Adversarial Cognitive Benchmark</span>
                </div>
                <div className="sys-info-row">
                  <span>Privacy:</span>
                  <span className="text-success">100% Localhost Virtualization</span>
                </div>
              </div>
            </fieldset>
          </div>
        )}
      </div>

      {/* Dialog Bottom Action Row */}
      <div className="win95-dialog-footer">
        <button className="win95-btn default-btn" onClick={() => {}}>OK</button>
        <button className="win95-btn" onClick={() => {}}>Cancel</button>
        <button className="win95-btn" onClick={() => {}}>Apply</button>
      </div>
    </div>
  );
}

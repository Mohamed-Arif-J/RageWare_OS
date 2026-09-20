import React, { useState, useEffect } from 'react';
import { getRageProfile, increaseRage, RAGE_EVENTS } from '../../engine/rageEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';
import { soundEngine } from '../../engine/soundEngine';
import { mouseTracker } from '../../services/mouseTracker';

export default function SystemMonitor({
  openWindowsCount = 1,
  profile: propProfile,
  windows = [],
  onCloseWindow,
  onOpenApp,
  onClose,
  isChaosMode = true,
  onRageUpdate,
}) {
  const [activeTab, setActiveTab] = useState('performance');
  const [cpuVal, setCpuVal] = useState(24);
  const [memVal, setMemVal] = useState(48);
  const [threads, setThreads] = useState(64);
  const [cpuHistory, setCpuHistory] = useState([20, 25, 18, 30, 22, 19, 28, 24, 21, 26, 32, 28, 24]);
  // Step 7: Live-polling profile so data is never stale (fixes audit bug #4)
  const [profile, setProfile] = useState(() => propProfile || getRageProfile());
  const [mouseTelemetry, setMouseTelemetry] = useState(() => mouseTracker.getTelemetry());

  useEffect(() => {
    if (propProfile) setProfile(propProfile);
  }, [propProfile]);

  useEffect(() => {
    // Poll the rage profile and mouse telemetry every 1s
    const profileTimer = setInterval(() => {
      setProfile(getRageProfile());
      setMouseTelemetry(mouseTracker.getTelemetry());
    }, 1000);

    const timer = setInterval(() => {
      const nextCpu = Math.floor(16 + Math.random() * 20);
      setCpuVal(nextCpu);
      setMemVal(Math.floor(46 + Math.random() * 6));
      setThreads(Math.floor(60 + Math.random() * 8));
      setCpuHistory((prev) => [...prev.slice(1), nextCpu]);
    }, 1400);

    return () => {
      clearInterval(profileTimer);
      clearInterval(timer);
    };
  }, []);

  const [selectedProcessKey, setSelectedProcessKey] = useState('patience');
  const [endProcessFeedback, setEndProcessFeedback] = useState('');

  // Build live process table combining open windows and system threads
  const windowProcesses = (windows || []).map((w, idx) => {
    let imgName = 'APP.EXE';
    if (w.appId === 'notepad') imgName = 'NOTEPAD.EXE';
    else if (w.appId === 'terminal') imgName = 'COMMAND.COM';
    else if (w.appId === 'file-manager') imgName = 'EXPLORER.EXE';
    else if (w.appId === 'system-update') imgName = 'SETUP.EXE';
    else if (w.appId === 'settings') imgName = 'CONTROL.EXE';
    else if (w.appId === 'camera') imgName = 'VFW32.EXE';
    else if (w.appId === 'caught-in-4k') imgName = 'IEXPLORE.EXE';
    else if (w.appId === 'gesture-drive') imgName = 'GDRIVE.EXE';
    else if (w.appId === 'naas') imgName = 'NAAS_SVC.EXE';
    else if (w.appId === 'nobrowser') imgName = 'NOBROWSE.EXE';
    else imgName = `${(w.appId || 'app').toUpperCase()}.EXE`;

    return {
      key: w.id,
      name: imgName,
      pid: 1000 + (idx * 42),
      cpu: `${Math.max(1, (idx + 1) * 3)}%`,
      mem: `${4000 + (idx * 1200)} K`,
      isWindow: true,
      windowId: w.id,
      appId: w.appId,
    };
  });

  const staticProcesses = [
    { key: 'patience', name: 'PATIENCE.EXE', pid: '001', cpu: `${Math.max(0, 100 - (profile.rageScore || 0))}%`, mem: '64 K', isWindow: false },
    { key: 'rageware', name: 'RAGEWARE.EXE', pid: '999', cpu: `${cpuVal}%`, mem: '18,420 K', isWindow: false },
    { key: 'explorer', name: 'EXPLORER.SYS', pid: '100', cpu: '02%', mem: '8,912 K', isWindow: false },
    { key: 'kernel', name: 'KERNEL32.DLL', pid: '004', cpu: '01%', mem: '2,140 K', isWindow: false },
  ];

  const allProcesses = [...windowProcesses, ...staticProcesses];

  const handleEndProcess = () => {
    const target = allProcesses.find((p) => p.key === selectedProcessKey);
    if (!target) return;

    soundEngine.playClick();

    // 1. Ending an actual open window
    if (target.isWindow && target.windowId) {
      if (onCloseWindow) onCloseWindow(target.windowId);

      if (!isChaosMode) {
        soundEngine.playDing();
        setEndProcessFeedback(`Process ${target.name} terminated cleanly.`);
        return;
      }

      // Chaos Mode: Hydra Protocol retaliation!
      soundEngine.playChord();
      setEndProcessFeedback(`Terminated ${target.name}...`);

      setTimeout(() => {
        soundEngine.playExclamation();
        setEndProcessFeedback(`⚠️ HYDRA PROTOCOL: ${target.name} multiplied into 2 threads!`);
        if (onOpenApp && target.appId) {
          onOpenApp(target.appId);
          setTimeout(() => onOpenApp(target.appId), 600);
        }
      }, 1600);
      return;
    }

    // 2. Ending PATIENCE.EXE
    if (target.key === 'patience') {
      soundEngine.playCriticalStop();
      increaseRage(15, RAGE_EVENTS.INCORRECT_ACTION);
      if (onRageUpdate) onRageUpdate();
      alert('FATAL: You have killed PATIENCE.EXE.\nAll behavioral restraint has been permanently disengaged.');
      setEndProcessFeedback('PATIENCE.EXE status: DEAD.');
      return;
    }

    // 3. Ending RAGEWARE.EXE
    if (target.key === 'rageware') {
      soundEngine.playExclamation();
      alert('RAGEWARE.EXE refused termination.\nIn retaliation, it has terminated System Monitor.');
      if (onClose) onClose();
      return;
    }

    // 4. Ending EXPLORER.SYS
    if (target.key === 'explorer') {
      soundEngine.playBoing();
      setEndProcessFeedback('EXPLORER.SYS restarted due to user insubordination.');
      return;
    }

    // Default
    soundEngine.playExclamation();
    alert('Process termination rejected by System Watchdog.');
  };

  return (
    <div className="win95-tabbed-dialog" id="app-sysmon">
      {/* Notebook Tab Bar */}
      <div className="win95-tabs-row">
        <button
          className={`win95-tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          Processes ({allProcesses.length})
        </button>
        <button
          className={`win95-tab-btn ${activeTab === 'rage' ? 'active' : ''}`}
          onClick={() => setActiveTab('rage')}
        >
          Rage Diagnostics
        </button>
      </div>

      {/* Tab Sheet Surface */}
      <div className="win95-tab-sheet">
        {activeTab === 'performance' && (
          <div className="tab-pane">
            {/* CPU CRT Oscilloscope Box */}
            <fieldset className="win95-fieldset">
              <legend>CPU Usage History</legend>
              <div className="crt-oscilloscope-frame">
                <div className="crt-grid-bg">
                  {cpuHistory.map((val, idx) => (
                    <div key={idx} className="crt-col" title={`${val}%`}>
                      <div className="crt-bar" style={{ height: `${val}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="crt-legend-row">
                <span>CPU Usage: <strong>{cpuVal}%</strong></span>
                <span>Kernel Time: <strong>{Math.floor(cpuVal * 0.4)}%</strong></span>
              </div>
            </fieldset>

            {/* Memory & Rage Indicators */}
            <div className="sysmon-two-col">
              <fieldset className="win95-fieldset">
                <legend>Memory Usage</legend>
                <div className="meter-wrapper">
                  <div className="win95-progressbar-track">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`win95-progressbar-block ${i < Math.round((memVal / 100) * 16) ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="meter-label">Physical Memory: {memVal}% In Use</div>
                </div>
              </fieldset>

              <fieldset className="win95-fieldset">
                <legend>Rage Acceleration</legend>
                <div className="meter-wrapper">
                  <div className="win95-progressbar-track">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`win95-progressbar-block ${(profile.rageScore || 0) > i * 6 ? 'filled danger' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="meter-label">
                    Friction Factor: <strong>{(profile.rageScore || 0)}%</strong>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="tab-pane">
            <div className="win95-listview-frame" style={{ height: '220px', overflowY: 'auto' }}>
              <div className="listview-header">
                <span style={{ width: '45%' }}>Image Name</span>
                <span style={{ width: '15%' }}>PID</span>
                <span style={{ width: '20%' }}>CPU</span>
                <span style={{ width: '20%' }}>Mem Usage</span>
              </div>
              <div className="listview-rows">
                {allProcesses.map((proc) => (
                  <div
                    key={proc.key}
                    className={`listview-row ${selectedProcessKey === proc.key ? 'selected' : ''}`}
                    onClick={() => setSelectedProcessKey(proc.key)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span style={{ width: '45%', fontWeight: proc.isWindow ? 'bold' : 'normal' }}>
                      {proc.isWindow ? '🗔 ' : '⚙️ '}{proc.name}
                    </span>
                    <span style={{ width: '15%' }}>{proc.pid}</span>
                    <span style={{ width: '20%' }}>{proc.cpu}</span>
                    <span style={{ width: '20%' }}>{proc.mem}</span>
                  </div>
                ))}
              </div>
            </div>

            {endProcessFeedback && (
              <div className="sysmon-feedback-note" style={{ fontSize: '11px', color: '#B00000', margin: '4px 0', fontWeight: 'bold' }}>
                {endProcessFeedback}
              </div>
            )}

            <div className="pane-btn-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#555' }}>
                Selected: <strong>{selectedProcessKey}</strong>
              </span>
              <button
                className="win95-btn"
                onClick={handleEndProcess}
                style={{ fontWeight: 'bold' }}
              >
                End Process
              </button>
            </div>
          </div>
        )}

        {activeTab === 'rage' && (
          <div className="tab-pane">
            {/* Step 7: User Analysis section with real session data */}
            <fieldset className="win95-fieldset">
              <legend>RAGEWARE USER ANALYSIS</legend>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', background: '#000', color: '#00ff66', padding: '8px', border: '1px solid #555' }}>
                <div style={{ color: '#00e5ff', fontWeight: 'bold', marginBottom: '4px' }}>SYSTEM STATUS: <span style={{ color: '#00ff66' }}>OPERATIONAL</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px', marginBottom: '6px', color: '#ccc' }}>
                  <div>Rage Score: <strong style={{ color: profile.rageScore > 60 ? '#ff4444' : '#ffcc00' }}>{profile.rageScore}%</strong></div>
                  <div>Level: <strong style={{ color: '#ff8800' }}>{(profile.level || 'CALM').toUpperCase()}</strong></div>
                  <div>Interactions: <strong>{profile.meaningfulInteractions}</strong></div>
                  <div>Failures: <strong style={{ color: '#ff4444' }}>{profile.failedChallenges}</strong></div>
                  <div>Successes: <strong style={{ color: '#00ff66' }}>{profile.successfulChallenges}</strong></div>
                  <div>Events: <strong>{profile.frustrationEvents}</strong></div>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '6px' }}>
                  <div style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '11px' }}>PRIMARY FRUSTRATION:</div>
                  <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '14px', marginTop: '2px' }}>
                    {profile.strongestCategoryDisplay || 'MOVING INTERFACE ELEMENTS'}
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Step 7: System Activity — fictional bars reflecting real rage-derived values */}
            <fieldset className="win95-fieldset" style={{ marginTop: '6px' }}>
              <legend>RAGEWARE SYSTEM ACTIVITY</legend>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', background: '#000', color: '#00ff66', padding: '8px', border: '1px solid #555', lineHeight: '1.8' }}>
                {[{
                  label: 'System Process',
                  value: Math.min(95, 20 + profile.frustrationEvents * 3),
                }, {
                  label: 'User Analysis',
                  value: Math.min(95, 10 + profile.meaningfulInteractions * 4),
                }, {
                  label: 'Frustration Analysis',
                  value: Math.min(100, profile.rageScore),
                }, {
                  label: 'Adaptive Friction',
                  value: Math.min(95, 15 + profile.failedChallenges * 6),
                }, {
                  label: 'Patience Erosion',
                  value: Math.min(100, profile.rageScore * 0.9 + profile.failedChallenges * 2),
                }].map((item) => {
                  const filled = Math.round((item.value / 100) * 16);
                  const bar = '█'.repeat(filled) + '░'.repeat(16 - filled);
                  return (
                    <div key={item.label}>
                      <span style={{ color: '#aaa', display: 'inline-block', width: '150px' }}>{item.label}</span>
                      <span style={{ color: item.value > 70 ? '#ff4444' : '#00e5ff' }}>{bar}</span>
                      <span style={{ color: '#888', marginLeft: '6px' }}>{Math.round(item.value)}%</span>
                    </div>
                  );
                })}
                <div style={{ color: '#666', fontSize: '10px', marginTop: '4px', borderTop: '1px solid #222', paddingTop: '4px' }}>
                  [All values are fictional RAGEWARE diagnostic metrics.]
                </div>
              </div>
            </fieldset>

            <fieldset className="win95-fieldset" style={{ marginTop: '6px' }}>
              <legend>ADAPTIVE FRUSTRATION VECTORS</legend>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', background: '#000', color: '#00ff66', padding: '8px', border: '1px solid #555' }}>
                {[{
                  label: 'Moving Buttons  ',
                  score: profile.categories?.movingButtons || 0,
                  key: 'movingButtons',
                }, {
                  label: 'Window Controls ',
                  score: profile.categories?.windowManipulation || 0,
                  key: 'windowManipulation',
                }, {
                  label: 'Fake Loading    ',
                  score: profile.categories?.fakeLoading || 0,
                  key: 'fakeLoading',
                }, {
                  label: 'File Interaction',
                  score: profile.categories?.fileInteraction || 0,
                  key: 'fileInteraction',
                }, {
                  label: 'Terminal        ',
                  score: profile.categories?.terminalInteraction || 0,
                  key: 'terminalInteraction',
                }, {
                  label: 'Precision       ',
                  score: profile.categories?.precision || 0,
                  key: 'precision',
                }].map((item) => {
                  const barLength = Math.min(14, Math.round((item.score / 80) * 14));
                  const bar = '█'.repeat(barLength).padEnd(14, '░');
                  const isPrimary = profile.strongestCategory === item.key;
                  return (
                    <div key={item.key} style={{ color: isPrimary ? '#ff4444' : '#00ff66', lineHeight: '1.5' }}>
                      <span>{item.label} </span>
                      <span style={{ color: isPrimary ? '#ff3333' : '#00e5ff' }}>{bar}</span>
                      <span style={{ marginLeft: '6px' }}>{item.score}</span>
                      {isPrimary && <span style={{ marginLeft: '4px', fontSize: '10px', color: '#ff8800' }}>◄ PRIMARY</span>}
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* Personality Matrix */}
            <fieldset className="win95-fieldset" style={{ marginTop: '6px' }}>
              <legend>OS PERSONALITY MATRIX</legend>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', background: '#000', color: '#00ff66', padding: '8px', border: '1px solid #555' }}>
                {(() => {
                  const m = osPersonalityInstance.getPersonalityMetrics();
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px', marginBottom: '6px', color: '#ccc' }}>
                        <div>Awareness : <strong style={{ color: '#00e5ff' }}>{m.awareness}%</strong></div>
                        <div>Sarcasm   : <strong style={{ color: '#ff8800' }}>{m.sarcasm}%</strong></div>
                        <div>Hostility : <strong style={{ color: '#ff4444' }}>{m.hostility}%</strong></div>
                        <div>Stage     : <strong style={{ color: '#ffcc00' }}>{m.stage}</strong></div>
                      </div>
                      <div style={{ borderTop: '1px solid #333', paddingTop: '5px' }}>
                        <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '2px' }}>RECENT BEHAVIORS:</div>
                        {m.recentBehaviors.map((b, i) => (
                          <div key={i} style={{ color: '#999', fontSize: '10px' }}>&#62; {b}</div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </fieldset>

            {/* Live Biometric & Ergonomic Tracking */}
            <fieldset className="win95-fieldset" style={{ marginTop: '6px' }}>
              <legend>OPTICAL & MOUSE ERGONOMIC TELEMETRY</legend>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', background: '#000', color: '#00ff66', padding: '8px', border: '1px solid #555' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', color: '#ccc' }}>
                  <div>Optical Sensor : <strong style={{ color: profile.isCameraActive ? '#00ff66' : '#888' }}>{profile.isCameraActive ? 'ONLINE (TRACKING)' : 'OFFLINE'}</strong></div>
                  <div>Reaction Window: <strong style={{ color: '#00e5ff' }}>{profile.reactionWindow || 'MONITORING'}</strong></div>
                  <div>Cursor Velocity: <strong style={{ color: '#00e5ff' }}>{mouseTelemetry?.speed || 0} px/ms</strong></div>
                  <div>Mouse Jitter   : <strong style={{ color: mouseTelemetry?.isShaking ? '#ff4444' : '#00ff66' }}>{mouseTelemetry?.shakeScore || 0}% {mouseTelemetry?.isShaking ? '⚠️ (SHAKING)' : ''}</strong></div>
                  <div>Click Rate     : <strong style={{ color: (mouseTelemetry?.clickRate || 0) > 3 ? '#ffaa00' : '#ccc' }}>{mouseTelemetry?.clickRate || 0} / sec</strong></div>
                  <div>Total Clicks   : <strong style={{ color: '#ccc' }}>{mouseTelemetry?.totalClicks || 0}</strong></div>
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

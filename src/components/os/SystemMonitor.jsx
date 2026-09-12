import React, { useState, useEffect } from 'react';
import { getRageProfile } from '../../engine/rageEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';

export default function SystemMonitor({ openWindowsCount = 1, profile: propProfile }) {
  const [activeTab, setActiveTab] = useState('performance');
  const [cpuVal, setCpuVal] = useState(24);
  const [memVal, setMemVal] = useState(48);
  const [threads, setThreads] = useState(64);
  const [cpuHistory, setCpuHistory] = useState([20, 25, 18, 30, 22, 19, 28, 24, 21, 26, 32, 28, 24]);
  // Step 7: Live-polling profile so data is never stale (fixes audit bug #4)
  const [profile, setProfile] = useState(() => propProfile || getRageProfile());

  useEffect(() => {
    if (propProfile) setProfile(propProfile);
  }, [propProfile]);

  useEffect(() => {
    // Poll the rage profile every 1.5s so Rage Diagnostics tab stays live
    const profileTimer = setInterval(() => {
      setProfile(getRageProfile());
    }, 1500);

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
          Processes
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
                <legend>Patience Index</legend>
                <div className="meter-wrapper">
                  <div className="win95-progressbar-track">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`win95-progressbar-block ${
                          i < Math.round((profile.rageScore / 100) * 16) ? (profile.rageScore > 50 ? 'failed' : 'filled') : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="meter-label">
                    Rage: <strong>{profile.rageScore}%</strong> ({profile.level})
                  </div>
                </div>
              </fieldset>
            </div>

            {/* System Totals */}
            <fieldset className="win95-fieldset">
              <legend>Totals</legend>
              <div className="sysmon-totals-grid">
                <div>Handles: <strong>4,291</strong></div>
                <div>Threads: <strong>{threads}</strong></div>
                <div>Processes: <strong>{15 + openWindowsCount}</strong></div>
                <div>Friction Events: <strong className="text-danger">{profile.frustrationEvents}</strong></div>
              </div>
            </fieldset>
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="tab-pane">
            <div className="win95-listview-frame">
              <div className="listview-header">
                <span style={{ width: '40%' }}>Image Name</span>
                <span style={{ width: '20%' }}>PID</span>
                <span style={{ width: '20%' }}>CPU</span>
                <span style={{ width: '20%' }}>Mem Usage</span>
              </div>
              <div className="listview-rows">
                <div className="listview-row selected">
                  <span style={{ width: '40%' }}>RAGEWARE.EXE</span>
                  <span style={{ width: '20%' }}>1044</span>
                  <span style={{ width: '20%' }}>{cpuVal - 8}%</span>
                  <span style={{ width: '20%' }}>18,420 K</span>
                </div>
                <div className="listview-row">
                  <span style={{ width: '40%' }}>EXPLORER.EXE</span>
                  <span style={{ width: '20%' }}>842</span>
                  <span style={{ width: '20%' }}>02%</span>
                  <span style={{ width: '20%' }}>8,912 K</span>
                </div>
                <div className="listview-row">
                  <span style={{ width: '40%' }}>KERNEL32.SYS</span>
                  <span style={{ width: '20%' }}>004</span>
                  <span style={{ width: '20%' }}>03%</span>
                  <span style={{ width: '20%' }}>2,140 K</span>
                </div>
                <div className="listview-row">
                  <span style={{ width: '40%' }}>EVASIVE_SVC.EXE</span>
                  <span style={{ width: '20%' }}>608</span>
                  <span style={{ width: '20%' }}>05%</span>
                  <span style={{ width: '20%' }}>4,310 K</span>
                </div>
                <div className="listview-row">
                  <span style={{ width: '40%' }}>SPOOL32.EXE</span>
                  <span style={{ width: '20%' }}>312</span>
                  <span style={{ width: '20%' }}>00%</span>
                  <span style={{ width: '20%' }}>1,024 K</span>
                </div>
              </div>
            </div>
            <div className="pane-btn-row">
              <button
                className="win95-btn"
                onClick={() => alert('Access Denied: Protected system process.')}
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

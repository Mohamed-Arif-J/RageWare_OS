import React, { useState } from 'react';
import { IconRage, IconBrowser, IconCaughtIn4K, IconFolder, IconMail, IconCpu, IconCamera, IconTerminal, IconActivity, IconNaaS, IconGestureDrive, IconPaint } from './OSIcons';
import { systemSettings } from '../../services/systemSettings';
import { soundEngine } from '../../engine/soundEngine';

export default function AboutApp({ onClose }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'apps' | 'team'

  const registeredOwner = systemSettings.get('registeredOwner') || 'Adversarial Cognitive Benchmark';
  const registeredOrg = systemSettings.get('registeredOrg') || 'College Evaluation & Research Edition';

  const handleTabClick = (tabId) => {
    soundEngine.playClick();
    setActiveTab(tabId);
  };

  return (
    <div className="win95-about-shell" id="app-about">
      {/* Top Banner with Flag / Emblem */}
      <div className="about-header-banner">
        <div className="about-logo-box">
          <IconRage size={36} />
        </div>
        <div className="about-header-text">
          <h2 className="about-os-title">RAGEWARE 98</h2>
          <div className="about-build-ver">Version 4.10.1998 (Lab-Build v0.9.8 &bull; Team AltF4)</div>
          <div className="about-copyright">Copyright © 1998-2026 Team AltF4. All rights reserved.</div>
        </div>
      </div>

      {/* Retro 90s Tabs Header */}
      <div className="about-tabs-strip mono">
        <button 
          className={`about-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => handleTabClick('general')}
        >
          General
        </button>
        <button 
          className={`about-tab-btn ${activeTab === 'apps' ? 'active' : ''}`}
          onClick={() => handleTabClick('apps')}
        >
          Installed Applications
        </button>
        <button 
          className={`about-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => handleTabClick('team')}
        >
          Team AltF4 Credits
        </button>
      </div>

      {/* Tab Content Box */}
      <div className="about-tab-content-box">
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="about-content-body">
            <p>
              This software product is licensed to:
            </p>
            <div className="about-licensed-user">
              <strong>{registeredOwner}</strong>
              <div>{registeredOrg}</div>
            </div>

            <div className="win95-groove-line" style={{ margin: '8px 0' }} />

            <div className="about-specs-box">
              <div>System Platform: <strong>Microsoft Windows 98 Second Edition (RAGEWARE Kernel)</strong></div>
              <div>Processor: <strong>Intel Pentium(R) II MMX @ 450MHz</strong></div>
              <div>Physical Memory Allocated: <strong>131,072 KB (128 MB EDO RAM)</strong></div>
              <div>System Resources: <strong>86% free</strong></div>
              <div>Adversarial Engine: <strong>Active (Deterministic Local Mode)</strong></div>
              <div>Subsystem Origin: <strong>100% Scratch-Built React 19 (Zero UI Frameworks)</strong></div>
              <div>Sandbox Integrity: <strong>Client-Isolated &bull; Safe &amp; Harmless Simulation</strong></div>
            </div>
          </div>
        )}

        {/* TAB 2: INSTALLED APPLICATIONS */}
        {activeTab === 'apps' && (
          <div className="about-apps-catalog">
            <div className="about-app-item">
              <span className="app-item-icon"><IconBrowser size={18} /></span>
              <div className="app-item-details">
                <strong>NOBROWSE™ (Vercel Cloud Browser)</strong>
                <p>The browser that sometimes understands you (40% useful, 60% questionable). Embedded inside a clean retro viewport connected to <em>nobrowser.vercel.app</em>.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconCaughtIn4K size={18} /></span>
              <div className="app-item-details">
                <strong>Caught In 4K (AI Vision Surveillance)</strong>
                <p>Live embedded AI computer vision surveillance camera tracking facial reaction and real-time emotion telemetry. Connected to <em>caught-in-4k-rho.vercel.app</em>.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconFolder size={18} /></span>
              <div className="app-item-details">
                <strong>Authentic 90s/2000s Media Gallery</strong>
                <p>Curated vintage tech photo archives (IBM PC 5150 CRT DOS, Floppy Diskettes, 1989 Nintendo Game Boy, 1995 Sony PS1) and full 80s/90s Synthwave audio playback.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconMail size={18} /></span>
              <div className="app-item-details">
                <strong>RAGEWARE Mail (Real-Time Communication)</strong>
                <p>Retro Windows 95/Outlook Express style client-side email client with temporary IDs, session rooms, interactive composer, and persistent local inbox.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconNaaS size={18} /></span>
              <div className="app-item-details">
                <strong>Nothing as a Service™ (NaaS)</strong>
                <p>Satirical retro Internet Explorer browser window connected to the live NaaS cloud portal providing pure, unadulterated nothing.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconCamera size={18} /></span>
              <div className="app-item-details">
                <strong>Local Optical Sensor</strong>
                <p>Local MediaPipe face mesh landmark detection running 100% in-browser via WebAssembly. Strictly client-side with zero audio or external telemetry.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconPaint size={18} /></span>
              <div className="app-item-details">
                <strong>Retro Productivity Suite (Paint, Notepad, Calculator, Calendar)</strong>
                <p>Full canvas drawing tools, Notepad with troll proofreading suggestions, 16-bit math engine, calendar event tracker, and Recycle Bin with trap confirmations.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconActivity size={18} /></span>
              <div className="app-item-details">
                <strong>System Monitor &amp; Oscilloscope</strong>
                <p>Real-time CRT oscilloscope graphs, live simulated CPU/RAM/VRAM hardware telemetry, and tolerance index monitor.</p>
              </div>
            </div>

            <div className="about-app-item">
              <span className="app-item-icon"><IconGestureDrive size={18} /></span>
              <div className="app-item-details">
                <strong>Gesture Drive Protocol Bridge</strong>
                <p>Inter-process bridge connecting the browser desktop to the standalone Python <code>DriveByGesture.exe</code> application via Windows Custom Protocol.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEAM AltF4 CREDITS */}
        {activeTab === 'team' && (
          <div className="about-content-body">
            <div className="about-team-header mono">
              <strong>TEAM AltF4 &bull; RESEARCH &amp; DEVELOPMENT</strong>
            </div>

            <div className="about-team-grid">
              <div className="team-member-card">
                <div className="team-role mono">TEAM LEAD</div>
                <div className="team-name">Mohamed Arif J</div>
                <div className="team-affil">Jawaharlal College of Engineering and Technology</div>
                <div className="team-task">Built &amp; Integrated Native Applications, Web Windows &amp; Interaction Systems</div>
              </div>

              <div className="team-member-card">
                <div className="team-role mono">CORE DEVELOPER</div>
                <div className="team-name">Adhil V T</div>
                <div className="team-affil">Jawaharlal College of Engineering and Technology</div>
                <div className="team-task">Engineered RageWare OS Core, Window Compositor &amp; Behavioral Engine</div>
              </div>
            </div>

            <div className="win95-groove-line" style={{ margin: '8px 0' }} />

            <div className="about-statement mono">
              Engineered with ❤️ at <strong>TinkerHub Useless Projects 3.0</strong>.
              <br />
              All subsystems, window compositors, sound synthesis, and psychological friction vectors are 100% custom-crafted.
            </div>
          </div>
        )}
      </div>

      <div className="win95-groove-line" style={{ margin: '8px 0 10px 0' }} />

      {/* Bottom OK button */}
      <div className="about-footer-row">
        <button 
          id="btn-about-ok"
          className="win95-btn default-btn" 
          onClick={() => {
            soundEngine.playClick();
            if (onClose) onClose();
          }}
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  IconRage, 
  IconActivity, 
  IconCpu, 
  IconCamera, 
  IconFolder, 
  IconTerminal, 
  IconCaughtIn4K, 
  IconNaaS,
  IconBrowser,
  IconMail,
  IconPaint,
  IconNotepad,
  IconGestureDrive
} from '../components/os/OSIcons';
import { soundEngine } from '../engine/soundEngine';

export default function Landing({ onLaunchOS }) {
  const [showPreLaunchModal, setShowPreLaunchModal] = useState(false);

  const handleLaunchClick = () => {
    soundEngine.init();
    soundEngine.playDing();
    setShowPreLaunchModal(true);
  };

  const handleConfirmLaunch = () => {
    soundEngine.playDing();
    setShowPreLaunchModal(false);
    onLaunchOS();
  };

  const handleCloseModal = () => {
    setShowPreLaunchModal(false);
  };

  return (
    <div className="landing-dashboard-shell" id="landing-view">
      {/* Ambient background layers */}
      <div className="landing-bg-glow" />
      <div className="landing-grid-pattern" />

      {/* Top Brand Bar */}
      <header className="landing-navbar">
        <div className="landing-brand-wrap">
          <div className="landing-brand-logo">
            <IconRage size={18} />
          </div>
          <span className="landing-brand-title mono">RAGEWARE OS</span>
          <span className="landing-build-tag mono">LAB-BUILD v0.9.8</span>
        </div>

        {/* Center Prominent Team AltF4 Pill Badge */}
        <div className="landing-team-pill mono">
          <span className="team-pill-star">★</span>
          <span className="team-pill-text">MADE BY TEAM <strong>AltF4</strong></span>
          <span className="team-pill-star">★</span>
        </div>

        <div className="landing-nav-specs mono">
          <span>HOST: 127.0.0.1</span>
          <span>SANDBOX: CLIENT_ISOLATED</span>
          <span>DEV: TEAM_AltF4</span>
        </div>
      </header>

      {/* Main Scrollable Content Shell */}
      <div className="landing-scroll-container">
        {/* Hero Presentation Core */}
        <main className="landing-hero-core">
          <div className="landing-hero-badge mono">
            <span className="beacon-pulse" />
            COGNITIVE RESILIENCE BENCHMARK // ADVANCED HCI RESEARCH LAB
          </div>

          <h1 className="landing-hero-title">RAGEWARE</h1>

          <p className="landing-hero-tagline">
            AN INTENTIONALLY HOSTILE OPERATING SYSTEM<br />
            DESIGNED TO TEST <span>YOUR PATIENCE.</span>
          </p>

          <p className="landing-hero-sub-statement">
            A client-side Human-Computer Interaction experiment engineered by <strong>Team AltF4</strong> to 
            study dynamic behavioral friction, procedural interface antagonism, and user tolerance thresholds.
          </p>

          {/* OFFICIAL PRE-LAUNCH DISCLAIMER CARD */}
          <div className="landing-disclaimer-card" id="landing-scratch-disclaimer">
            <div className="disclaimer-header mono">
              <div className="disclaimer-title-wrap">
                <span className="disclaimer-warn-icon">&#9888;</span>
                <span className="disclaimer-heading">OFFICIAL SYSTEM NOTICE &amp; DISCLAIMER</span>
              </div>
              <span className="disclaimer-badge mono">100% SCRATCH BUILD</span>
            </div>

            <div className="disclaimer-body">
              <p>
                <strong>Notice to Faculty Evaluators &amp; Users:</strong> All native applications 
                (<em>File Manager, MS-DOS Prompt, Setup Wizard, System Monitor, Optical Sensor, Gesture Drive bridge, Paint, Notepad, Calculator, Calendar, and RAGEWARE Mail</em>)
                along with connected cloud-project windows (<em>NOBROWSE™ AI Web Browser, Caught In 4K Vercel Vision App &amp; Nothing as a Service™</em>), 
                retro window management engines, procedural ragebait schedulers, simulated filesystems with authentic 90s/2000s media, and Web Audio synthesizers 
                inside RAGEWARE OS are <strong>purely engineered from scratch by Team AltF4</strong>.
              </p>
              <p className="disclaimer-sub">
                No actual host operating system files are modified. No privileged Windows registry keys or processes are affected. 
                Everything executes safely and reversibly inside this client-side sandbox.
              </p>
            </div>

            <div className="disclaimer-footer mono">
              <span>&#10003; 100% Custom JavaScript &amp; React 19</span>
              <span>&#10003; Local WebAssembly Computer Vision</span>
              <span>&#10003; Crafted by Team AltF4</span>
            </div>
          </div>

          {/* Central Launch CTA Box */}
          <div className="landing-cta-box">
            <button 
              id="btn-launch-rageware-os"
              className="btn-launch-os mono"
              onClick={handleLaunchClick}
            >
              <span className="launch-icon">&#9658;</span>
              LAUNCH RAGEWARE OS
            </button>
            <span className="launch-sub-note mono">
              * Click to unlock synthesized Web Audio and open the system launch advisory menu.
            </span>
          </div>

          {/* Live Telemetry / Diagnostics Cockpit Row (6 Cards) */}
          <div className="landing-status-cards-row">
            <div className="landing-status-card">
              <div className="status-card-header mono">
                <span className="status-indicator ready" />
                SYSTEM COMPOSITOR
              </div>
              <div className="status-card-val mono">READY</div>
              <div className="status-card-desc">Virtual Win95/98 sandbox, 3D windows &amp; active taskbar.</div>
            </div>

            <div className="landing-status-card">
              <div className="status-card-header mono">
                <span className="status-indicator ready" />
                CLOUD &amp; EMBEDDED APPS
              </div>
              <div className="status-card-val mono">ONLINE</div>
              <div className="status-card-desc">NOBROWSE™, Caught In 4K &amp; NaaS Web Windows online.</div>
            </div>

            <div className="landing-status-card">
              <div className="status-card-header mono">
                <span className="status-indicator ready" />
                MEDIA ARCHIVE
              </div>
              <div className="status-card-val mono">LOADED</div>
              <div className="status-card-desc">Authentic 90s/2000s Pictures &amp; 80s/90s Synth audio vault.</div>
            </div>

            <div className="landing-status-card">
              <div className="status-card-header mono">
                <span className="status-indicator ready" />
                COMMUNICATION
              </div>
              <div className="status-card-val mono">SYNCED</div>
              <div className="status-card-desc">RAGEWARE Mail real-time P2P client &amp; session manager.</div>
            </div>

            <div className="landing-status-card">
              <div className="status-card-header mono">
                <span className="status-indicator standby" />
                ADAPTIVE ENGINE
              </div>
              <div className="status-card-val mono">STANDBY</div>
              <div className="status-card-desc">Procedural 60/40 weakness adaptation enabled.</div>
            </div>

            <div className="landing-status-card">
              <div className="status-card-header mono">
                <span className="status-indicator ready" />
                CIRCUIT BREAKER
              </div>
              <div className="status-card-val mono">F8 ARMED</div>
              <div className="status-card-desc">Instant Safe Shield override toggle ready anytime.</div>
            </div>
          </div>

          {/* High-Density Architecture Matrix (11 Cards) */}
          <div className="landing-features-section">
            <div className="features-section-title mono">
              <span>&#9632;</span> SYSTEM MODULE ARCHITECTURE &amp; CAPABILITIES (BY TEAM AltF4)
            </div>

            <div className="landing-features-grid">
              {/* NOBROWSE */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconBrowser size={20} /></span>
                  <span className="feature-card-title mono">NOBROWSE™ (AI Web Browser)</span>
                </div>
                <p className="feature-card-desc">
                  The browser that sometimes understands you (40% useful, 60% questionable). Embedded inside an authentic retro chrome-less window with instant sandbox connection to live cloud infrastructure.
                </p>
                <div className="feature-card-tag mono">Vercel Cloud &bull; nobrowser.vercel.app</div>
              </div>

              {/* Caught In 4K */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconCaughtIn4K size={20} /></span>
                  <span className="feature-card-title mono">Caught In 4K (AI Vision App)</span>
                </div>
                <p className="feature-card-desc">
                  Live embedded AI computer vision surveillance application running inside a clean retro window with camera access, real-time emotion telemetry, and facial reaction surveillance.
                </p>
                <div className="feature-card-tag mono">Vercel Cloud &bull; caught-in-4k-rho.vercel.app</div>
              </div>

              {/* 90s/2000s Media Gallery */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconFolder size={20} /></span>
                  <span className="feature-card-title mono">Authentic 90s/2000s Media Vault</span>
                </div>
                <p className="feature-card-desc">
                  Curated vintage computing photo archives (IBM PC 5150 with CRT DOS, 8"/5.25"/3.5" floppy diskettes, 1989 Nintendo Game Boy, 1995 Sony PlayStation 1) plus full 80s/90s Synthwave, Eurobeat, and Pop audio playback.
                </p>
                <div className="feature-card-tag mono">virtualFs.js &bull; Genuine Retro Media</div>
              </div>

              {/* RAGEWARE Mail */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconMail size={20} /></span>
                  <span className="feature-card-title mono">RAGEWARE Mail (P2P Client)</span>
                </div>
                <p className="feature-card-desc">
                  Authentic Windows 95/Outlook Express style client-side email client with temporary IDs, session rooms, interactive composer dialog, troll emails, and persistent browser storage.
                </p>
                <div className="feature-card-tag mono">RagewareMailApp.jsx &bull; Real-Time Client</div>
              </div>

              {/* Adaptive Rage Engine */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconRage size={20} /></span>
                  <span className="feature-card-title mono">Adaptive Rage Engine</span>
                </div>
                <p className="feature-card-desc">
                  Dynamically calculates emotional friction (0 to 100) across 8 behavioral vectors. Uses weighted selection to discover and exploit user patience weaknesses with escalating interface hostility.
                </p>
                <div className="feature-card-tag mono">rageEngine.js &bull; Pure JS Store</div>
              </div>

              {/* Win95/98 Compositor */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconCpu size={20} /></span>
                  <span className="feature-card-title mono">Win95/98 Compositor</span>
                </div>
                <p className="feature-card-desc">
                  Hand-crafted retro desktop complete with movable/resizable 3D windows, z-index hierarchy, active taskbar process management, and cascading Start Menu with hover-dodging icons.
                </p>
                <div className="feature-card-tag mono">Desktop.jsx &bull; Custom Window Manager</div>
              </div>

              {/* Nothing as a Service */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconNaaS size={20} /></span>
                  <span className="feature-card-title mono">Nothing as a Service™</span>
                </div>
                <p className="feature-card-desc">
                  Satirical retro Internet Explorer browser window connected to the live NaaS cloud portal providing pure, unadulterated nothing with full navigation toolbar.
                </p>
                <div className="feature-card-tag mono">IE5 Web Window &bull; Nothing-as-a-Service</div>
              </div>

              {/* Local Optical Vision */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconCamera size={20} /></span>
                  <span className="feature-card-title mono">Local Optical Vision</span>
                </div>
                <p className="feature-card-desc">
                  Local MediaPipe face landmark detection running 100% in-browser via WebAssembly. Monitors head movement and facial activity during post-failure reaction windows. Strictly audio-free.
                </p>
                <div className="feature-card-tag mono">MediaPipe WASM &bull; Zero Cloud Telemetry</div>
              </div>

              {/* Web Audio Synthesizer */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconActivity size={20} /></span>
                  <span className="feature-card-title mono">Web Audio Synthesizer</span>
                </div>
                <p className="feature-card-desc">
                  Zero external audio files. Generates polyphonic Brian Eno E-flat major 9th startup chords, melancholic descending shutdown arpeggios, motor spin-downs, and virus storms procedurally.
                </p>
                <div className="feature-card-tag mono">Web Audio API &bull; Multi-Oscillator Synth</div>
              </div>

              {/* Native OS Productivity Suite */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconTerminal size={20} /></span>
                  <span className="feature-card-title mono">Native OS Application Suite</span>
                </div>
                <p className="feature-card-desc">
                  Built-in Explorer file manager with hover evasion, MS-DOS Prompt with exit traps, Paint canvas toolset, Notepad with troll proofreading, 16-bit Calculator, Calendar, and Recycle Bin.
                </p>
                <div className="feature-card-tag mono">12 Desktop Apps &bull; Built From Scratch</div>
              </div>

              {/* Gesture Drive Bridge */}
              <div className="feature-grid-card">
                <div className="feature-card-top">
                  <span className="feature-card-icon"><IconGestureDrive size={20} /></span>
                  <span className="feature-card-title mono">Gesture Drive Protocol Bridge</span>
                </div>
                <p className="feature-card-desc">
                  Real inter-process bridge connecting the browser desktop to the standalone Python <code>DriveByGesture.exe</code> application via Windows Custom Protocol.
                </p>
                <div className="feature-card-tag mono">rageware-gesture-drive:// &bull; Native Interop</div>
              </div>
            </div>
          </div>
        </main>

        {/* Subtle Technical Footer */}
        <footer className="landing-footer mono">
          <div className="footer-left">
            <span>RAGEWARE COGNITIVE LABS // CLIENT-SIDE SANDBOX</span>
            <span className="footer-sep">&bull;</span>
            <span>DEVELOPED &amp; CRAFTED FROM SCRATCH BY TEAM <strong>AltF4</strong></span>
          </div>
          <div className="footer-right">
            <span>ZERO EXTERNAL TRACKERS // 100% LOCAL PROCESSING</span>
          </div>
        </footer>
      </div>

      {/* Pre-Launch Exploration & Troll Hardware Warning Modal */}
      {showPreLaunchModal && (
        <div 
          className="landing-modal-backdrop" 
          id="landing-launch-modal"
          onClick={handleCloseModal}
        >
          <div 
            className="landing-launch-dialog raised" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="launch-dialog-title"
          >
            {/* Retro Windows 95/98 Titlebar */}
            <div className="landing-dialog-titlebar">
              <div className="landing-dialog-title-text mono">
                <span className="dialog-title-icon">⚠️</span>
                <span id="launch-dialog-title">PRE-LAUNCH ADVISORY // TEAM AltF4 PROTOCOL</span>
              </div>
              <button 
                className="landing-dialog-close-btn" 
                onClick={handleCloseModal}
                title="Cancel"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Dialog Body */}
            <div className="landing-dialog-body">
              {/* Box 1: Explore each option without skipping */}
              <div className="dialog-notice-box explore-box">
                <div className="notice-box-header mono">
                  <span className="notice-icon">🔍</span>
                  <strong>MANDATORY: PLEASE EXPLORE EACH OPTION WITHOUT SKIPPING!</strong>
                </div>
                <p>
                  To experience the full psychological experiment and discover all hidden interface traps, 
                  <strong> please explore each application and option thoroughly without skipping</strong>!
                </p>
                <ul className="dialog-explore-list mono">
                  <li>🌐 <strong>NOBROWSE™</strong>: The browser that sometimes understands you (nobrowser.vercel.app)</li>
                  <li>📹 <strong>Caught In 4K</strong>: Live AI surveillance camera application (caught-in-4k-rho.vercel.app)</li>
                  <li>📁 <strong>File Manager &amp; Pictures</strong>: Real 90s/2000s vintage hardware photos (IBM PC, Floppy Disks, Game Boy, PS1) &amp; 80s music</li>
                  <li>✉️ <strong>RAGEWARE Mail</strong>: Real-time retro communication client with temporary session rooms</li>
                  <li>💻 <strong>MS-DOS Prompt</strong>: Run diagnostic commands &amp; test the exit trap</li>
                  <li>🎨 <strong>Paint &amp; Notepad</strong>: Retro canvas toolset and AI proofreading with troll suggestions</li>
                  <li>⏳ <strong>Setup Wizard</strong>: Experience the infamous 99% progress stall</li>
                  <li>📈 <strong>System Monitor</strong>: Observe real-time CRT graphs &amp; rage metrics</li>
                  <li>👁️ <strong>Optical Sensor</strong>: Local MediaPipe real-time face telemetry</li>
                  <li>☁️ <strong>Nothing as a Service™</strong>: Embedded retro browser portal delivering pure Nothing</li>
                  <li>🚗 <strong>Gesture Drive</strong>: Check native Windows protocol integration</li>
                </ul>
              </div>

              {/* Box 2: Troll Hardware Warning */}
              <div className="dialog-notice-box troll-box">
                <div className="notice-box-header mono">
                  <span className="notice-icon">🛑</span>
                  <strong>TROLL WARNING: DO NOT BREAK YOUR SYSTEM (LOL)!</strong>
                </div>
                <p>
                  ⚠️ <strong>HARDWARE SAFETY WARNING:</strong> Please do <strong>NOT</strong> smash your keyboard, 
                  punch your monitor screen, throw your mouse across the room, or physically obliterate your computer in frustration (lol)!
                </p>
                <p className="troll-disclaimer-note">
                  <em>Team AltF4 assumes zero legal or financial liability for fractured keycaps, shattered screens, 
                  or elevated user blood pressure. Everything inside this OS is an intentional, harmless simulation.</em>
                </p>
              </div>

              {/* Mercy Safe Shield Hint */}
              <div className="dialog-mercy-hint mono">
                💡 <strong>NEED MERCY?</strong> Press <strong>F8</strong> or click the <strong>CHAOS / SAFE toggle</strong> in the taskbar anytime to activate the Safe Shield circuit breaker!
              </div>
            </div>

            {/* Modal Actions */}
            <div className="landing-dialog-actions">
              <button 
                id="btn-dialog-cancel-launch"
                className="btn-dialog-cancel mono"
                onClick={handleCloseModal}
              >
                [ CANCEL / I'M SCARED ]
              </button>
              <button 
                id="btn-dialog-confirm-launch"
                className="btn-dialog-proceed mono"
                onClick={handleConfirmLaunch}
                autoFocus
              >
                <span className="launch-icon">▶</span>
                [ I PROMISE NOT TO SMASH MY PC — LAUNCH OS ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

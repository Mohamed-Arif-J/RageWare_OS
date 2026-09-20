import React, { useState } from 'react';
import { 
  IconFolder, 
  IconTerminal, 
  IconActivity, 
  IconCpu,
  IconSettings, 
  IconInfo,
  IconCamera,
  IconCaughtIn4K,
  IconGestureDrive,
  IconNaaS,
  IconNotepad,
  IconBattery,
  IconCalculator,
  IconPaint,
  IconRecycleBin,
  IconMail,
  IconLock,
  IconCalendar,
  IconBrowser
} from './OSIcons';
import { getRageProfile } from '../../engine/rageEngine';

export default function StartMenu({
  isOpen = false,
  onLaunchApp,
  onSystemAction,
  onClose,
}) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const profile = getRageProfile();

  if (!isOpen) return null;

  return (
    <div className="win95-start-menu raised" id="os-start-menu" onClick={(e) => e.stopPropagation()}>
      {/* Left Navy Sidebar Stripe */}
      <div className="start-menu-sidebar">
        <span className="sidebar-brand-text">
          RAGEWARE<strong>98</strong> <span className="sidebar-team-tag">BY AltF4</span>
        </span>
      </div>

      {/* Main Items List */}
      <div className="start-menu-items">
        {/* Programs with Submenu */}
        <div 
          className="start-menu-row with-submenu"
          onMouseEnter={() => setActiveSubmenu('programs')}
          onClick={(e) => {
            e.stopPropagation();
            setActiveSubmenu((prev) => (prev === 'programs' ? null : 'programs'));
          }}
        >
          <div className="start-row-content">
            <IconFolder size={18} />
            <span><u>P</u>rograms</span>
          </div>
          <span className="submenu-arrow">&#9656;</span>

          {activeSubmenu === 'programs' && (
            <div className="win95-submenu raised">
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('rageware-mail'); onClose(); }}
              >
                <IconMail size={16} />
                <span><strong>RAGEWARE Mail</strong></span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('file-manager'); onClose(); }}
              >
                <IconFolder size={16} />
                <span>File Manager</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('terminal'); onClose(); }}
              >
                <IconTerminal size={16} />
                <span>Command Prompt</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('system-update'); onClose(); }}
              >
                <IconCpu size={16} />
                <span>{profile.rageScore > 45 ? 'System Update (Again)' : 'System Update'}</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('system-monitor'); onClose(); }}
              >
                <IconActivity size={16} />
                <span>{profile.rageScore > 65 ? 'System Monitor (Under Control)' : 'System Monitor'}</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('caught-in-4k'); onClose(); }}
              >
                <IconCaughtIn4K size={16} />
                <span><strong>Caught In 4K</strong></span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('camera'); onClose(); }}
              >
                <IconCamera size={16} />
                <span>Video Camera</span>
              </div>
              <div 
                className="start-menu-row"
                id="start-menu-gesture-drive"
                onClick={() => { onLaunchApp('gesture-drive'); onClose(); }}
              >
                <IconGestureDrive size={16} />
                <span>Gesture Drive</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('naas'); onClose(); }}
              >
                <IconNaaS size={16} />
                <span>Nothing as a Service™</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('nobrowser'); onClose(); }}
              >
                <IconBrowser size={16} />
                <span><strong>NOBROWSE™</strong></span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('notepad'); onClose(); }}
              >
                <IconNotepad size={16} />
                <span>Notepad</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('calculator'); onClose(); }}
              >
                <IconCalculator size={16} />
                <span>Calculator</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('calendar'); onClose(); }}
              >
                <IconCalendar size={16} />
                <span>Calendar</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('paint'); onClose(); }}
              >
                <IconPaint size={16} />
                <span>Paint</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('recycle-bin'); onClose(); }}
              >
                <IconRecycleBin size={16} />
                <span>Recycle Bin</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('battery-alert'); onClose(); }}
              >
                <IconBattery size={16} />
                <span>Battery Monitor</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('lock'); onClose(); }}
              >
                <IconLock size={16} />
                <span>System Lock</span>
              </div>
            </div>
          )}
        </div>

        {/* Documents with Submenu */}
        <div 
          className="start-menu-row with-submenu"
          onMouseEnter={() => setActiveSubmenu('documents')}
        >
          <div className="start-row-content">
            <IconFolder size={18} />
            <span><u>D</u>ocuments</span>
          </div>
          <span className="submenu-arrow">&#9656;</span>

          {activeSubmenu === 'documents' && (
            <div className="win95-submenu raised">
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('file-manager'); onClose(); }}
              >
                <IconFolder size={16} />
                <span>Music (80s &amp; 90s Hits)</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('file-manager'); onClose(); }}
              >
                <IconFolder size={16} />
                <span>Pictures (Retro Gallery)</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('file-manager'); onClose(); }}
              >
                <IconFolder size={16} />
                <span>Videos (ActiveMovie Clips)</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('file-manager'); onClose(); }}
              >
                <span>Important.txt</span>
              </div>
              <div 
                className="start-menu-row"
                onClick={() => { onLaunchApp('file-manager'); onClose(); }}
              >
                <span>Secret.dat</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div 
          className="start-menu-row"
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={() => { onLaunchApp('settings'); onClose(); }}
        >
          <div className="start-row-content">
            <IconSettings size={18} />
            <span><u>S</u>ettings</span>
          </div>
        </div>

        {/* About / Help */}
        <div 
          className="start-menu-row"
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={() => { onLaunchApp('about'); onClose(); }}
        >
          <div className="start-row-content">
            <IconInfo size={18} />
            <span><u>H</u>elp & About</span>
          </div>
        </div>

        <div className="start-menu-divider" />

        {/* Verify Diagnostics */}
        <div 
          className="start-menu-row"
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={() => { onSystemAction('verify'); onClose(); }}
        >
          <div className="start-row-content">
            <span style={{ color: '#c00000', fontWeight: 'bold' }}>&#9888;</span>
            <span><u>V</u>erify Security...</span>
          </div>
        </div>

        {/* Fake Lock Workstation */}
        <div 
          className="start-menu-row"
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={() => { onLaunchApp('lock'); onClose(); }}
        >
          <div className="start-row-content">
            <IconLock size={18} />
            <span><u>K</u>ey Lock Session...</span>
          </div>
        </div>

        {/* Return to Dashboard */}
        <div 
          className="start-menu-row"
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={() => { onSystemAction('landing'); onClose(); }}
        >
          <div className="start-row-content">
            <span><u>L</u>og Off User...</span>
          </div>
        </div>

        <div className="start-menu-divider" />

        {/* Shut Down */}
        <div 
          className="start-menu-row"
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={() => { onSystemAction('shutdown'); onClose(); }}
        >
          <div className="start-row-content">
            <span>Sh<u>u</u>t Down...</span>
          </div>
        </div>

        <div className="start-menu-divider" />

        {/* Team AltF4 Tag */}
        <div className="start-menu-team-tag">
          <span>MADE BY TEAM <strong>AltF4</strong></span>
        </div>
      </div>
    </div>
  );
}

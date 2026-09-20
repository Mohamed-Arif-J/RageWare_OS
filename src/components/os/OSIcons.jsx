import React from 'react';

// Classic Windows 95/98 Style Retro Icons

export const IconStartLogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="1" y="1" width="6" height="6" fill="#FF3333" />
    <rect x="9" y="1" width="6" height="6" fill="#33CC33" />
    <rect x="1" y="9" width="6" height="6" fill="#3366FF" />
    <rect x="9" y="9" width="6" height="6" fill="#FFCC00" />
    <path d="M0 0h16v16H0z" stroke="#000" strokeWidth="0.5" fill="none" opacity="0.3" />
  </svg>
);

export const IconFolder = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <path d="M2 6h10l2 3h16v19H2V6z" fill="#D49B00" />
    <path d="M3 9h9l2 2h15v15H3V9z" fill="#FFDE59" />
    <path d="M3 26h25V11H14l-2-2H3v17z" fill="#FFEAA7" />
    <path d="M2 6h10l2 3h16v19H2V6z" stroke="#000000" strokeWidth="1" fill="none" />
  </svg>
);

export const IconTerminal = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="3" width="28" height="22" rx="1" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <rect x="5" y="6" width="22" height="16" fill="#000000" />
    <path d="M8 9l4 3-4 3M14 15h5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="square" />
    <rect x="11" y="25" width="10" height="3" fill="#808080" stroke="#000" strokeWidth="1" />
    <rect x="7" y="28" width="18" height="2" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
  </svg>
);

export const IconCpu = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="3" width="26" height="26" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <circle cx="16" cy="16" r="10" fill="#000080" />
    <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#00E5FF" strokeWidth="2" />
    <circle cx="16" cy="16" r="4" fill="#FFFFFF" />
  </svg>
);

export const IconActivity = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="4" width="26" height="20" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <rect x="5" y="6" width="22" height="16" fill="#000000" />
    <path d="M6 14h4l2-5 3 10 3-7 2 2h4" stroke="#00FF00" strokeWidth="1.5" fill="none" />
    <rect x="12" y="24" width="8" height="4" fill="#808080" stroke="#000" strokeWidth="1" />
  </svg>
);

export const IconSettings = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="4" y="5" width="24" height="22" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <circle cx="16" cy="16" r="7" fill="#808080" stroke="#000" strokeWidth="1" />
    <circle cx="16" cy="16" r="3" fill="#FFFFFF" />
    <path d="M16 6v3M16 23v3M6 16h3M23 16h3" stroke="#404040" strokeWidth="2" />
  </svg>
);

export const IconCamera = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="4" y="8" width="18" height="16" rx="1" fill="#808080" stroke="#000" strokeWidth="1" />
    <path d="M22 12l7-4v16l-7-4V12z" fill="#404040" stroke="#000" strokeWidth="1" />
    <circle cx="12" cy="16" r="4" fill="#00E5FF" stroke="#000" strokeWidth="1" />
  </svg>
);

export const IconCaughtIn4K = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    {/* Retro Gold/Black 4K Camera Body */}
    <rect x="3" y="7" width="19" height="17" fill="#202020" stroke="#000" strokeWidth="1" />
    <path d="M22 11l8-4v18l-8-4V11z" fill="#c00000" stroke="#000" strokeWidth="1" />
    <circle cx="11" cy="15" r="5" fill="#ff0040" stroke="#ffcc00" strokeWidth="1.5" />
    <circle cx="11" cy="15" r="2" fill="#ffffff" />
    {/* 4K Red Badge */}
    <rect x="14" y="18" width="16" height="10" fill="#ffcc00" stroke="#000" strokeWidth="1" />
    <text x="16" y="26" fill="#000" fontSize="7" fontWeight="bold" fontFamily="monospace">4K</text>
  </svg>
);

export const IconInfo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <path d="M6 4h14l6 6v18H6V4z" fill="#FFFFFF" stroke="#000" strokeWidth="1" />
    <path d="M20 4v6h6" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <circle cx="16" cy="14" r="2" fill="#000080" />
    <rect x="15" y="18" width="2" height="6" fill="#000080" />
  </svg>
);

export const IconFile = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ imageRendering: 'pixelated' }}>
    <path d="M5 3h12l6 6v16H5V3z" fill="#FFFFFF" stroke="#000" strokeWidth="1" />
    <path d="M17 3v6h6" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <line x1="8" y1="13" x2="20" y2="13" stroke="#808080" strokeWidth="1" />
    <line x1="8" y1="17" x2="20" y2="17" stroke="#808080" strokeWidth="1" />
    <line x1="8" y1="21" x2="16" y2="21" stroke="#808080" strokeWidth="1" />
  </svg>
);

export const IconMusic = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ imageRendering: 'pixelated' }}>
    <circle cx="14" cy="14" r="12" fill="#E8E8EC" stroke="#000000" strokeWidth="1.2" />
    <circle cx="14" cy="14" r="7.5" fill="#D0D0E0" stroke="#808080" strokeWidth="0.8" />
    <circle cx="14" cy="14" r="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    {/* Retro CD sheen */}
    <path d="M14 2a12 12 0 018 3L14 14z" fill="#FFE082" opacity="0.35" />
    <path d="M14 26a12 12 0 01-8-3L14 14z" fill="#80DEEA" opacity="0.35" />
    {/* Music Note */}
    <path d="M18 7v7a2.5 2.5 0 11-2-2.45V9l-5 1.5V16a2.5 2.5 0 11-2-2.45V8l9-2z" fill="#000080" />
  </svg>
);

export const IconImage = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="4" width="22" height="19" fill="#FFFFF0" stroke="#000000" strokeWidth="1.2" />
    <rect x="4" y="5" width="20" height="17" fill="#87CEEB" />
    <circle cx="9" cy="9" r="2.5" fill="#FFD700" />
    <polygon points="4,22 11,13 16,18 20,11 24,22" fill="#2E8B57" stroke="#1B5E20" strokeWidth="0.8" />
    <polygon points="14,22 18,16 24,22" fill="#3CB371" />
  </svg>
);

export const IconVideo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="5" width="22" height="18" rx="1" fill="#202020" stroke="#000000" strokeWidth="1.2" />
    {/* Sprocket Holes */}
    <rect x="5" y="7" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="10" y="7" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="15" y="7" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="20" y="7" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="5" y="18.5" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="10" y="18.5" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="15" y="18.5" width="2.5" height="2.5" fill="#FFFFFF" />
    <rect x="20" y="18.5" width="2.5" height="2.5" fill="#FFFFFF" />
    {/* Center Play Button */}
    <polygon points="11,11 19,14 11,17" fill="#00E5FF" stroke="#008080" strokeWidth="0.8" />
  </svg>
);

export const IconWarning = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <polygon points="16,3 30,28 2,28" fill="#FFCC00" stroke="#000000" strokeWidth="1.5" />
    <rect x="14.5" y="11" width="3" height="8" fill="#000000" />
    <circle cx="16" cy="23" r="1.8" fill="#000000" />
  </svg>
);

export const IconError = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ imageRendering: 'pixelated' }}>
    <circle cx="16" cy="16" r="13" fill="#CC0000" stroke="#000" strokeWidth="1.5" />
    <path d="M10 10l12 12M22 10L10 22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="square" />
  </svg>
);

export const IconRage = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="2" width="28" height="28" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
    <circle cx="16" cy="16" r="11" fill="#CC0000" />
    <rect x="10" y="11" width="3" height="3" fill="#FFFFFF" />
    <rect x="19" y="11" width="3" height="3" fill="#FFFFFF" />
    <path d="M11 21c2-3 8-3 10 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="square" fill="none" />
  </svg>
);

export const IconShieldAlert = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <path d="M16 2L4 7v10c0 8 12 13 12 13s12-5 12-13V7L16 2z" fill="#FFDE59" stroke="#000" strokeWidth="1.5" />
    <rect x="14.5" y="9" width="3" height="8" fill="#CC0000" />
    <circle cx="16" cy="21" r="1.8" fill="#CC0000" />
  </svg>
);

export const IconSpeaker = ({ size = 16, isMuted = false }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
    <path d="M2 5h3l4-3v12l-4-3H2V5z" fill="#000000" />
    {!isMuted ? (
      <>
        <path d="M11 5c1 1.5 1 4.5 0 6" stroke="#000000" strokeWidth="1.5" fill="none" />
        <path d="M13 3c2 3 2 7 0 10" stroke="#000000" strokeWidth="1.2" fill="none" />
      </>
    ) : (
      <path d="M10 5l4 6M14 5l-4 6" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="square" />
    )}
  </svg>
);

export const IconGestureDrive = ({ size = 32, className = '' }) => (
  <img
    src="/assets/gesture-drive.ico"
    width={size}
    height={size}
    className={className}
    style={{
      imageRendering: 'pixelated',
      display: 'inline-block',
      verticalAlign: 'middle',
      objectFit: 'contain',
    }}
    alt="Gesture Drive"
  />
);

export const IconNaaS = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Retro fluffy cloud */}
    <path 
      d="M9 20h14a6 6 0 000-12 5.5 5.5 0 00-4-1.7 6.5 6.5 0 00-6.8 5 4.5 4.5 0 00-3.2 8.7z" 
      fill="#D4E6F1" 
      stroke="#000080" 
      strokeWidth="1.2" 
    />
    <path 
      d="M10 18h12a4.5 4.5 0 000-9 4 4 0 00-3.2-1.5 5 5 0 00-5.2 4 3.5 3.5 0 00-3.6 6.5z" 
      fill="#FFFFFF" 
    />
    {/* Null / Void symbol in center */}
    <circle cx="16" cy="13.5" r="4.5" fill="#FFE5E5" stroke="#CC0000" strokeWidth="1.4" />
    <line x1="13" y1="16.5" x2="19" y2="10.5" stroke="#CC0000" strokeWidth="1.4" strokeLinecap="square" />
    
    {/* NaaS Golden Badge at bottom */}
    <rect x="4" y="21" width="24" height="9" rx="1" fill="#000080" stroke="#000000" strokeWidth="1" />
    <text x="16" y="28" fill="#FFFF00" fontSize="7" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">
      NaaS
    </text>
  </svg>
);

export const IconGlobe = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <circle cx="8" cy="8" r="7" fill="#008080" stroke="#000000" strokeWidth="1" />
    <ellipse cx="8" cy="8" rx="3.5" ry="7" stroke="#FFFFFF" strokeWidth="1" fill="none" />
    <line x1="1" y1="8" x2="15" y2="8" stroke="#FFFFFF" strokeWidth="1" />
    <line x1="2.5" y1="4.5" x2="13.5" y2="4.5" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
    <line x1="2.5" y1="11.5" x2="13.5" y2="11.5" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
  </svg>
);

export const IconNotepad = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Blue back cover */}
    <rect x="5" y="3" width="22" height="26" fill="#000080" stroke="#000" strokeWidth="1" />
    {/* White / off-white paper block */}
    <rect x="7" y="5" width="20" height="23" fill="#FFFFF0" stroke="#000" strokeWidth="0.5" />
    {/* Lined paper lines */}
    <line x1="9" y1="9" x2="25" y2="9" stroke="#8080FF" strokeWidth="1" />
    <line x1="9" y1="13" x2="25" y2="13" stroke="#8080FF" strokeWidth="1" />
    <line x1="9" y1="17" x2="25" y2="17" stroke="#8080FF" strokeWidth="1" />
    <line x1="9" y1="21" x2="25" y2="21" stroke="#8080FF" strokeWidth="1" />
    <line x1="9" y1="25" x2="21" y2="25" stroke="#8080FF" strokeWidth="1" />
    {/* Spiral binding rings at top */}
    <rect x="8" y="2" width="2" height="3" fill="#C0C0C0" stroke="#000" strokeWidth="0.5" />
    <rect x="13" y="2" width="2" height="3" fill="#C0C0C0" stroke="#000" strokeWidth="0.5" />
    <rect x="18" y="2" width="2" height="3" fill="#C0C0C0" stroke="#000" strokeWidth="0.5" />
    <rect x="23" y="2" width="2" height="3" fill="#C0C0C0" stroke="#000" strokeWidth="0.5" />
    {/* Yellow pencil leaning across corner */}
    <path d="M22 26 L27 18 L29 19 L24 27 Z" fill="#FFD700" stroke="#000" strokeWidth="0.5" />
    <path d="M21 27 L22 26 L24 27 Z" fill="#FFB6C1" stroke="#000" strokeWidth="0.5" />
  </svg>
);

export const IconBattery = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Battery body */}
    <rect x="3" y="8" width="24" height="16" rx="2" fill="#202020" stroke="#C0C0C0" strokeWidth="1.5" />
    {/* Battery terminal pip */}
    <rect x="27" y="13" width="3" height="6" fill="#A0A0A0" stroke="#808080" strokeWidth="1" />
    {/* 1% Critical Red Bar */}
    <rect x="5" y="10" width="3" height="12" fill="#FF0000" />
    {/* Empty chamber with caution hazard striping */}
    <line x1="10" y1="10" x2="10" y2="22" stroke="#404040" strokeWidth="1" strokeDasharray="2 2" />
    {/* Lightning Bolt */}
    <path d="M16 9 L12 17 L16 17 L14 23 L20 15 L16 15 Z" fill="#FFFF00" stroke="#CC9900" strokeWidth="0.8" />
  </svg>
);

export const IconRecycleBin = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Wiremesh Wastebasket Body */}
    <path d="M6 9 L9 27 L23 27 L26 9 Z" fill="#D4D0C8" stroke="#000000" strokeWidth="1.2" />
    {/* Rim */}
    <ellipse cx="16" cy="9" rx="10" ry="2" fill="#808080" stroke="#000000" strokeWidth="1" />
    {/* Wire lines */}
    <line x1="11" y1="11" x2="13" y2="25" stroke="#808080" strokeWidth="1" />
    <line x1="16" y1="11" x2="16" y2="25" stroke="#808080" strokeWidth="1" />
    <line x1="21" y1="11" x2="19" y2="25" stroke="#808080" strokeWidth="1" />
    {/* Discarded crumpled paper spilling out */}
    <path d="M10 8 L14 4 L18 7 L15 10 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
    <path d="M17 7 L21 3 L24 6 L20 9 Z" fill="#FFFFE0" stroke="#000000" strokeWidth="0.8" />
  </svg>
);

export const IconCalculator = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Chassis */}
    <rect x="5" y="3" width="22" height="26" fill="#C0C0C0" stroke="#000000" strokeWidth="1.2" />
    {/* LCD Screen */}
    <rect x="8" y="6" width="16" height="5" fill="#9BA89B" stroke="#000000" strokeWidth="0.8" />
    <text x="22" y="10.5" fill="#111" fontSize="4.5" fontFamily="monospace" textAnchor="end">1998</text>
    {/* Keypad Grid */}
    <rect x="8" y="13" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="12" y="13" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="16" y="13" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="20" y="13" width="4" height="3" fill="#000080" stroke="#000" strokeWidth="0.5" />

    <rect x="8" y="17" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="12" y="17" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="16" y="17" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="20" y="17" width="4" height="3" fill="#000080" stroke="#000" strokeWidth="0.5" />

    <rect x="8" y="21" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="12" y="21" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="16" y="21" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="20" y="21" width="4" height="3" fill="#CC0000" stroke="#000" strokeWidth="0.5" />

    <rect x="8" y="25" width="7" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="16" y="25" width="3" height="3" fill="#FFFFFF" stroke="#808080" strokeWidth="0.5" />
    <rect x="20" y="25" width="4" height="3" fill="#008000" stroke="#000" strokeWidth="0.5" />
  </svg>
);

export const IconPaint = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Wooden Palette */}
    <path d="M7 16 C5 22, 10 27, 18 27 C24 27, 28 22, 27 15 C26 9, 18 5, 12 7 C8 8, 6 12, 7 16 Z" fill="#D2B48C" stroke="#8B5A2B" strokeWidth="1.2" />
    {/* Thumb Hole */}
    <ellipse cx="22" cy="20" rx="2" ry="3" fill="#008080" stroke="#8B5A2B" strokeWidth="0.8" />
    {/* Color Blobs */}
    <circle cx="11" cy="11" r="2" fill="#FF0000" />
    <circle cx="16" cy="9" r="2" fill="#FFFF00" />
    <circle cx="21" cy="11" r="2" fill="#0000FF" />
    <circle cx="11" cy="18" r="2" fill="#008000" />
    <circle cx="15" cy="22" r="2" fill="#800080" />
    {/* Paintbrush crossing over */}
    <line x1="6" y1="28" x2="26" y2="4" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 6 L27 3 L29 5 L26 8 Z" fill="#C0C0C0" />
    <path d="M27 3 L29 1 L31 3 L29 5 Z" fill="#FF0000" />
  </svg>
);

export const IconMail = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Envelope Body */}
    <rect x="3" y="7" width="26" height="18" fill="#FFFBE6" stroke="#000000" strokeWidth="1.2" />
    {/* Shadow / Inner Linings */}
    <polygon points="3,7 16,18 29,7" fill="#FFF5C2" stroke="#808080" strokeWidth="0.8" />
    {/* Fold Crease Bottom Left */}
    <line x1="3" y1="25" x2="13" y2="15" stroke="#808080" strokeWidth="1" />
    {/* Fold Crease Bottom Right */}
    <line x1="29" y1="25" x2="19" y2="15" stroke="#808080" strokeWidth="1" />
    {/* Classic Red / Blue Airmail Postage Stamp */}
    <rect x="22" y="9" width="5" height="6" fill="#000080" stroke="#CC0000" strokeWidth="0.5" />
    <path d="M23 11 L26 13" stroke="#FFFFFF" strokeWidth="0.8" />
    {/* Wax Seal or Red Accent */}
    <circle cx="16" cy="18" r="2.2" fill="#CC0000" stroke="#800000" strokeWidth="0.5" />
  </svg>
);

export const IconLock = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Padlock Shackle */}
    <path d="M10 14V9a6 6 0 1 1 12 0v5" stroke="#808080" strokeWidth="3" fill="none" />
    <path d="M10 14V9a6 6 0 1 1 12 0v5" stroke="#FFFFFF" strokeWidth="1" fill="none" />
    {/* Padlock Body */}
    <rect x="7" y="14" width="18" height="14" rx="1" fill="#D49B00" stroke="#000000" strokeWidth="1" />
    <rect x="9" y="16" width="14" height="10" fill="#FFDE59" />
    {/* Keyhole */}
    <circle cx="16" cy="20" r="2" fill="#000000" />
    <polygon points="15,20 17,20 17.5,24 14.5,24" fill="#000000" />
  </svg>
);

export const IconCalendar = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Back shadow sheet */}
    <rect x="5" y="6" width="22" height="23" fill="#808080" stroke="#000000" strokeWidth="1" />
    {/* Main calendar sheet */}
    <rect x="4" y="4" width="22" height="23" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    {/* Top binder header bar (Win95 red) */}
    <rect x="4" y="4" width="22" height="7" fill="#C00000" stroke="#000000" strokeWidth="1" />
    {/* Binder metal rings */}
    <rect x="8" y="2" width="2" height="4" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <rect x="14" y="2" width="2" height="4" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <rect x="20" y="2" width="2" height="4" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    {/* Inner grid rows/columns */}
    <line x1="5" y1="15" x2="25" y2="15" stroke="#C0C0C0" strokeWidth="1" />
    <line x1="5" y1="19" x2="25" y2="19" stroke="#C0C0C0" strokeWidth="1" />
    <line x1="5" y1="23" x2="25" y2="23" stroke="#C0C0C0" strokeWidth="1" />
    <line x1="10" y1="12" x2="10" y2="26" stroke="#C0C0C0" strokeWidth="1" />
    <line x1="15" y1="12" x2="15" y2="26" stroke="#C0C0C0" strokeWidth="1" />
    <line x1="20" y1="12" x2="20" y2="26" stroke="#C0C0C0" strokeWidth="1" />
    {/* Marked day (Navy selected square) */}
    <rect x="11" y="16" width="3.5" height="2.5" fill="#000080" />
    {/* Little yellow note accent in corner */}
    <path d="M22 23 L26 23 L26 27 Z" fill="#FFEAA7" stroke="#000000" strokeWidth="0.6" />
  </svg>
);

export const IconBrowser = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={{ imageRendering: 'pixelated' }}>
    <defs>
      <linearGradient id="retroGlobeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="35%" stopColor="#0284c7" />
        <stop offset="70%" stopColor="#000080" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="retroOrbitGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="16" cy="28" rx="10" ry="2.5" fill="#000000" opacity="0.35" />
    {/* Globe Base Sphere */}
    <circle cx="16" cy="15" r="11" fill="url(#retroGlobeGrad)" stroke="#000000" strokeWidth="1" />
    {/* Continents (pixelated retro landmasses) */}
    <path d="M11 9 C13 7, 17 8, 18 10 C19 12, 17 14, 15 14 C13 14, 11 13, 10 11 Z" fill="#22c55e" />
    <path d="M7 14 C9 13, 12 15, 11 18 C10 20, 8 19, 7 17 Z" fill="#16a34a" />
    <path d="M18 13 C21 11, 25 13, 24 16 C23 18, 20 19, 18 17 Z" fill="#22c55e" />
    <path d="M15 20 C18 19, 21 21, 20 23 C18 25, 15 24, 14 22 Z" fill="#16a34a" />
    {/* Latitude Lines */}
    <ellipse cx="16" cy="15" rx="11" ry="4" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.55" fill="none" />
    <ellipse cx="16" cy="11" rx="9" ry="2.5" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.45" fill="none" />
    <ellipse cx="16" cy="19" rx="9" ry="2.5" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.45" fill="none" />
    {/* Meridian Lines */}
    <ellipse cx="16" cy="15" rx="5.5" ry="11" stroke="#ffffff" strokeWidth="0.8" opacity="0.45" fill="none" />
    <line x1="16" y1="4" x2="16" y2="26" stroke="#ffffff" strokeWidth="0.7" opacity="0.55" />
    {/* Specular 3D highlight */}
    <ellipse cx="12" cy="10" rx="3.5" ry="2" fill="#ffffff" opacity="0.5" transform="rotate(-30 12 10)" />
    {/* Golden Orbital Ring encircling the globe */}
    <path 
      d="M3 21 C4 26, 11 27, 18 24 C25 21, 29 15, 28 11 C27 8, 23 7, 18 9" 
      stroke="url(#retroOrbitGrad)" 
      strokeWidth="2.6" 
      strokeLinecap="round" 
      fill="none" 
    />
    <path 
      d="M3 21 C4 26, 11 27, 18 24 C25 21, 29 15, 28 11 C27 8, 23 7, 18 9" 
      stroke="#000000" 
      strokeWidth="0.6" 
      fill="none" 
    />
    {/* Orbital Satellite / Sparkle */}
    <circle cx="28" cy="11" r="2.2" fill="#fef08a" stroke="#000000" strokeWidth="0.7" />
    <circle cx="28" cy="11" r="1" fill="#ffffff" />
    {/* Small Retro WWW / Browser Banner Badge */}
    <rect x="2" y="2" width="12" height="8" rx="1" fill="#000080" stroke="#000000" strokeWidth="0.8" />
    <text x="8" y="8" fill="#facc15" fontSize="5.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">WWW</text>
  </svg>
);

export const IconNoBrowser = IconBrowser;


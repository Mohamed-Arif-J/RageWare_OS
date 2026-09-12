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




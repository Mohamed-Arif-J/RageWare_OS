import React from 'react';

/**
 * DesktopWallpaper — Original Windows 95 homage centerpiece for RAGEWARE OS
 * 
 * Features:
 * - Vibrant original 4-quadrant waving 3D flag with pixel trails
 * - Bold retro typography: "RAGEWARE" + stylized tilted "95"
 * - Authentic 1995 operating environment subtitle and version badges
 * - High-contrast rich colors that pop crisply against the #008080 teal background
 */
export default function DesktopWallpaper() {
  return (
    <div className="desktop-wallpaper-container" aria-hidden="true">
      <div className="wallpaper-logo-wrapper">
        <svg 
          className="wallpaper-svg" 
          viewBox="0 0 520 280" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Quadrant 3D Gradients */}
            <linearGradient id="flagRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="60%" stopColor="#E60000" />
              <stop offset="100%" stopColor="#990000" />
            </linearGradient>

            <linearGradient id="flagGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#44E660" />
              <stop offset="60%" stopColor="#00A82D" />
              <stop offset="100%" stopColor="#00661A" />
            </linearGradient>

            <linearGradient id="flagBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3399FF" />
              <stop offset="60%" stopColor="#0066CC" />
              <stop offset="100%" stopColor="#003D80" />
            </linearGradient>

            <linearGradient id="flagYellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE033" />
              <stop offset="60%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#B37400" />
            </linearGradient>

            {/* Chrome / Metallic Gold Gradient for "95" */}
            <linearGradient id="gold95" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FFF2A8" />
              <stop offset="55%" stopColor="#FFC820" />
              <stop offset="80%" stopColor="#C47D00" />
              <stop offset="100%" stopColor="#6E4400" />
            </linearGradient>

            <filter id="retroShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#003333" floodOpacity="0.85" />
            </filter>
            
            <filter id="textDropShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="3" stdDeviation="0" floodColor="#000000" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* BACKGROUND RETRO COMPUTING GRID ACCENTS */}
          <g opacity="0.35" stroke="#004D4D" strokeWidth="1">
            <line x1="20" y1="140" x2="500" y2="140" strokeDasharray="4 4" />
            <line x1="160" y1="20" x2="160" y2="260" strokeDasharray="4 4" />
          </g>

          {/* RETRO 3D OS COMPUTING EMBLEM (AUTHENTIC 1995 BEVELED CRT & QUAD-COLOR TILES) */}
          <g filter="url(#retroShadow)" transform="translate(18, 24)">
            {/* 4 DYNAMIC 3D FLYING TILES (90s OPERATING SYSTEM QUADRANT TILES) */}
            <g transform="translate(6, 8)">
              {/* Red Tile (Top Left) */}
              <polygon points="12,18 54,8 54,46 12,56" fill="url(#flagRed)" stroke="#000" strokeWidth="1.5" />
              <polygon points="12,18 54,8 54,12 12,22" fill="#FFAAAA" opacity="0.6" />
              {/* Red Pixel Trail */}
              <rect x="0" y="24" width="8" height="8" fill="#FF4D4D" stroke="#000" strokeWidth="1" />
              <rect x="6" y="36" width="6" height="6" fill="#CC0000" />

              {/* Green Tile (Top Right) */}
              <polygon points="62,6 104,18 104,56 62,44" fill="url(#flagGreen)" stroke="#000" strokeWidth="1.5" />
              <polygon points="62,6 104,18 104,22 62,10" fill="#B3FFB3" opacity="0.6" />
              {/* Green Pixel Trail */}
              <rect x="110" y="20" width="8" height="8" fill="#44E660" stroke="#000" strokeWidth="1" />
              <rect x="114" y="34" width="6" height="6" fill="#00A82D" />

              {/* Blue Tile (Bottom Left) */}
              <polygon points="12,64 54,52 54,90 12,102" fill="url(#flagBlue)" stroke="#000" strokeWidth="1.5" />
              <polygon points="12,64 54,52 54,56 12,68" fill="#B3D9FF" opacity="0.6" />
              {/* Blue Pixel Trail */}
              <rect x="2" y="74" width="6" height="6" fill="#3399FF" stroke="#000" strokeWidth="0.8" />
              <rect x="4" y="86" width="8" height="8" fill="#0066CC" stroke="#000" strokeWidth="1" />

              {/* Yellow Tile (Bottom Right) */}
              <polygon points="62,50 104,62 104,100 62,88" fill="url(#flagYellow)" stroke="#000" strokeWidth="1.5" />
              <polygon points="62,50 104,62 104,54 62,42" fill="#FFF2A8" opacity="0.6" />
              {/* Yellow Pixel Trail */}
              <rect x="108" y="68" width="8" height="8" fill="#FFE033" stroke="#000" strokeWidth="1" />
              <rect x="112" y="82" width="6" height="6" fill="#FFB300" />
            </g>

            {/* RETRO 1995 3D BEVELED CRT WORKSTATION */}
            <g transform="translate(36, 42)">
              {/* Monitor Stand Base */}
              <polygon points="28,142 82,142 92,154 18,154" fill="#C0C0C0" stroke="#000" strokeWidth="1.8" />
              <line x1="19" y1="154" x2="91" y2="154" stroke="#808080" strokeWidth="2" />
              <polygon points="46,128 64,128 68,142 42,142" fill="#A0A0A0" stroke="#000" strokeWidth="1.5" />

              {/* CRT Monitor Outer Bezel (Classic 90s Platinum Beige) */}
              <rect x="4" y="10" width="102" height="118" rx="4" fill="#D4D0C8" stroke="#000" strokeWidth="2.5" />
              {/* 3D Light Highlight (Top and Left) */}
              <polyline points="5,127 5,11 105,11" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
              {/* 3D Dark Shadow (Bottom and Right) */}
              <polyline points="105,11 105,127 5,127" stroke="#404040" strokeWidth="2.2" fill="none" />

              {/* Sunken Screen Bezel Frame */}
              <rect x="12" y="18" width="86" height="78" rx="2" fill="#808080" stroke="#000" strokeWidth="1.5" />
              <polyline points="13,95 13,19 97,19" stroke="#404040" strokeWidth="1.8" fill="none" />
              <polyline points="97,19 97,95 13,95" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />

              {/* CRT Glass Screen Surface */}
              <rect x="16" y="22" width="78" height="70" rx="3" fill="#0C1B20" />
              {/* Screen Curved Reflection Glare */}
              <path d="M 18 24 Q 55 22 92 28 Q 55 38 18 24 Z" fill="#FFFFFF" opacity="0.18" />

              {/* CRT Phosphor Scanline Grid */}
              <g opacity="0.25" stroke="#00E5FF" strokeWidth="0.8">
                <line x1="16" y1="36" x2="94" y2="36" />
                <line x1="16" y1="50" x2="94" y2="50" />
                <line x1="16" y1="64" x2="94" y2="64" />
                <line x1="16" y1="78" x2="94" y2="78" />
              </g>

              {/* CRT Centerpiece Graphic: Retro Cyber OS Core with Lightning */}
              <g transform="translate(35, 34)">
                {/* Glowing Diamond Chip */}
                <polygon points="20,4 36,20 20,36 4,20" fill="#000080" stroke="#00FFFF" strokeWidth="1.5" />
                {/* 3D Inner Chip */}
                <rect x="12" y="12" width="16" height="16" fill="#00E5FF" opacity="0.85" />
                {/* Cyber Lightning Bolt */}
                <polygon points="22,6 14,21 21,21 17,34 26,18 19,18" fill="#FFEB3B" stroke="#FF5722" strokeWidth="0.8" />
                {/* Microchip pins */}
                <line x1="8" y1="16" x2="2" y2="16" stroke="#00FFFF" strokeWidth="1.2" />
                <line x1="8" y1="24" x2="2" y2="24" stroke="#00FFFF" strokeWidth="1.2" />
                <line x1="32" y1="16" x2="38" y2="16" stroke="#00FFFF" strokeWidth="1.2" />
                <line x1="32" y1="24" x2="38" y2="24" stroke="#00FFFF" strokeWidth="1.2" />
              </g>

              {/* Monitor Control Lip & Buttons */}
              <g transform="translate(14, 102)">
                {/* 3.5" Floppy Disk Eject Slot */}
                <rect x="4" y="2" width="34" height="4" rx="1" fill="#404040" stroke="#000" strokeWidth="0.8" />
                <rect x="34" y="2.5" width="3" height="3" fill="#808080" />

                {/* Bright Green Power LED */}
                <circle cx="50" cy="4" r="2.5" fill="#00FF00" stroke="#000" strokeWidth="0.6" />
                <circle cx="50" cy="4" r="1" fill="#FFFFFF" />

                {/* Beveled Brightness / Power Buttons */}
                <rect x="58" y="2" width="6" height="4" fill="#C0C0C0" stroke="#000" strokeWidth="0.6" />
                <rect x="66" y="2" width="6" height="4" fill="#C0C0C0" stroke="#000" strokeWidth="0.6" />
                <rect x="74" y="1.5" width="7" height="5" fill="#A0A0A0" stroke="#000" strokeWidth="0.8" />
              </g>

              {/* Authentic 90s Badge Logo on Monitor Chin */}
              <text
                x="55"
                y="120"
                textAnchor="middle"
                fill="#555555"
                fontFamily="'MS Sans Serif', 'Tahoma', sans-serif"
                fontSize="6"
                fontWeight="bold"
                letterSpacing="1"
              >
                RAGEVISION CRT
              </text>
            </g>
          </g>

          {/* LOGO TYPOGRAPHY GROUP */}
          <g filter="url(#textDropShadow)">
            {/* "RAGEWARE" Main Brand Header */}
            <text
              x="215"
              y="92"
              fill="#FFFFFF"
              fontFamily="'Tahoma', 'Franklin Gothic Medium', 'Arial Black', sans-serif"
              fontSize="44"
              fontWeight="900"
              letterSpacing="3"
              stroke="#000000"
              strokeWidth="1.5"
            >
              RAGEWARE
            </text>

            {/* Giant Stylized Italic "95" with 3D Gold/Chrome Bevel */}
            <text
              x="218"
              y="164"
              fill="url(#gold95)"
              fontFamily="'Arial Black', 'Impact', 'Trebuchet MS', sans-serif"
              fontSize="76"
              fontStyle="italic"
              fontWeight="900"
              letterSpacing="1"
              stroke="#2B1900"
              strokeWidth="3.5"
            >
              95
            </text>

            {/* Subtitle Badge Plate */}
            <rect
              x="216"
              y="178"
              width="275"
              height="19"
              fill="#C0C0C0"
              stroke="#000000"
              strokeWidth="1.2"
            />
            <line x1="217" y1="179" x2="490" y2="179" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="217" y1="179" x2="217" y2="196" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="217" y1="196" x2="491" y2="196" stroke="#808080" strokeWidth="1" />
            <line x1="490" y1="179" x2="490" y2="196" stroke="#808080" strokeWidth="1" />

            <text
              x="226"
              y="192"
              fill="#000080"
              fontFamily="'Tahoma', 'MS Sans Serif', sans-serif"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="1.2"
            >
              ADVERSARIAL OPERATING ENVIRONMENT
            </text>

            {/* Team AltF4 Branding Plate */}
            <rect
              x="216"
              y="201"
              width="275"
              height="19"
              fill="#000080"
              stroke="#000000"
              strokeWidth="1.2"
            />
            <line x1="217" y1="202" x2="490" y2="202" stroke="#5C95FF" strokeWidth="1" />
            <line x1="217" y1="202" x2="217" y2="219" stroke="#5C95FF" strokeWidth="1" />
            <line x1="217" y1="219" x2="491" y2="219" stroke="#000040" strokeWidth="1" />
            <line x1="490" y1="202" x2="490" y2="219" stroke="#000040" strokeWidth="1" />

            <text
              x="226"
              y="215"
              fill="#FFE033"
              fontFamily="'Lucida Console', 'Courier New', monospace"
              fontSize="10.5"
              fontWeight="bold"
              letterSpacing="1.5"
            >
              ★ MADE BY TEAM AltF4 ★
            </text>
          </g>

          {/* Version & Notice Footer — Crisp retro pixel-style text */}
          <g>
            <text
              x="216"
              y="238"
              fill="#E0F7FA"
              fontFamily="'Lucida Console', 'Courier New', monospace"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="0.8"
              stroke="#003333"
              strokeWidth="0.6"
            >
              VERSION 4.00.950 B • BUILT BY TEAM AltF4
            </text>

            <text
              x="216"
              y="253"
              fill="#80CBC4"
              fontFamily="'Tahoma', 'MS Sans Serif', sans-serif"
              fontSize="8.5"
              letterSpacing="0.5"
              stroke="#003333"
              strokeWidth="0.4"
            >
              [C] 1998-2026 TEAM AltF4 • ALL APPS CRAFTED FROM SCRATCH
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

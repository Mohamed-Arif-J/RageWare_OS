import React from 'react';
import { generateAsciiRageBar } from '../utils';

export default function RageMeter({ rageLevel = 37, status = 'IRRITATED' }) {
  const asciiBar = generateAsciiRageBar(rageLevel, 16);

  return (
    <div className="rage-meter-card" id="rage-meter-panel">
      <div className="rage-meter-header">
        <span className="rage-meter-label">BIOMETRIC RAGE LEVEL</span>
        <span className="rage-meter-score mono">{rageLevel}%</span>
      </div>

      <div className="rage-bar-track">
        <div 
          className="rage-bar-fill" 
          style={{ width: `${rageLevel}%` }}
        />
        <div className="rage-bar-ascii">
          {asciiBar} {rageLevel}%
        </div>
      </div>

      <div className="rage-status-row">
        <span>SUBJECT EMOTIONAL STATE</span>
        <span className="rage-status-text">STATUS: {status}</span>
      </div>
    </div>
  );
}

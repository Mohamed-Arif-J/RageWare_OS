import React from 'react';
import { formatScore } from '../utils';

export default function Navbar({ score = 0, onNavigateHome, currentView = 'home' }) {
  return (
    <nav className="navbar" id="rageware-navbar">
      <div className="nav-brand" onClick={onNavigateHome} title="Return to Core System">
        <div className="brand-icon">RW</div>
        <span className="brand-name">RAGEWARE</span>
        <span className="nav-tag">EXP.v0.1</span>
      </div>

      <div className="nav-metrics">
        {currentView === 'game' && (
          <div className="metric-pill">
            <span className="metric-label">SESSION SCORE</span>
            <span className="metric-value">SCORE {formatScore(score)}</span>
          </div>
        )}
      </div>
    </nav>
  );
}

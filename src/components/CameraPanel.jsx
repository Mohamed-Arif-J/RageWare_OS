import React from 'react';

export default function CameraPanel() {
  return (
    <div className="camera-panel" id="camera-panel">
      <div className="camera-header">
        <span className="camera-title">
          <span className="badge-dot" />
          OPTICAL SENSOR FEED
        </span>
        <span className="nav-tag">STANDBY</span>
      </div>

      <div className="camera-feed-box">
        <div className="camera-grid-overlay" />
        <div className="camera-reticle">
          <span className="reticle-corner-tl" />
          <span className="reticle-corner-tr" />
          <span className="reticle-corner-bl" />
          <span className="reticle-corner-br" />
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>TARGET</span>
        </div>
        <div className="camera-feed-text">[ HARDWARE OFFLINE ]</div>
      </div>

      <div className="camera-specs">
        <div className="spec-line">
          <span>FACIAL TRACKING</span>
          <span>INITIALIZING LATER</span>
        </div>
        <div className="spec-line">
          <span>HAND DETECTION</span>
          <span>STANDBY</span>
        </div>
        <div className="spec-line">
          <span>MICRO-EXPRESSION ENGINE</span>
          <span>CALIBRATING</span>
        </div>
      </div>
    </div>
  );
}

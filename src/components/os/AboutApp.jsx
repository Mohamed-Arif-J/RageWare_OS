import React from 'react';
import { IconRage } from './OSIcons';

export default function AboutApp() {
  return (
    <div className="win95-about-shell" id="app-about">
      {/* Top Banner with Flag / Emblem */}
      <div className="about-header-banner">
        <div className="about-logo-box">
          <IconRage size={40} />
        </div>
        <div className="about-header-text">
          <h2 className="about-os-title">RAGEWARE 98</h2>
          <div className="about-build-ver">Version 4.10.1998 (Built from scratch by Team AltF4)</div>
          <div className="about-copyright">Copyright © 1998-2026 Team AltF4. All rights reserved.</div>
        </div>
      </div>

      <div className="win95-groove-line" />

      {/* Licensing & Authorship Details */}
      <div className="about-content-body">
        <p>
          Original Authors &amp; System Engineers:
        </p>
        <div className="about-licensed-user">
          <strong>Team AltF4</strong>
          <div>College Evaluation &amp; Research Edition</div>
        </div>

        <div className="about-specs-box">
          <div>Authorship: <strong>Team AltF4 (100% Scratch-Built)</strong></div>
          <div>Physical memory allocated: <strong>65,536 KB</strong></div>
          <div>System resources: <strong>84% free</strong></div>
          <div>Adversarial Engine: <strong>Active (Deterministic Local Mode)</strong></div>
          <div>Subsystem Origin: <strong>Zero 3rd-party UI templates or external cloud APIs</strong></div>
        </div>
      </div>

      <div className="win95-groove-line" />

      {/* Bottom OK button */}
      <div className="about-footer-row">
        <button className="win95-btn default-btn" onClick={() => {}}>
          OK
        </button>
      </div>
    </div>
  );
}

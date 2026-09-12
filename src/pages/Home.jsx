import React, { useState } from 'react';

export default function Home({ onStartGame }) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="home-page" id="home-view">
      <div className="hero-badge">
        <span className="badge-dot"></span>
        COGNITIVE RESILIENCE BENCHMARK
      </div>

      <h1 className="hero-title">RAGEWARE</h1>

      <p className="hero-subtitle">
        An AI system designed to <span>test your patience</span> through adaptive friction, evasive interfaces, and real-time frustration analytics.
      </p>

      <div className="hero-actions">
        <button 
          id="btn-start-rage-test"
          className="btn-primary" 
          onClick={onStartGame}
        >
          START RAGE TEST &rarr;
        </button>
        <button 
          id="btn-how-it-works"
          className="btn-secondary"
          onClick={() => setShowHowItWorks(true)}
        >
          HOW IT WORKS
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">Adaptive Friction</h3>
          <p className="feature-desc">
            Interfaces that intentionally evade your cursor, delay interactions, and test your psychological threshold.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👁️</div>
          <h3 className="feature-title">Biometric Rage Metric</h3>
          <p className="feature-desc">
            Client-side optical tracking measures furrowed brows, micro-expressions, and head movement volatility.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">100% Private & Local</h3>
          <p className="feature-desc">
            Zero external AI APIs, zero server calls, zero database overhead. All interactions run locally in your browser.
          </p>
        </div>
      </div>

      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">SYSTEM ARCHITECTURE // HOW IT WORKS</h2>
              <button className="modal-close" onClick={() => setShowHowItWorks(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>RAGEWARE</strong> is an experimental cognitive stress test designed to analyze how humans react when software intentionally defies ergonomic principles.
              </p>
              <ul>
                <li><strong>Phase 1: Baseline Calibration</strong> — Establish baseline interaction speed and facial repose.</li>
                <li><strong>Phase 2: Adversarial UI</strong> — Buttons flee, fake loading bars stall at 99%, and targets reposition upon hover.</li>
                <li><strong>Phase 3: Adaptive Frustration Engine</strong> — The system measures your frustration and amplifies precisely what annoys you most.</li>
              </ul>
              <p style={{ marginTop: '0.5rem', color: 'var(--accent-red)' }}>
                Warning: Prolonged exposure may lead to elevated cortisol and keyboard slamming.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

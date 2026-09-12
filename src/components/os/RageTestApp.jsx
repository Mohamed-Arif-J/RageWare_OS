import React, { useState } from 'react';
import RageMeter from '../RageMeter';
import EscapingButtonChallenge from '../challenges/EscapingButtonChallenge';
import FakeLoadingChallenge from '../challenges/FakeLoadingChallenge';
import MovingTargetChallenge from '../challenges/MovingTargetChallenge';
import FakeButtonChallenge from '../challenges/FakeButtonChallenge';
import { 
  getRageProfile, 
  resetSession, 
} from '../../engine/rageEngine';
import { 
  CHALLENGE_REGISTRY, 
  getTotalChallenges, 
  getNextChallengeIndex 
} from '../../engine/challengeEngine';
import { formatScore } from '../../utils';

export default function RageTestApp({ onRageUpdate }) {
  const [profile, setProfile] = useState(() => getRageProfile());
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [allComplete, setAllComplete] = useState(false);

  const syncProfile = () => {
    const updated = getRageProfile();
    setProfile(updated);
    if (onRageUpdate) onRageUpdate(updated);
  };

  const handleChallengeComplete = () => {
    const nextIdx = getNextChallengeIndex(currentChallengeIdx);
    syncProfile();

    if (nextIdx === -1) {
      setAllComplete(true);
    } else {
      setCurrentChallengeIdx(nextIdx);
    }
  };

  const handleRestart = () => {
    resetSession();
    setCurrentChallengeIdx(0);
    setAllComplete(false);
    syncProfile();
  };

  const totalChallenges = getTotalChallenges();
  const currentChallengeMeta = CHALLENGE_REGISTRY[currentChallengeIdx] || CHALLENGE_REGISTRY[0];

  return (
    <div className="rage-test-app-shell" id="app-rage-test">
      {/* App Header / Toolbar */}
      <div className="app-toolbar">
        <div className="toolbar-status mono">
          <span className="badge-mission">
            {allComplete ? 'COMPLETED' : `MISSION ${currentChallengeMeta.missionNumber} / 0${totalChallenges}`}
          </span>
          <span className="toolbar-score">SCORE: {formatScore(profile.successfulChallenges * 50)}</span>
          <span className="toolbar-attempts">ATTEMPTS: {profile.totalAttempts}</span>
        </div>

        <div className="toolbar-actions">
          <button className="btn-app-toolbar mono" onClick={handleRestart} title="Restart diagnostic">
            &#8635; RESTART TEST
          </button>
        </div>
      </div>

      {/* Main App Work Area */}
      <div className="app-main-split">
        <div className="app-challenge-viewport">
          {allComplete ? (
            <div className="all-complete-banner">
              <div className="mission-tag">BENCHMARK EVALUATION COMPLETE</div>
              <h2 className="all-complete-title">PATIENCE EXHAUSTED</h2>
              <p className="all-complete-desc">
                Your highest vulnerability vector was <strong>{profile.strongestCategory}</strong> with a final biometric rage level of <strong>{profile.level} ({profile.rageScore}%)</strong>.
              </p>
              <button 
                id="btn-restart-app-benchmark"
                className="btn-primary" 
                style={{ marginTop: '1rem' }}
                onClick={handleRestart}
              >
                RESTART DIAGNOSTIC &orarr;
              </button>
            </div>
          ) : (
            <>
              {currentChallengeIdx === 0 && (
                <EscapingButtonChallenge 
                  key="app-ch-0"
                  onComplete={handleChallengeComplete}
                  onStateChange={syncProfile}
                />
              )}
              {currentChallengeIdx === 1 && (
                <FakeLoadingChallenge 
                  key="app-ch-1"
                  onComplete={handleChallengeComplete}
                  onStateChange={syncProfile}
                />
              )}
              {currentChallengeIdx === 2 && (
                <MovingTargetChallenge 
                  key="app-ch-2"
                  onComplete={handleChallengeComplete}
                  onStateChange={syncProfile}
                />
              )}
              {currentChallengeIdx === 3 && (
                <FakeButtonChallenge 
                  key="app-ch-3"
                  onComplete={handleChallengeComplete}
                  onStateChange={syncProfile}
                />
              )}
            </>
          )}
        </div>

        {/* Embedded Biometric Telemetry */}
        <div className="app-telemetry-sidebar">
          <RageMeter 
            rageLevel={profile.rageScore} 
            status={profile.level} 
          />

          <div className="app-vector-stats mono">
            <div className="vector-title">FRICTION VECTORS</div>
            <div className="vector-row">
              <span>Moving Buttons:</span>
              <span className="vector-val">{profile.categories.movingButtons}</span>
            </div>
            <div className="vector-row">
              <span>Fake Loading:</span>
              <span className="vector-val">{profile.categories.fakeLoading}</span>
            </div>
            <div className="vector-row">
              <span>Moving Targets:</span>
              <span className="vector-val">{profile.categories.movingTargets}</span>
            </div>
            <div className="vector-row">
              <span>Precision:</span>
              <span className="vector-val">{profile.categories.precisionChallenges}</span>
            </div>
            <div className="vector-row strongest">
              <span>Prime Bait:</span>
              <span className="vector-val danger">{profile.strongestCategory}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

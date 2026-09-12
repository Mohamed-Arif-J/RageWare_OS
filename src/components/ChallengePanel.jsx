import React from 'react';

export default function ChallengePanel({ 
  challengeIndex = 0,
  totalChallenges = 4,
  missionNumber = '01',
  children
}) {
  return (
    <div className="challenge-panel" id="challenge-panel">
      <div className="challenge-header">
        <div className="challenge-badge">
          PROTOCOL ACTIVE // CHALLENGE {String(challengeIndex + 1).padStart(2, '0')} / {String(totalChallenges).padStart(2, '0')}
        </div>
      </div>

      <div style={{ width: '100%' }}>
        {children}
      </div>

      <div className="challenge-footer">
        <span>SECURITY LEVEL: ADVERSARIAL</span>
        <span>ADAPTIVE FRICTION: ACTIVE</span>
      </div>
    </div>
  );
}

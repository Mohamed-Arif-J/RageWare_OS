import React from 'react';
import { IconWarning } from './OSIcons';

export default function SessionCompleteModal({
  isOpen = false,
  profile,
  onReturnToDesktop,
  onRunAgain,
}) {
  if (!isOpen) return null;

  return (
    <div className="os-dialog-backdrop">
      <div 
        className="win95-dialog-box" 
        id="session-complete-modal" 
        style={{ width: '460px', maxWidth: '92vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Section 24: Classic Windows Titlebar */}
        <div className="win95-titlebar">
          <div className="titlebar-left">
            <span className="window-title-text" style={{ fontSize: '12px' }}>RAGEWARE SYSTEM MESSAGE</span>
          </div>
          <div className="win95-titlebar-controls">
            <button 
              className="win95-ctrl-btn btn-close" 
              onClick={onReturnToDesktop}
              title="Close"
            >
              &#10005;
            </button>
          </div>
        </div>

        {/* Section 24 Body */}
        <div className="win95-dialog-content" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <IconWarning size={36} />
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', color: '#000080' }}>
                USER PROFILE ANALYSIS COMPLETE.
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#555' }}>PRIMARY FRUSTRATION VECTOR:</span>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#c00000', marginTop: '2px' }}>
                  {profile.strongestCategoryDisplay || 'MOVING INTERFACE ELEMENTS'}
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#555' }}>RAGE SCORE: </span>
                <strong style={{ fontSize: '15px' }}>{profile.rageScore}%</strong> ({profile.level})
              </div>

              <div className="win95-sunken-field" style={{ padding: '8px', margin: '8px 0', background: '#fff', border: '2px inset #fff' }}>
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '3px' }}>SYSTEM CONCLUSION:</div>
                <div style={{ fontWeight: 'bold', color: '#000', fontSize: '13px' }}>
                  YOU HAVE VERY LITTLE PATIENCE.
                </div>
              </div>

              {/* Session Summary Audit Breakdown */}
              <div style={{ marginTop: '12px', fontSize: '11px', color: '#333' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '3px', marginBottom: '4px' }}>
                  SESSION VECTOR AUDIT (TOTAL INTERACTIONS: {profile.meaningfulInteractions})
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Moving Buttons:</span> <strong>{profile.categories?.movingButtons || 0} pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Window Controls:</span> <strong>{profile.categories?.windowManipulation || 0} pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fake Loading:</span> <strong>{profile.categories?.fakeLoading || 0} pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>File Interaction:</span> <strong>{profile.categories?.fileInteraction || 0} pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Terminal:</span> <strong>{profile.categories?.terminalInteraction || 0} pts</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="win95-dialog-footer" style={{ justifyContent: 'center', gap: '16px', padding: '10px' }}>
          <button 
            id="btn-return-desktop"
            className="win95-btn default-btn"
            style={{ minWidth: '90px', fontWeight: 'bold' }}
            onClick={onReturnToDesktop}
          >
            OK
          </button>
          <button 
            id="btn-run-again"
            className="win95-btn"
            style={{ minWidth: '90px' }}
            onClick={onRunAgain}
          >
            Run Again
          </button>
        </div>
      </div>
    </div>
  );
}

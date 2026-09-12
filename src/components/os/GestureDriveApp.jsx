import React, { useState } from 'react';
import { IconGestureDrive } from './OSIcons';

/**
 * GESTURE_DRIVE_DOWNLOAD_URL
 * Configured public GitHub Release download for DriveByGesture.zip distributable package.
 */
export const GESTURE_DRIVE_DOWNLOAD_URL = 'https://github.com/adhil-vt/DriveByGesture/releases/download/v1.0.0/DriveByGesture.zip';

/**
 * GESTURE_DRIVE_PROTOCOL
 * Fixed Windows custom protocol handler for launching DriveByGesture.exe.
 * For security reasons, this is hardcoded and cannot be overridden by user input.
 */
const GESTURE_DRIVE_PROTOCOL = 'rageware-gesture-drive://launch';

const STORAGE_KEY = 'rageware_gesture_drive_install_confirmed';

export default function GestureDriveApp({ onClose }) {
  // Check localStorage for user installation confirmation
  const [installConfirmed, setInstallConfirmed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  });

  // Launch status: 'idle' | 'launching' | 'failed'
  const [launchStatus, setLaunchStatus] = useState('idle');
  // Error message for unconfigured or invalid download URL
  const [downloadError, setDownloadError] = useState('');

  const handleDownloadClick = () => {
    if (!GESTURE_DRIVE_DOWNLOAD_URL || GESTURE_DRIVE_DOWNLOAD_URL.trim() === '') {
      setDownloadError('Download location is not configured.');
      return;
    }
    setDownloadError('');
    // Normal browser navigation / new tab download
    window.open(GESTURE_DRIVE_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmInstalled = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {}
    setInstallConfirmed(true);
    setLaunchStatus('idle');
    setDownloadError('');
  };

  const handleResetInstallation = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    setInstallConfirmed(false);
    setLaunchStatus('idle');
    setDownloadError('');
  };

  const handleLaunchClick = () => {
    try {
      setLaunchStatus('launching');
      // Browser-safe invocation of the Windows custom protocol
      window.location.href = GESTURE_DRIVE_PROTOCOL;
    } catch (err) {
      setLaunchStatus('failed');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="win95-about-shell"
      id="app-gesture-drive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 20px',
        backgroundColor: 'var(--win-surface, #c0c0c0)',
        boxSizing: 'border-box',
        userSelect: 'none',
        fontFamily: 'var(--font-win95, "MS Sans Serif", Tahoma, sans-serif)',
        color: 'var(--win-text, #000000)',
        fontSize: '12px',
      }}
    >
      {/* Top Banner with Official Gesture Drive Icon */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '10px',
        }}
      >
        <div 
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconGestureDrive size={40} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              color: '#000080',
            }}
          >
            GESTURE DRIVE
          </h2>
          <div style={{ fontSize: '11px', color: '#555555', marginTop: '2px' }}>
            Vision-Based Motion Controller &amp; Game Interface
          </div>
        </div>
      </div>

      <div className="win95-groove-line" style={{ margin: '8px 0 14px 0' }} />

      {/* Main Content Area */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* VIEW 1: NOT CONFIRMED INSTALLED */}
        {!installConfirmed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div 
              style={{
                padding: '16px 18px',
                backgroundColor: '#ffffff',
                border: '2px inset #dfdfdf',
                lineHeight: '1.6',
              }}
              className="win95-sunken-field"
            >
              <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '12px', color: '#000000' }}>
                Gesture Drive is not installed.
              </p>
              <p style={{ margin: 0, color: '#333333', fontSize: '11px', lineHeight: '1.5' }}>
                Use Gesture Drive to control supported games using hand gestures.
              </p>
            </div>

            {downloadError && (
              <div 
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#ffeeee',
                  border: '1px solid #cc0000',
                  fontSize: '11px',
                  color: '#990000',
                }}
              >
                ⚠ {downloadError}
              </div>
            )}

            <div style={{ fontSize: '11px', color: '#666666' }}>
              Requires Windows 10/11 &amp; USB/Built-in Webcam
            </div>
          </div>
        ) : launchStatus === 'failed' ? (
          /* VIEW 3: PROTOCOL FALLBACK / FAILED */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div 
              style={{
                padding: '16px 18px',
                backgroundColor: '#ffffff',
                border: '2px inset #dfdfdf',
                lineHeight: '1.6',
              }}
              className="win95-sunken-field"
            >
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '12px', color: '#cc0000' }}>
                Unable to launch Gesture Drive.
              </p>
              <p style={{ margin: 0, color: '#333333', fontSize: '11px' }}>
                Make sure Gesture Drive is installed and try again.
              </p>
            </div>

            <div style={{ fontSize: '11px', color: '#666666' }}>
              Ensure <code>rageware-gesture-drive://</code> is registered or run the app directly.
            </div>
          </div>
        ) : (
          /* VIEW 2: CONFIRMED INSTALLED (READY) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div 
              style={{
                padding: '16px 18px',
                backgroundColor: '#ffffff',
                border: '2px inset #dfdfdf',
                lineHeight: '1.6',
              }}
              className="win95-sunken-field"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#008000', fontWeight: 'bold', fontSize: '14px' }}>✓</span>
                <strong style={{ fontSize: '13px', color: '#000000' }}>Gesture Drive is ready.</strong>
              </div>
              <p style={{ margin: 0, color: '#333333', fontSize: '11px' }}>
                Motion controller interface is ready to launch via Windows custom protocol.
              </p>
            </div>

            {launchStatus === 'launching' && (
              <div 
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#ffffe1',
                  border: '1px solid #999900',
                  fontSize: '11px',
                  color: '#000000',
                  lineHeight: '1.4',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  ℹ️ Requesting launch via Windows protocol...
                </div>
                <div style={{ color: '#555555', fontSize: '10px' }}>
                  If Gesture Drive did not open,{' '}
                  <span 
                    onClick={() => setLaunchStatus('failed')}
                    style={{ textDecoration: 'underline', color: '#000080', cursor: 'pointer' }}
                  >
                    click here for troubleshooting
                  </span>.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Action Buttons */}
        <div>
          <div className="win95-groove-line" style={{ margin: '14px 0 10px 0' }} />
          
          <div 
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {!installConfirmed ? (
              /* Buttons when Not Confirmed */
              <>
                <button 
                  id="btn-gesture-drive-download"
                  className="win95-btn default-btn"
                  style={{ minWidth: '175px', height: '24px', fontWeight: 'bold' }}
                  onClick={handleDownloadClick}
                >
                  DOWNLOAD GESTURE DRIVE
                </button>
                <button 
                  id="btn-gesture-drive-confirm"
                  className="win95-btn"
                  style={{ minWidth: '170px', height: '24px' }}
                  onClick={handleConfirmInstalled}
                >
                  I INSTALLED GESTURE DRIVE
                </button>
                <button 
                  id="btn-gesture-drive-cancel"
                  className="win95-btn"
                  style={{ minWidth: '65px', height: '24px' }}
                  onClick={handleClose}
                >
                  CANCEL
                </button>
              </>
            ) : launchStatus === 'failed' ? (
              /* Buttons when Failed */
              <>
                <button 
                  id="btn-gesture-drive-retry"
                  className="win95-btn default-btn"
                  style={{ minWidth: '85px', height: '24px', fontWeight: 'bold' }}
                  onClick={handleLaunchClick}
                >
                  RETRY
                </button>
                <button 
                  id="btn-gesture-drive-close-failed"
                  className="win95-btn"
                  style={{ minWidth: '85px', height: '24px' }}
                  onClick={handleClose}
                >
                  CLOSE
                </button>
              </>
            ) : (
              /* Buttons when Ready */
              <>
                <button 
                  id="btn-gesture-drive-launch"
                  className="win95-btn default-btn"
                  style={{ minWidth: '170px', height: '24px', fontWeight: 'bold' }}
                  onClick={handleLaunchClick}
                >
                  LAUNCH GESTURE DRIVE
                </button>
                <button 
                  id="btn-gesture-drive-reset"
                  className="win95-btn"
                  style={{ minWidth: '180px', height: '24px' }}
                  onClick={handleResetInstallation}
                >
                  RESET INSTALLATION STATUS
                </button>
                <button 
                  id="btn-gesture-drive-cancel-ready"
                  className="win95-btn"
                  style={{ minWidth: '65px', height: '24px' }}
                  onClick={handleClose}
                >
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

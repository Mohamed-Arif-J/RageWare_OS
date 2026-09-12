import React, { useEffect, useRef, useState } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import { 
  setCameraStatus, 
  processOpticalSignals, 
  getActiveReactionWindow, 
  getRageProfile 
} from '../../engine/rageEngine';
import { soundEngine } from '../../engine/soundEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';
import { IconCamera } from './OSIcons';

/**
 * CameraApp — Step 4 Windows 95/98 "OPTICAL SENSOR" Application
 * 
 * Strict Step 4 Compliance:
 * - NO MICROPHONE: audio is strictly false.
 * - NO VOICE / NO CLOUD AI: 100% local MediaPipe face tracking.
 * - Standard Windows 95/98 UI (menus, sunken viewport, retro fieldsets, telemetry).
 * - Clear operational states: Prompt, Initializing, Denied, Unavailable, Active.
 * - Mirrored video with aligned subtle retro landmark overlay.
 * - Contextual connection to rageEngine: visual reactions only scored during post-failure reaction windows.
 * - Full cleanup on unmount: stops media tracks and marks camera inactive.
 */
export default function CameraApp({ onRageUpdate, autoStart = true, isChaosMode = true }) {
  const {
    videoRef,
    isLoading: isCamLoading,
    isStreaming,
    permissionState,
    errorMessage,
    startWebcam,
    stopWebcam,
  } = useWebcam();

  const {
    isModelLoading,
    modelError,
    baselineReady,
    telemetry,
    landmarks,
    baseline,
  } = useFaceTracking(videoRef, isStreaming);

  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('optical'); // 'optical' | 'telemetry'
  const [reactionNotice, setReactionNotice] = useState(null);

  // Automatically start optical sensor as fast as possible on boot
  useEffect(() => {
    if (autoStart && permissionState === 'prompt' && !isStreaming && !isCamLoading) {
      startWebcam();
    }
  }, [autoStart, permissionState, isStreaming, isCamLoading, startWebcam]);

  // Sync camera active status with rage engine
  useEffect(() => {
    setCameraStatus(isStreaming);
    return () => {
      setCameraStatus(false);
    };
  }, [isStreaming]);

  // Connect optical signals to Rage Engine during reaction windows (Only in Chaos Mode!)
  useEffect(() => {
    if (!isChaosMode || !isStreaming || !telemetry) return;

    // Check if optical reaction occurred
    const result = processOpticalSignals(telemetry, baseline);
    if (result && result.triggered) {
      setReactionNotice(`Optical reaction logged (+${result.delta} rage)`);
      osPersonalityInstance.recordAction('optical_reaction');
      if (onRageUpdate) onRageUpdate();

      const timer = setTimeout(() => {
        setReactionNotice(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [telemetry, baseline, isStreaming, onRageUpdate]);

  // Render subtle retro pixel landmarks onto canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || !isStreaming) return;

    const w = canvas.width;
    const h = canvas.height;

    // Subtle face bounding box
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    // Mirror X coordinates to match mirrored video feed
    const boxX = (1 - maxX) * w;
    const boxW = (maxX - minX) * w;
    const boxY = minY * h;
    const boxH = (maxY - minY) * h;

    // Retro green/cyan tracking wireframe
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Corner brackets
    const bracketSize = 10;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + bracketSize);
    ctx.lineTo(boxX, boxY);
    ctx.lineTo(boxX + bracketSize, boxY);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - bracketSize, boxY);
    ctx.lineTo(boxX + boxW, boxY);
    ctx.lineTo(boxX + boxW, boxY + bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + boxH - bracketSize);
    ctx.lineTo(boxX, boxY + boxH);
    ctx.lineTo(boxX + bracketSize, boxY + boxH);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - bracketSize, boxY + boxH);
    ctx.lineTo(boxX + boxW, boxY + boxH);
    ctx.lineTo(boxX + boxW, boxY + boxH - bracketSize);
    ctx.stroke();

    // Subtle pixel landmark dots on key features (nose, lips, eyes)
    ctx.fillStyle = '#00e5ff';
    const keyIndices = [1, 10, 152, 13, 14, 61, 291, 33, 263, 70, 300];
    keyIndices.forEach((idx) => {
      const pt = landmarks[idx];
      if (pt) {
        // Mirrored coordinate: (1 - pt.x) * w
        const px = (1 - pt.x) * w;
        const py = pt.y * h;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    });

    // Tag above bounding box
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, Math.max(0, boxY - 16), 110, 14);
    ctx.fillStyle = '#00ff66';
    ctx.font = '9px monospace';
    ctx.fillText('FACE_0: TRACKING', boxX + 4, Math.max(10, boxY - 5));
  }, [landmarks, isStreaming]);

  // Overall loading indicator
  const isLoading = isCamLoading || isModelLoading;

  return (
    <div className="win95-camera-app-shell" id="app-optical-sensor">
      {/* Retro Windows 95 Menu Bar */}
      <div className="win95-menu-bar">
        <div className="menu-bar-item"><u>F</u>ile</div>
        <div className="menu-bar-item"><u>V</u>iew</div>
        <div className="menu-bar-item"><u>S</u>ensor</div>
        <div className="menu-bar-item"><u>H</u>elp</div>
      </div>

      {/* Main Content Area */}
      <div className="camera-app-body">
        {/* Main Sunken Viewfinder Box */}
        <div className="win95-sunken-field camera-viewport-container">
          {/* Mirrored Live Video Element */}
          <video
            ref={videoRef}
            className="camera-video-feed"
            playsInline
            muted
            style={{
              display: isStreaming ? 'block' : 'none',
              transform: 'scaleX(-1)', // Mirrored natural selfie preview
            }}
          />

          {/* Mirrored Canvas Overlay for Face Wireframe */}
          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            className="camera-canvas-overlay"
            style={{ display: isStreaming ? 'block' : 'none' }}
          />

          {/* STATE 1: Before Permission Prompt */}
          {!isStreaming && !isLoading && permissionState === 'prompt' && (
            <div className="camera-state-screen prompt-state">
              <IconCamera size={44} />
              <div className="state-title">OPTICAL SENSOR</div>
              <div className="state-subtitle">Camera access required for reaction telemetry.</div>
              <div className="state-notice">
                Local-only processing via MediaPipe. Audio is disabled (audio: false).
              </div>
              <button
                id="btn-enable-camera"
                className="win95-btn default-btn"
                onClick={startWebcam}
              >
                [ ENABLE CAMERA ]
              </button>
            </div>
          )}

          {/* STATE 2: Loading / Initializing */}
          {isLoading && (
            <div className="camera-state-screen loading-state">
              <div className="loading-spinner-win95" />
              <div className="state-title">INITIALIZING OPTICAL SENSOR...</div>
              <div className="loading-steps">
                <div>• Loading camera driver (VFW32)...</div>
                <div>• Initializing local MediaPipe FaceLandmarker...</div>
                <div>• Calibrating baseline optical response...</div>
              </div>
            </div>
          )}

          {/* STATE 3: Permission Denied */}
          {!isLoading && permissionState === 'denied' && (
            <div className="camera-state-screen denied-state">
              <div className="warning-icon-retro">⚠️</div>
              <div className="state-title">OPTICAL SENSOR</div>
              <div className="state-error-text">CAMERA ACCESS DENIED.</div>
              <div className="state-note">
                RAGEWARE will continue operating normally without optical tracking.
              </div>
              <button
                className="win95-btn default-btn"
                onClick={startWebcam}
              >
                [ RETRY ]
              </button>
            </div>
          )}

          {/* STATE 4: Camera Unavailable or Error */}
          {!isLoading && (permissionState === 'unavailable' || permissionState === 'unsupported' || modelError) && (
            <div className="camera-state-screen unavailable-state">
              <div className="warning-icon-retro">⚠️</div>
              <div className="state-title">OPTICAL SENSOR</div>
              <div className="state-error-text">
                {modelError ? 'MODEL INITIALIZATION FAILED.' : 'NO CAMERA AVAILABLE.'}
              </div>
              <div className="state-note">
                {errorMessage || 'Camera-dependent features are disabled. OS continues normally.'}
              </div>
              <button
                className="win95-btn"
                onClick={startWebcam}
              >
                [ RETRY ]
              </button>
            </div>
          )}

          {/* On-screen Reaction Window Indicator Banner */}
          {isStreaming && (
            <div className="camera-onscreen-hud">
              <div className="hud-left-status">
                <span className="rec-indicator-circle">●</span>
                <span>VFW_V32: ONLINE</span>
              </div>
              {reactionNotice ? (
                <div className="hud-reaction-alert">{reactionNotice}</div>
              ) : getActiveReactionWindow() ? (
                <div className="hud-reaction-observing">OBSERVING REACTION...</div>
              ) : (
                <div className="hud-reaction-idle">REACTION MONITOR: IDLE</div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Telemetry & Controls Panel */}
        <div className="camera-telemetry-panel">
          {/* Telemetry Grid */}
          <fieldset className="win95-fieldset">
            <legend>Optical Telemetry</legend>
            <div className="telemetry-grid">
              <div className="telemetry-row">
                <span className="telemetry-label">OPTICAL STATUS:</span>
                <span className={`telemetry-val ${isStreaming ? 'text-success' : 'text-danger'}`}>
                  {isStreaming ? (baselineReady ? 'ONLINE (CALIBRATED)' : 'ONLINE (CALIBRATING)') : 'OFFLINE'}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">FACE:</span>
                <span className="telemetry-val">
                  {telemetry.faceDetected ? 'DETECTED' : 'SEARCHING...'}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">FACES COUNT:</span>
                <span className="telemetry-val">{telemetry.facesCount}</span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">HEAD MOVEMENT:</span>
                <span className={`telemetry-val val-${telemetry.headMovement}`}>
                  {telemetry.headMovement.toUpperCase()}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">MOUTH ACTIVITY:</span>
                <span className="telemetry-val">
                  {telemetry.mouthOpen ? 'OPEN (ACTIVE)' : 'CLOSED (NORMAL)'}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">FACIAL ACTIVITY:</span>
                <span className="telemetry-val font-mono">
                  {Math.round(telemetry.facialActivity * 100)}%
                </span>
              </div>
            </div>
          </fieldset>

          {/* Action Button Strip */}
          <div className="camera-actions-row">
            {isStreaming ? (
              <button
                id="btn-camera-stop"
                className="win95-btn"
                onClick={stopWebcam}
              >
                ■ Stop Sensor
              </button>
            ) : (
              <button
                id="btn-camera-start"
                className="win95-btn default-btn"
                onClick={startWebcam}
                disabled={isLoading}
              >
                ▶ Start Sensor
              </button>
            )}

            <button
              className="win95-btn"
              onClick={() => {
                soundEngine.playDing();
                alert(
                  'OPTICAL SENSOR DRIVER INFO\n\n' +
                  'Driver: RAGE_VFW32.DRV (DirectShow / MediaPipe)\n' +
                  'Model: MediaPipe FaceLandmarker v1.0.1 (Local Browser WASM)\n' +
                  'Format: 640x480, 24-bit RGB (audio: false)\n' +
                  'Privacy: 100% In-Memory. No frames or biometric data are ever stored or uploaded.'
                );
              }}
            >
              Driver Info...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    recalibrate,
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
    if (!isChaosMode || !isStreaming || !telemetry || !baselineReady) return;

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
  }, [telemetry, baseline, baselineReady, isStreaming, isChaosMode, onRageUpdate]);

  // Render subtle retro pixel landmarks onto canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || !isStreaming || !video) return;

    // Dynamically match canvas internal pixel resolution to its actual client dimensions
    const cw = canvas.clientWidth || 480;
    const ch = canvas.clientHeight || 220;
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    // Video stream intrinsic dimensions
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // Calculate exact rendered video dimensions and offset inside container (object-fit: cover)
    const scale = Math.max(cw / vw, ch / vh);
    const renderW = vw * scale;
    const renderH = vh * scale;
    const offsetX = (cw - renderW) / 2;
    const offsetY = (ch - renderH) / 2;

    // Coordinate mapping functions from normalized landmark [0, 1] to exact canvas pixels:
    // Video has CSS transform: scaleX(-1), so mirrored X is: offsetX + (1 - normX) * renderW
    const toScreenX = (normX) => offsetX + (1 - normX) * renderW;
    const toScreenY = (normY) => offsetY + normY * renderH;

    // Subtle face bounding box
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    // Convert to screen coordinates with slight padding
    const rawBoxLeft = toScreenX(maxX); // Mirrored: maxX in video is left on screen
    const rawBoxRight = toScreenX(minX);
    const rawBoxTop = toScreenY(minY);
    const rawBoxBottom = toScreenY(maxY);

    const padX = Math.max(4, (rawBoxRight - rawBoxLeft) * 0.04);
    const padY = Math.max(4, (rawBoxBottom - rawBoxTop) * 0.04);

    const boxX = Math.round(rawBoxLeft - padX);
    const boxY = Math.round(rawBoxTop - padY);
    const boxW = Math.round((rawBoxRight - rawBoxLeft) + padX * 2);
    const boxH = Math.round((rawBoxBottom - rawBoxTop) + padY * 2);

    // Retro green/cyan tracking wireframe
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Corner brackets
    const bracketSize = 12;
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

    // Draw connected facial wireframe contours
    const drawContour = (indices, color = '#00ff66', close = false) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3;
      let first = true;
      indices.forEach((idx) => {
        const pt = landmarks[idx];
        if (pt) {
          const px = toScreenX(pt.x);
          const py = toScreenY(pt.y);
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      });
      if (close) ctx.closePath();
      ctx.stroke();
    };

    // Dynamic eyebrow contour color: red if furrowed/tense, yellow if raised, cyan if resting
    const browColor = (telemetry?.eyebrowTension || 0) > 0.40
      ? '#ff3344'
      : (telemetry?.eyebrowsRaised || telemetry?.primaryExpression?.includes('RAISED') ? '#ffff00' : '#00e5ff');

    // Left Eyebrow arch (subject's right brow)
    drawContour([70, 63, 105, 66, 107, 55, 65, 52, 53, 46], browColor);
    // Right Eyebrow arch (subject's left brow)
    drawContour([300, 293, 334, 296, 336, 285, 295, 282, 283, 276], browColor);
    // Left Eye contour (subject's right eye, screen left)
    drawContour([33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246], '#00ff66', true);
    // Right Eye contour (subject's left eye, screen right)
    drawContour([263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466], '#00ff66', true);
    // Nose bridge and tip (clean line stopping at bottom of nose, no mouth bleed)
    drawContour([168, 6, 197, 195, 5, 4, 1, 2], '#ffff00');
    // Nose nostril base
    drawContour([98, 97, 2, 326, 327], '#ffff00');
    // Lips contour (turns orange/red if agitation / tense)
    const lipsColor = (telemetry?.agitationScore || 0) > 50 ? '#ff3344' : '#00ff66';
    // Outer lips loop
    drawContour([61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146], lipsColor, true);
    // Inner lips opening loop
    drawContour([78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95], lipsColor, true);

    // Pixel landmark points
    ctx.fillStyle = '#00e5ff';
    const keyIndices = [1, 10, 152, 13, 14, 61, 291, 33, 263, 70, 300, 168];
    keyIndices.forEach((idx) => {
      const pt = landmarks[idx];
      if (pt) {
        const px = toScreenX(pt.x);
        const py = toScreenY(pt.y);
        ctx.fillRect(Math.round(px - 1.5), Math.round(py - 1.5), 3, 3);
      }
    });

    // Tag above bounding box
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, Math.max(0, boxY - 18), 125, 16);
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FACE_0: TRACKING', boxX + 4, Math.max(12, boxY - 6));

    // Live Expression Banner below bounding box
    const exprText = telemetry?.primaryExpression || 'TRACKING...';
    const agText = `AGITATION: ${telemetry?.agitationScore || 0}%`;
    const bannerY = Math.min(ch - 6, boxY + boxH + 18);
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, boxY + boxH + 4, Math.max(boxW, 210), 18);
    ctx.fillStyle = (telemetry?.agitationScore || 0) > 55 ? '#ff4444' : '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`[${exprText}] [${agText}]`, boxX + 4, bannerY);
  }, [landmarks, isStreaming, telemetry]);

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
            <legend>Optical Telemetry & Expression Analysis</legend>
            <div className="telemetry-grid">
              <div className="telemetry-row">
                <span className="telemetry-label">OPTICAL STATUS:</span>
                <span className={`telemetry-val ${isStreaming ? 'text-success' : 'text-danger'}`}>
                  {isStreaming ? (baselineReady ? 'ONLINE (CALIBRATED)' : 'ONLINE (CALIBRATING)') : 'OFFLINE'}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">EXPRESSION:</span>
                <span
                  className="telemetry-val"
                  style={{
                    fontWeight: 'bold',
                    color:
                      telemetry.primaryExpression?.includes('ANNOYED') || telemetry.primaryExpression?.includes('DISAPPROVAL')
                        ? '#cc0000'
                        : telemetry.primaryExpression?.includes('SMILING')
                        ? '#008800'
                        : '#0000aa',
                  }}
                >
                  {telemetry.faceDetected ? (telemetry.primaryExpression || 'NEUTRAL') : 'SEARCHING...'}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">AGITATION INDEX:</span>
                <span className="telemetry-val font-mono" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    className="sunken"
                    style={{
                      width: '60px',
                      height: '10px',
                      background: '#fff',
                      display: 'inline-block',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${telemetry.agitationScore || 0}%`,
                        height: '100%',
                        background: (telemetry.agitationScore || 0) > 60 ? '#ff3333' : (telemetry.agitationScore || 0) > 30 ? '#ffaa00' : '#00aa44',
                      }}
                    />
                  </div>
                  <strong>{telemetry.agitationScore || 0}%</strong>
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">EYEBROW TENSION:</span>
                <span className="telemetry-val font-mono">
                  {Math.round((telemetry.eyebrowTension || 0) * 100)}%{' '}
                  {telemetry.eyebrowTension > 0.40
                    ? '⚠️ (FURROWED)'
                    : telemetry.eyebrowsRaised || telemetry.primaryExpression?.includes('RAISED')
                    ? '▲ (RAISED)'
                    : '(RELAXED)'}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">HEAD MOTION:</span>
                <span className={`telemetry-val val-${telemetry.headMovement}`}>
                  {telemetry.isHeadShaking ? '⚠️ SHAKING (DISAPPROVAL)' : (telemetry.headMovement || 'LOW').toUpperCase()}
                </span>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">MOUTH / JAW:</span>
                <span className="telemetry-val">
                  {telemetry.mouthOpen ? 'OPEN (EXASPERATED)' : (telemetry.smileApproximation > 0.45 ? 'SMILING' : 'CLOSED (RESTING)')}
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

            {isStreaming && (
              <button
                id="btn-camera-recalibrate"
                className="win95-btn"
                onClick={() => {
                  soundEngine.playDing?.() || soundEngine.playClick();
                  recalibrate();
                }}
                title="Recalibrate your neutral resting face"
              >
                🎯 Recalibrate
              </button>
            )}

            <button
              className="win95-btn"
              onClick={() => {
                soundEngine.playDing();
                alert(
                  'OPTICAL SENSOR DRIVER INFO\n\n' +
                  'Driver: RAGE_VFW32.DRV (DirectShow / MediaPipe)\n' +
                  'Model: MediaPipe FaceLandmarker (Local Browser WASM)\n' +
                  'Tracking: Dynamic Eyebrow Contraction, Head Jitter & Agitation Index\n' +
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

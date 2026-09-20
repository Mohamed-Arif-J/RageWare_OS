import React, { useState, useRef, useEffect } from 'react';
import { IconFolder, IconFile, IconWarning, IconMusic, IconImage, IconVideo } from './OSIcons';
import { increaseRage, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';
import { rageBaitEngineInstance } from '../../engine/rageBaitEngine';
import { soundEngine } from '../../engine/soundEngine';
import { virtualFs } from '../../services/virtualFs';

export default function FileManager({ onRageUpdate, isChaosMode = true }) {
  const [fs, setFs] = useState(() => virtualFs.getFileSystem());
  const [currentFolderId, setCurrentFolderId] = useState('documents');
  const [history, setHistory] = useState(['root', 'documents']);
  const [historyIndex, setHistoryIndex] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState(false);

  // Sync virtual filesystem changes
  useEffect(() => {
    return virtualFs.subscribe((updatedFs) => {
      setFs({ ...updatedFs });
    });
  }, []);

  // Hostile file evasion state
  const [hoveredFileOffset, setHoveredFileOffset] = useState({});
  const [permissionModal, setPermissionModal] = useState(null);
  const [permBtnOffset, setPermBtnOffset] = useState({ x: 0, y: 0 });
  const [permEscapes, setPermEscapes] = useState(0);

  const folder = fs[currentFolderId] || fs.root;

  const navigateTo = (newFolderId) => {
    if (!fs[newFolderId]) return;
    const newHistory = [...history.slice(0, historyIndex + 1), newFolderId];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(newFolderId);
    setSelectedItemId(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolderId(history[historyIndex - 1]);
      setSelectedItemId(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolderId(history[historyIndex + 1]);
      setSelectedItemId(null);
    }
  };

  const handleUp = () => {
    if (folder.parent && fs[folder.parent]) {
      navigateTo(folder.parent);
    }
  };

  // Hostile file hover: file shifts slightly away only in Chaos Mode!
  const handleItemMouseEnter = (item) => {
    if (isChaosMode && item.isHostile && Math.random() < 0.5) {
      const offsetX = (Math.random() > 0.5 ? 1 : -1) * Math.floor(16 + Math.random() * 20);
      const offsetY = (Math.random() > 0.5 ? 1 : -1) * Math.floor(10 + Math.random() * 14);
      setHoveredFileOffset((prev) => ({
        ...prev,
        [item.id]: { x: offsetX, y: offsetY },
      }));
      soundEngine.playBoing();

      increaseRage(6, RAGE_EVENTS.FILE_HOVER_ESCAPE);
      if (onRageUpdate) onRageUpdate();

      setTimeout(() => {
        setHoveredFileOffset((prev) => ({
          ...prev,
          [item.id]: { x: 0, y: 0 },
        }));
      }, 700);
    }
  };

  const handleItemDoubleClick = (item) => {
    if (isChaosMode && rageBaitEngineInstance.tracker) {
      rageBaitEngineInstance.tracker.recordFileAccess(item.name);
    }

    if (item.type === 'folder') {
      navigateTo(item.id);
    } else if (isChaosMode && item.isProtected) {
      setPermissionModal(item);
      setPermBtnOffset({ x: 0, y: 0 });
      setPermEscapes(0);
      soundEngine.playCriticalStop();
      increaseRage(10, RAGE_EVENTS.FILE_PERMISSION_DENIED);
      if (onRageUpdate) onRageUpdate();
    } else {
      setPreviewFile(item);
      setUseYoutubeFallback(false);
      if (item.type === 'video') {
        soundEngine.init();
        if (item.isRickRoll) {
          increaseRage(12, RAGE_EVENTS.FAKE_ERROR);
          soundEngine.playDing();
          if (onRageUpdate) onRageUpdate();
        }
      } else if (item.type === 'audio') {
        soundEngine.init();
        setIsPlaying(true);
        setTimeout(() => {
          if (item.melodyId) {
            soundEngine.play80sMelody(item.melodyId);
          }
          if (audioRef.current && item.url) {
            audioRef.current.play().catch(() => {});
          }
        }, 80);
      }
    }
  };

  const handlePermBtnHover = () => {
    if (isChaosMode && permEscapes < 4) {
      const deltaX = (Math.random() - 0.5) * 80;
      const deltaY = (Math.random() - 0.5) * 40;
      setPermBtnOffset({ x: deltaX, y: deltaY });
      soundEngine.playBoing();
      setPermEscapes((prev) => prev + 1);
      increaseRage(8, RAGE_EVENTS.FILE_PERMISSION_DENIED);
      if (onRageUpdate) onRageUpdate();
    }
  };

  const handlePermGrant = (item) => {
    recordSuccess();
    soundEngine.playDing();
    if (onRageUpdate) onRageUpdate();
    setPermissionModal(null);
    setPreviewFile(item);
  };

  const handlePlayAudio = () => {
    soundEngine.init();
    setIsPlaying(true);
    if (audioRef.current && previewFile?.url) {
      audioRef.current.play().catch(() => {
        if (previewFile?.melodyId) {
          soundEngine.play80sMelody(previewFile.melodyId);
        }
      });
    } else if (previewFile?.melodyId) {
      soundEngine.play80sMelody(previewFile.melodyId);
    }
  };

  const handlePauseAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    soundEngine.stop80sMelody();
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    soundEngine.stop80sMelody();
  };

  const handleClosePreview = () => {
    handleStopAudio();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setUseYoutubeFallback(false);
    setPreviewFile(null);
  };

  const renderItemIcon = (item) => {
    if (item.type === 'folder') return <IconFolder size={32} />;
    if (item.type === 'audio') return <IconMusic size={28} />;
    if (item.type === 'image') return <IconImage size={28} />;
    if (item.type === 'video') return <IconVideo size={28} />;
    return <IconFile size={28} />;
  };

  return (
    <div className="win95-file-manager" id="app-file-manager">
      {/* Toolbar */}
      <div className="fm-toolbar-row">
        <div className="fm-btn-group">
          <button 
            className="win95-btn btn-sm" 
            onClick={handleBack}
            disabled={historyIndex === 0}
            title="Back"
          >
            &#9664; Back
          </button>
          <button 
            className="win95-btn btn-sm" 
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            title="Forward"
          >
            Forward &#9654;
          </button>
          <button 
            className="win95-btn btn-sm" 
            onClick={handleUp}
            disabled={!folder.parent}
            title="Up one level"
          >
            &#9650; Up
          </button>
        </div>

        <div className="fm-address-box">
          <span className="address-label">Address:</span>
          <div className="address-field sunken">
            {folder.name}
          </div>
        </div>
      </div>

      {/* Main Files Area - Sunken White Canvas */}
      <div className="fm-client-area sunken">
        <div className="fm-files-grid">
          {folder.items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const offset = hoveredFileOffset[item.id] || { x: 0, y: 0 };

            return (
              <div
                key={item.id}
                id={`fm-item-${item.id}`}
                className={`win95-file-item ${isSelected ? 'selected' : ''}`}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  transition: 'transform 0.12s ease-out',
                }}
                onMouseEnter={() => handleItemMouseEnter(item)}
                onClick={() => setSelectedItemId(item.id)}
                onDoubleClick={() => handleItemDoubleClick(item)}
              >
                <div className="file-item-icon">
                  {renderItemIcon(item)}
                </div>
                <span className="file-item-name">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="fm-status-strip">
        <div className="status-cell sunken">{folder.items.length} object(s)</div>
        <div className="status-cell sunken">Disk Space: 42.8 MB free</div>
      </div>

      {/* Classic Permission Denied Dialog */}
      {permissionModal && (
        <div className="os-dialog-backdrop" onClick={() => setPermissionModal(null)}>
          <div className="os-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">Access Denied</span>
              <button className="dialog-close-btn" onClick={() => setPermissionModal(null)}>&#10005;</button>
            </div>
            <div className="os-dialog-content">
              <IconWarning size={32} />
              <div className="os-dialog-msg">
                Cannot open <strong>'{permissionModal.name}'</strong>.<br />
                Security clearance level required. (Escapes: {permEscapes})
              </div>
            </div>
            <div className="os-dialog-actions" style={{ minHeight: '40px', position: 'relative' }}>
              <button
                className="win95-btn default-btn"
                style={{
                  transform: `translate(${permBtnOffset.x}px, ${permBtnOffset.y}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
                onMouseEnter={handlePermBtnHover}
                onClick={() => handlePermGrant(permissionModal)}
              >
                Elevate
              </button>
              <button 
                className="win95-btn"
                onClick={() => setPermissionModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Retro Windows Media Player 6.4 (Audio / 80s & 90s Music) */}
      {previewFile && previewFile.type === 'audio' && (
        <div className="os-dialog-backdrop" onClick={handleClosePreview}>
          <div className="os-dialog-box media-player-dialog" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">Windows Media Player - {previewFile.name}</span>
              <button className="dialog-close-btn" onClick={handleClosePreview}>&#10005;</button>
            </div>

            <div className="media-player-body">
              {/* LCD Display Screen */}
              <div className="media-player-screen sunken">
                <div className="media-track-header">
                  <span className="track-title-text mono">{previewFile.title || previewFile.name}</span>
                  <span className="track-time-text mono">{isPlaying ? '01:24' : '00:00'} / {previewFile.duration || '03:30'}</span>
                </div>
                <div className="media-track-sub mono">
                  <span>{previewFile.artist} &bull; {previewFile.album}</span>
                  <span className="bitrate-badge">128 KBPS STEREO</span>
                </div>

                {/* Animated Graphic Equalizer */}
                <div className="media-equalizer-bars">
                  {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`eq-bar ${isPlaying ? 'animating' : 'idle'}`}
                      style={{ 
                        animationDelay: `${(i * 0.07) % 0.5}s`,
                        animationDuration: `${0.32 + (i % 5) * 0.08}s` 
                      }} 
                    />
                  ))}
                </div>
              </div>

              {/* Audio element for real streaming */}
              {previewFile.url && (
                <audio 
                  ref={audioRef}
                  src={previewFile.url} 
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    if (isPlaying && previewFile.melodyId) {
                      soundEngine.play80sMelody(previewFile.melodyId);
                    }
                  }}
                />
              )}

              {/* Retro Win95 Playback Control Deck */}
              <div className="media-controls-deck">
                <div className="media-btn-row">
                  <button 
                    className="win95-btn btn-player-ctrl" 
                    onClick={handlePlayAudio}
                    title="Play"
                  >
                    &#9658; Play
                  </button>
                  <button 
                    className="win95-btn btn-player-ctrl" 
                    onClick={handlePauseAudio}
                    title="Pause"
                  >
                    ❚❚ Pause
                  </button>
                  <button 
                    className="win95-btn btn-player-ctrl" 
                    onClick={handleStopAudio}
                    title="Stop"
                  >
                    &#9632; Stop
                  </button>
                </div>
                <div className="player-status-tag mono">
                  GENRE: <strong>{previewFile.genre || 'CLASSIC HITS'}</strong> &bull; STATUS: <strong>{isPlaying ? 'PLAYING' : 'STOPPED'}</strong>
                </div>
              </div>
            </div>

            <div className="os-dialog-actions">
              <button className="win95-btn default-btn" onClick={handleClosePreview}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Imaging for Windows 95 (Pictures) */}
      {previewFile && previewFile.type === 'image' && (
        <div className="os-dialog-backdrop" onClick={handleClosePreview}>
          <div className="os-dialog-box image-viewer-dialog" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">{previewFile.name} - Imaging for Windows 95</span>
              <button className="dialog-close-btn" onClick={handleClosePreview}>&#10005;</button>
            </div>

            <div className="image-viewer-toolbar">
              <span className="viewer-tool-tag mono">&#128269; 100%</span>
              <span className="viewer-tool-tag mono">&#9635; {previewFile.dimensions || '1024x768'}</span>
              <span className="viewer-caption mono">{previewFile.caption}</span>
            </div>

            <div className="image-viewer-canvas sunken">
              <img 
                src={previewFile.url} 
                alt={previewFile.name}
                className="viewer-main-img"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-fallback-box" style={{ display: 'none' }}>
                <span className="fallback-icon">&#128444;</span>
                <p>Preview cached in virtual filesystem.</p>
                <small>{previewFile.caption}</small>
              </div>
            </div>

            <div className="os-dialog-actions">
              <button className="win95-btn default-btn" onClick={handleClosePreview}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ActiveMovie Control (Videos & Rickroll) */}
      {previewFile && previewFile.type === 'video' && (
        <div className="os-dialog-backdrop" onClick={handleClosePreview}>
          <div className="os-dialog-box video-player-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">ActiveMovie Control - {previewFile.name}</span>
              <button className="dialog-close-btn" onClick={handleClosePreview}>&#10005;</button>
            </div>

            {/* Rickroll Troll Banner */}
            {previewFile.isRickRoll && (
              <div className="rickroll-alert-banner">
                <span className="rickroll-troll-icon">🕺</span>
                <div className="rickroll-banner-text mono">
                  <strong>★ YOU HAVE BEEN RICKROLLED BY TEAM AltF4! ★</strong>
                  <small>Never Gonna Give You Up &bull; Maximum Cognitive Friction</small>
                </div>
                <span className="rickroll-troll-icon">🕺</span>
              </div>
            )}

            <div className="video-player-frame sunken">
              {useYoutubeFallback ? (
                <iframe 
                  src={previewFile.embedUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'}
                  title={previewFile.name}
                  width="100%" 
                  height="300" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="viewer-embed-iframe"
                />
              ) : (
                <video 
                  ref={videoRef}
                  src={previewFile.url} 
                  controls 
                  autoPlay 
                  playsInline
                  className="viewer-main-video"
                  onError={() => {
                    if (previewFile.embedUrl) {
                      setUseYoutubeFallback(true);
                    }
                  }}
                >
                  Your browser does not support HTML5 video.
                </video>
              )}
            </div>

            <div className="video-info-strip mono">
              <div className="video-info-left">
                <span>FORMAT: <strong>{previewFile.resolution || '640x480 MPEG-4'}</strong></span>
                <span>{previewFile.caption}</span>
              </div>
              {previewFile.embedUrl && (
                <button 
                  className="win95-btn btn-toggle-stream"
                  onClick={() => setUseYoutubeFallback((prev) => !prev)}
                >
                  {useYoutubeFallback ? '▶ ActiveMovie Stream' : '📺 YouTube HD Stream'}
                </button>
              )}
            </div>

            <div className="os-dialog-actions">
              {previewFile.isRickRoll && (
                <span className="rickroll-status-hint mono" style={{ marginRight: 'auto', fontSize: '11px', color: '#cc0000', fontWeight: 'bold' }}>
                  ★ PAYLOAD: Never_Gonna_Give_You_Up.mp4
                </span>
              )}
              <button className="win95-btn default-btn" onClick={handleClosePreview}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Classic Notepad (Text Files) */}
      {previewFile && previewFile.type !== 'audio' && previewFile.type !== 'image' && previewFile.type !== 'video' && (
        <div className="os-dialog-backdrop" onClick={handleClosePreview}>
          <div className="os-dialog-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">{previewFile.name} - Notepad</span>
              <button className="dialog-close-btn" onClick={handleClosePreview}>&#10005;</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div className="win95-sunken-field" style={{ minHeight: '120px', background: '#fff', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-dos)' }}>
                {previewFile.content}
              </div>
            </div>
            <div className="os-dialog-actions">
              <button className="win95-btn default-btn" onClick={handleClosePreview}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

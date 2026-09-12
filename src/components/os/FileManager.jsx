import React, { useState, useRef } from 'react';
import { IconFolder, IconFile, IconWarning, IconMusic, IconImage, IconVideo } from './OSIcons';
import { increaseRage, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';
import { rageBaitEngineInstance } from '../../engine/rageBaitEngine';
import { soundEngine } from '../../engine/soundEngine';

const FAKE_FS = {
  root: {
    name: 'C:\\',
    items: [
      { id: 'documents', name: 'My Documents', type: 'folder', size: '64 MB', date: '09/11/98' },
      { id: 'programs', name: 'Program Files', type: 'folder', size: '480 MB', date: '09/11/98' },
      { id: 'system', name: 'System', type: 'folder', size: '124 MB', date: '09/11/98' },
      { id: 'downloads', name: 'Downloads', type: 'folder', size: '12 MB', date: '09/11/98' },
      { id: 'user', name: 'User', type: 'folder', size: '1.1 GB', date: '09/11/98' },
    ],
  },
  documents: {
    name: 'C:\\USER\\DOCUMENTS',
    parent: 'root',
    items: [
      { id: 'music', name: 'Music', type: 'folder', size: '32 MB', date: '09/11/98' },
      { id: 'pictures', name: 'Pictures', type: 'folder', size: '12 MB', date: '09/11/98' },
      { id: 'videos', name: 'Videos', type: 'folder', size: '18 MB', date: '09/11/98' },
      { id: 'doc_important', name: 'Important.txt', type: 'file', size: '4 KB', date: '09/11/98', isHostile: true, content: 'MEMO:\nSubject tolerance level is diminishing.\nAdversarial desktop modulation is operating within expected parameters.' },
      { id: 'doc_project', name: 'Project.zip', type: 'file', size: '18 MB', date: '09/10/98', isHostile: true, content: 'ARCHIVE:\n[1] rageware_core.sys\n[2] frustration_matrix.dll' },
      { id: 'doc_resume', name: 'Resume.pdf', type: 'file', size: '12 KB', date: '09/08/98', isHostile: true, content: 'CURRICULUM VITAE:\nName: SUBJECT_049\nSpecialization: Human Patience Endurance\nStatus: Under Active Psychological Strain' },
      { id: 'doc_secret', name: 'Secret.dat', type: 'file', size: '64 KB', date: '09/01/98', isHostile: true, isProtected: true, content: 'CLASSIFIED ACCESS TOKEN:\n0x99_RAGE_OVERRIDE_ENABLED' },
    ],
  },
  music: {
    name: 'C:\\USER\\DOCUMENTS\\MUSIC',
    parent: 'documents',
    items: [
      { 
        id: 'music_rickroll', 
        name: 'Never_Gonna_Give_You_Up_1987.mp3', 
        type: 'audio', 
        size: '3.2 MB', 
        date: '11/12/87', 
        artist: 'Rick Astley', 
        title: 'Never Gonna Give You Up',
        album: 'Whenever You Need Somebody (1987)', 
        year: '1987', 
        genre: '80s Dance Pop',
        duration: '03:32',
        melodyId: 'rickroll',
        url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3'
      },
      { 
        id: 'music_takeonme', 
        name: 'Take_On_Me_1985.mp3', 
        type: 'audio', 
        size: '3.5 MB', 
        date: '10/19/85', 
        artist: 'a-ha', 
        title: 'Take On Me',
        album: 'Hunting High and Low (1985)', 
        year: '1985', 
        genre: '80s Synthpop',
        duration: '03:45',
        melodyId: 'takeonme',
      },
      { 
        id: 'music_billiejean', 
        name: 'Billie_Jean_1982.mp3', 
        type: 'audio', 
        size: '4.5 MB', 
        date: '01/02/82', 
        artist: 'Michael Jackson', 
        title: 'Billie Jean',
        album: 'Thriller (1982)', 
        year: '1982', 
        genre: '80s Funk / Pop',
        duration: '04:54',
        melodyId: 'billiejean',
      },
      { 
        id: 'music_axelf', 
        name: 'Axel_F_Synth_Theme_1984.mid', 
        type: 'audio', 
        size: '52 KB', 
        date: '12/01/84', 
        artist: 'Harold Faltermeyer', 
        title: 'Axel F (Theme)',
        album: 'Beverly Hills Cop (1984)', 
        year: '1984', 
        genre: '80s Electronic Synth',
        duration: '03:00',
        melodyId: 'axelf',
      },
      { 
        id: 'music_smells', 
        name: 'Smells_Like_Teen_Spirit_1991.mp3', 
        type: 'audio', 
        size: '4.8 MB', 
        date: '09/24/91', 
        artist: 'Nirvana', 
        title: 'Smells Like Teen Spirit',
        album: 'Nevermind (1991)', 
        year: '1991', 
        genre: '90s Grunge Rock',
        duration: '05:01',
        melodyId: 'smells',
      },
      { 
        id: 'music_backstreet', 
        name: 'I_Want_It_That_Way_1999.mp3', 
        type: 'audio', 
        size: '3.3 MB', 
        date: '04/12/99', 
        artist: 'Backstreet Boys', 
        title: 'I Want It That Way',
        album: 'Millennium (1999)', 
        year: '1999', 
        genre: '90s Boyband Pop',
        duration: '03:33',
        melodyId: 'backstreet',
      },
      { 
        id: 'music_sandstorm', 
        name: 'Sandstorm_Club_Mix_1999.mp3', 
        type: 'audio', 
        size: '3.6 MB', 
        date: '11/15/99', 
        artist: 'Darude', 
        title: 'Sandstorm',
        album: 'Before the Storm (1999)', 
        year: '1999', 
        genre: '90s Eurodance Trance',
        duration: '03:44',
        melodyId: 'sandstorm',
      },
      { 
        id: 'music_britney', 
        name: 'Baby_One_More_Time_1998.mp3', 
        type: 'audio', 
        size: '3.4 MB', 
        date: '10/23/98', 
        artist: 'Britney Spears', 
        title: '...Baby One More Time',
        album: '...Baby One More Time (1998)', 
        year: '1998', 
        genre: '90s Teen Pop',
        duration: '03:30',
        melodyId: 'britney',
      },
    ],
  },
  pictures: {
    name: 'C:\\USER\\DOCUMENTS\\PICTURES',
    parent: 'documents',
    items: [
      {
        id: 'pic_battlestation',
        name: 'Retro_PC_Battlestation_1995.jpg',
        type: 'image',
        size: '1.8 MB',
        date: '09/02/98',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop',
        caption: 'Authentic 90s Computer Setup with CRT Monitor & Mechanical Keyboard',
        dimensions: '1024 x 768',
      },
      {
        id: 'pic_cassette',
        name: 'Vintage_Cassette_Tape_80s.jpg',
        type: 'image',
        size: '2.1 MB',
        date: '08/14/98',
        url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop',
        caption: 'Classic 1980s Magnetic Audio Cassette Mix Tape',
        dimensions: '800 x 600',
      },
      {
        id: 'pic_floppy',
        name: 'Floppy_Disk_Collection.jpg',
        type: 'image',
        size: '980 KB',
        date: '07/20/98',
        url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop',
        caption: 'High-Density 3.5-inch 1.44MB Magnetic Diskettes',
        dimensions: '800 x 600',
      },
      {
        id: 'pic_synthwave',
        name: 'Synthwave_Neon_Grid_1984.jpg',
        type: 'image',
        size: '2.4 MB',
        date: '06/11/98',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop',
        caption: 'Retro-Futuristic Neon Grid Wireframe Landscape',
        dimensions: '1280 x 720',
      },
    ],
  },
  videos: {
    name: 'C:\\USER\\DOCUMENTS\\VIDEOS',
    parent: 'documents',
    items: [
      {
        id: 'vid_rickroll',
        name: 'Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        type: 'video',
        size: '21.1 MB',
        date: '11/12/87',
        url: 'https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
        caption: 'Rick Astley - Never Gonna Give You Up (1987 / ActiveMovie 98)',
        resolution: '640 x 480 MPEG-4',
        isRickRoll: true,
      },
      {
        id: 'vid_secret_rickroll',
        name: 'CLASSIFIED_OS_EXPLOIT_DO_NOT_OPEN.mp4',
        type: 'video',
        size: '21.1 MB',
        date: '09/12/98',
        url: 'https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
        caption: 'WARNING: Cognitive Adversary Triggered! (Official AltF4 Rickroll)',
        resolution: '640 x 480 MPEG-4',
        isRickRoll: true,
      },
      {
        id: 'vid_nature',
        name: 'Nature_Documentary_Clip.mp4',
        type: 'video',
        size: '1.1 MB',
        date: '09/01/98',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        caption: 'ActiveMovie Botanical Movement Sequence',
        resolution: '320 x 240 Cinepak',
      },
      {
        id: 'vid_motion',
        name: 'Classic_Motion_Video_1998.mp4',
        type: 'video',
        size: '512 KB',
        date: '08/28/98',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
        caption: '1998 Digital Video Stream Test',
        resolution: '320 x 240 Cinepak',
      },
    ],
  },
  programs: {
    name: 'C:\\PROGRAM FILES',
    parent: 'root',
    items: [
      { id: 'prog_mon', name: 'Sysmon.exe', type: 'file', size: '14 MB', date: '09/09/98', content: 'SYSTEM MONITOR PROGRAM\nDiagnostic tool.' },
      { id: 'prog_term', name: 'Command.exe', type: 'file', size: '8 MB', date: '09/07/98', content: 'COMMAND PROMPT INTERPRETER' },
    ],
  },
  system: {
    name: 'C:\\SYSTEM',
    parent: 'root',
    items: [
      { id: 'sys_cfg', name: 'rageware.sys', type: 'file', size: '3.4 MB', date: '09/11/98', content: 'KERNEL CONFIGURATION' },
      { id: 'drivers', name: 'drivers.bin', type: 'file', size: '48 MB', date: '09/10/98', content: 'HARDWARE DRIVERS' },
    ],
  },
  downloads: {
    name: 'C:\\DOWNLOADS',
    parent: 'root',
    items: [
      { id: 'dl_patch', name: 'Patch99.tmp', type: 'file', size: '99 MB', date: '09/11/98', content: 'CORRUPTED BUFFER AT 99%.' },
      { id: 'dl_manual', name: 'Patience.txt', type: 'file', size: '1.2 MB', date: '09/05/98', content: 'HOW TO PROPERLY TOLERATE EVASIVE INTERFACES.' },
    ],
  },
  user: {
    name: 'C:\\USER',
    parent: 'root',
    items: [
      { id: 'user_profile', name: 'Subject049.usr', type: 'file', size: '256 KB', date: '09/11/98', content: 'USER RECORD: SUBJECT_049\nRESILIENCE: FRAGILE' },
    ],
  },
};

export default function FileManager({ onRageUpdate, isChaosMode = true }) {
  const [currentFolderId, setCurrentFolderId] = useState('documents');
  const [history, setHistory] = useState(['root', 'documents']);
  const [historyIndex, setHistoryIndex] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState(false);

  // Hostile file evasion state
  const [hoveredFileOffset, setHoveredFileOffset] = useState({});
  const [permissionModal, setPermissionModal] = useState(null);
  const [permBtnOffset, setPermBtnOffset] = useState({ x: 0, y: 0 });
  const [permEscapes, setPermEscapes] = useState(0);

  const folder = FAKE_FS[currentFolderId] || FAKE_FS.root;

  const navigateTo = (newFolderId) => {
    if (!FAKE_FS[newFolderId]) return;
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
    if (folder.parent && FAKE_FS[folder.parent]) {
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

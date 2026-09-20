import React, { useState, useRef } from 'react';
import { soundEngine } from '../../engine/soundEngine';

const NOBROWSER_URL = 'https://nobrowser.vercel.app/';

export default function NoBrowserApp() {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  const handleReload = () => {
    soundEngine.playClick();
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      const cacheBust = (NOBROWSER_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
      iframeRef.current.src = NOBROWSER_URL + cacheBust;
    }
  };

  const handleOpenExternal = () => {
    soundEngine.playClick();
    window.open(NOBROWSER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="naas-browser-shell" id="app-nobrowser">
      {/* Loading progress bar */}
      {isLoading && (
        <div className="naas-loading-bar">
          <div className="naas-loading-progress" />
          <span className="mono naas-loading-text">
            Connecting to NOBROWSE™ (nobrowser.vercel.app)...
          </span>
        </div>
      )}

      {/* Browser Viewport */}
      <div className="naas-viewport">
        {loadError ? (
          <div className="naas-error-screen">
            <div className="naas-error-icon">🌐</div>
            <div className="naas-error-title mono">NOBROWSE™ — Connection Offline</div>
            <div className="naas-error-msg mono">
              The server at <strong>nobrowser.vercel.app</strong> could not be loaded inside the sandbox container.<br /><br />
              NOBROWSE™ might be questioning your life choices (40% useful, 60% questionable).
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="win95-btn naas-retry-btn" onClick={handleReload}>
                🔄 Retry Connection
              </button>
              <button className="win95-btn naas-retry-btn" onClick={handleOpenExternal} style={{ fontWeight: 'bold' }}>
                🌐 Open Directly
              </button>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={NOBROWSER_URL}
            title="NOBROWSE™ - The browser that sometimes understands you"
            className="naas-iframe"
            onLoad={handleLoad}
            onError={handleError}
            allow="camera; microphone; clipboard-read; clipboard-write; display-capture;"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}
      </div>

      {/* Retro status bar */}
      <div className="naas-status-bar mono">
        <span className="naas-status-left">
          {isLoading ? '⌛ Loading...' : loadError ? '✖ Offline' : '✔ Done'}
        </span>
        <span className="naas-status-center">
          NOBROWSE™ — The browser that sometimes understands you.
        </span>
        <span className="naas-status-right">🌐 Internet Zone</span>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { soundEngine } from '../../engine/soundEngine';

const CAUGHT_IN_4K_URL = 'https://mohamed-arif-j--caught-in-4k-fastapi-app.modal.run/';

export default function CaughtIn4KApp() {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressBar, setAddressBar] = useState(CAUGHT_IN_4K_URL);
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
      iframeRef.current.src = CAUGHT_IN_4K_URL + (CAUGHT_IN_4K_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
  };

  const handleOpenExternal = () => {
    soundEngine.playClick();
    window.open(CAUGHT_IN_4K_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="naas-browser-shell" id="app-caught-in-4k">
      {/* Retro IE5-style browser toolbar */}
      <div className="naas-browser-toolbar">
        <div className="naas-toolbar-buttons">
          <button
            className="win95-btn naas-nav-btn"
            onClick={handleReload}
            title="Refresh Page"
          >
            🔄
          </button>
          <button
            className="win95-btn naas-nav-btn"
            onClick={handleOpenExternal}
            title="Open in real browser (Modal App)"
          >
            🌐
          </button>
        </div>
        <div className="naas-address-strip sunken">
          <span className="naas-address-label mono">Address:</span>
          <span className="naas-address-value mono">{addressBar}</span>
        </div>
        <div className="naas-go-btn-wrap">
          <button className="win95-btn naas-go-btn" onClick={handleReload}>
            Go
          </button>
        </div>
      </div>

      {/* Loading progress bar */}
      {isLoading && (
        <div className="naas-loading-bar">
          <div className="naas-loading-progress" />
          <span className="mono naas-loading-text">
            Connecting to Caught In 4K (Modal Cloud App)...
          </span>
        </div>
      )}

      {/* Browser Viewport */}
      <div className="naas-viewport">
        {loadError ? (
          <div className="naas-error-screen">
            <div className="naas-error-icon">📹</div>
            <div className="naas-error-title mono">Caught In 4K — Modal App</div>
            <div className="naas-error-msg mono">
              The server at <strong>mohamed-arif-j--caught-in-4k-fastapi-app.modal.run</strong> could not be loaded inside the container, or the serverless instance is cold-starting.<br /><br />
              Please retry or open the application directly in your browser.
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
            src={CAUGHT_IN_4K_URL}
            title="Caught In 4K — Modal FastAPI App"
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
          {isLoading ? '⌛ Loading...' : loadError ? '✖ Standby' : '✔ Done'}
        </span>
        <span className="naas-status-center">
          Caught In 4K — mohamed-arif-j--caught-in-4k-fastapi-app.modal.run
        </span>
        <span className="naas-status-right">🌐 Internet Zone</span>
      </div>
    </div>
  );
}

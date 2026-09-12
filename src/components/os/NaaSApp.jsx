import React, { useState, useRef } from 'react';

const NAAS_URL = 'https://naas-nothing-as-a-service.onrender.com';

export default function NaaSApp() {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressBar, setAddressBar] = useState(NAAS_URL);
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
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      // Force reload by reassigning src
      iframeRef.current.src = NAAS_URL;
    }
  };

  return (
    <div className="naas-browser-shell" id="app-naas">
      {/* Retro IE5-style browser toolbar */}
      <div className="naas-browser-toolbar">
        <div className="naas-toolbar-buttons">
          <button className="win95-btn naas-nav-btn" onClick={handleReload} title="Refresh">
            🔄
          </button>
          <button
            className="win95-btn naas-nav-btn"
            onClick={() => window.open(NAAS_URL, '_blank')}
            title="Open in real browser"
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

      {/* Status bar / loading indicator */}
      {isLoading && (
        <div className="naas-loading-bar">
          <div className="naas-loading-progress" />
          <span className="mono naas-loading-text">Connecting to Nothing-as-a-Service™...</span>
        </div>
      )}

      {/* iframe viewport */}
      <div className="naas-viewport">
        {loadError ? (
          <div className="naas-error-screen">
            <div className="naas-error-icon">🚫</div>
            <div className="naas-error-title mono">Cannot Display Page</div>
            <div className="naas-error-msg mono">
              The Nothing-as-a-Service™ server could not be reached.<br />
              The service may be providing <strong>Nothing</strong> at this time.
            </div>
            <button className="win95-btn naas-retry-btn" onClick={handleReload}>
              Try Again (Expect Nothing)
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={NAAS_URL}
            title="Nothing as a Service™"
            className="naas-iframe"
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>

      {/* Retro status bar */}
      <div className="naas-status-bar mono">
        <span className="naas-status-left">
          {isLoading ? '⌛ Loading...' : loadError ? '✖ Error' : '✔ Done'}
        </span>
        <span className="naas-status-center">Nothing as a Service™ v1.0 — Team AltF4 Edition</span>
        <span className="naas-status-right">🌐 Internet Zone</span>
      </div>
    </div>
  );
}

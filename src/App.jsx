import React, { useState } from 'react';
import Landing from './pages/Landing';
import BootScreen from './components/os/BootScreen';
import Desktop from './components/os/Desktop';
import ShutdownScreen from './components/os/ShutdownScreen';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'boot' | 'os' | 'shutdown'
  const [bootMode, setBootMode] = useState('normal'); // 'normal' | 'safe' | 'dos'
  const [shutdownType, setShutdownType] = useState('shutdown'); // 'shutdown' | 'restart' | 'dos'

  const handleLaunchOS = () => {
    setCurrentView('boot');
  };

  const handleBootComplete = (selectedMode = 'normal') => {
    setBootMode(selectedMode);
    setCurrentView('os');
  };

  const handleReboot = (mode = 'normal') => {
    setBootMode(mode);
    setCurrentView('boot');
  };

  const handleReturnLanding = () => {
    setCurrentView('landing');
  };

  const handleStartShutdown = (type = 'shutdown') => {
    setShutdownType(type);
    setCurrentView('shutdown');
  };

  return (
    <div className="rageware-app-container">
      {currentView === 'landing' && (
        <Landing onLaunchOS={handleLaunchOS} />
      )}

      {currentView === 'boot' && (
        <BootScreen onBootComplete={handleBootComplete} />
      )}

      {currentView === 'os' && (
        <Desktop 
          bootMode={bootMode}
          onReturnLanding={handleReturnLanding}
          onReboot={handleReboot}
          onShutdown={handleStartShutdown}
        />
      )}

      {currentView === 'shutdown' && (
        <ShutdownScreen
          type={shutdownType}
          onRestart={handleReboot}
          onReturnLanding={handleReturnLanding}
        />
      )}
    </div>
  );
}

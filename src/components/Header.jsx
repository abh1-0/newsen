import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Settings, Maximize, Power, Wifi, WifiOff } from 'lucide-react';

export default function Header({ settings, onOpenSettings }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) {
      return 'Good Morning';
    } else if (h < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const closeApp = () => {
    window.close();
  };

  return (
    <header className="main-header">
      <div className="header-brand">
        <div className="header-logo">🎓</div>
        <div className="header-title-container">
          <h1>{settings.schoolName || 'Smart Dashboard'}</h1>
          <p>{getGreeting()}, {settings.studentName || 'Teacher'}!</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Network Status */}
        <div className="network-indicator">
          {isOnline ? (
            <Wifi size={32} color="var(--success-color)" />
          ) : (
            <WifiOff size={32} color="var(--danger-color)" />
          )}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Clock */}
        {!settings.hideClock && (
          <div className="header-clock">
            <div className="clock-time">
              {format(currentTime, settings.clockFormat === '24h' ? 'HH:mm' : 'hh:mm a')}
            </div>
            <div className="clock-date">{format(currentTime, 'EEEE, d MMM yyyy')}</div>
          </div>
        )}
        
        {/* Control Buttons */}
        <div className="header-buttons">
          <button className="glass-button" onClick={onOpenSettings} title="Settings">
            <Settings size={28} />
          </button>
          <button className="glass-button" onClick={toggleFullScreen} title="Fullscreen">
            <Maximize size={28} />
          </button>
          <button className="glass-button glass-button-danger" onClick={closeApp} title="Close App">
            <Power size={28} />
          </button>
        </div>
      </div>
    </header>
  );
}

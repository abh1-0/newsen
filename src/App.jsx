import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ShortcutGrid from './components/ShortcutGrid';
import TimetableWidget from './components/TimetableWidget';
import SettingsPanel from './components/SettingsPanel';
import ActiveClassTracker from './components/ActiveClassTracker';
import { defaultTimetable, defaultShortcuts, defaultSettings } from './data/defaults';

function App() {
  const [usbDrives, setUsbDrives] = useState([]);
  const usbTimerRef = useRef(null);
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('smartboard_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('smartboard_timetable');
    return saved ? JSON.parse(saved) : defaultTimetable;
  });

  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('smartboard_shortcuts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If localStorage has an empty array, it means we saved empty data somewhere.
      // Fall back to defaults in that case so shortcuts are always visible.
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return defaultShortcuts;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null); // null | { status, version, percent, speed }
  const updateTimerRef = useRef(null);

  // Auto-dismiss USB toast after 5 seconds
  useEffect(() => {
    if (usbDrives.length === 0) return;
    if (usbTimerRef.current) clearTimeout(usbTimerRef.current);
    usbTimerRef.current = setTimeout(() => setUsbDrives([]), 5000);
    return () => {
      if (usbTimerRef.current) clearTimeout(usbTimerRef.current);
    };
  }, [usbDrives]);

  // Auto-dismiss update banner after 5 seconds (for all statuses)
  useEffect(() => {
    if (!updateInfo) return;
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(() => setUpdateInfo(null), 5000);
    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, [updateInfo]);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Register USB listener BEFORE signaling ready so we don't miss the flush
    if (window.electronAPI.onUSBUpdate) {
      window.electronAPI.onUSBUpdate((drives) => {
        if (drives && drives.length > 0) {
          setUsbDrives(drives);
        }
      });
    }

    // Register update status listener
    if (window.electronAPI.onUpdateStatus) {
      window.electronAPI.onUpdateStatus((info) => {
        // Only show useful states — ignore 'checking' and 'up-to-date' silently
        if (info.status === 'available' || info.status === 'downloading' || info.status === 'ready' || info.status === 'error') {
          setUpdateInfo(info);
        }
      });
    }

    // Signal main process that renderer is ready — this flushes any queued USB events
    if (window.electronAPI.rendererReady) {
      window.electronAPI.rendererReady();
    }

    return () => {
      if (window.electronAPI.removeUSBListener) window.electronAPI.removeUSBListener();
      if (window.electronAPI.removeUpdateListener) window.electronAPI.removeUpdateListener();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('smartboard_settings', JSON.stringify(settings));
    
    // Apply dynamic styles
    const videoBg = document.getElementById('bg-video');
    if (settings.backgroundImage) {
      document.body.style.backgroundImage = `url('${settings.backgroundImage}')`;
      if (videoBg) videoBg.style.display = 'none';
    } else {
      document.body.style.backgroundImage = 'none';
      if (videoBg) videoBg.style.display = 'block';
    }
    
    document.documentElement.style.setProperty('--accent-color', settings.accentColor || '#6366f1');
    document.documentElement.style.setProperty('--glass-blur', `${settings.glassBlur || 16}px`);
    document.documentElement.style.setProperty('--glass-opacity', settings.glassOpacity || 0.15);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('smartboard_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('smartboard_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Sync to disk when any of them change, so the packaged build will have them
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.saveConfig) {
      window.electronAPI.saveConfig({ settings, timetable, shortcuts });
    }
  }, [settings, timetable, shortcuts]);

  return (
    <div className="app-container">
      <Header settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />
      
      {/* Top Marquee Announcement */}
      {settings.announcement && (
        <div className="glass-panel notice-bar">
          <span className="notice-label">📢 Notice</span>
          <marquee className="notice-text" scrollamount="8">
            {settings.announcement}
          </marquee>
        </div>
      )}

      <main className="dashboard-grid">
        {/* Top Information Zone */}
        <div className="top-info-zone">
          <ActiveClassTracker timetable={timetable} />
          <TimetableWidget timetable={timetable} />
        </div>
        
        {/* Bottom shortcuts zone */}
        <div className="bottom-dock">
          <ShortcutGrid shortcuts={shortcuts} setShortcuts={setShortcuts} />
        </div>
      </main>

      {/* USB Detection Toast */}
      {usbDrives.length > 0 && (
        <div className="toast-container">
          <div className="usb-toast">
            <span style={{ fontSize: '2rem' }}>💾</span>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>USB Drive Detected</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Drive {usbDrives.join(', ')} is ready to use</div>
            </div>
            <button 
              onClick={() => setUsbDrives([])} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', marginLeft: '1rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* OTA Update Banner */}
      {updateInfo && (
        <div className="update-banner">
          <span className="update-banner-icon">
            {updateInfo.status === 'available' && '⬇️'}
            {updateInfo.status === 'downloading' && '⏳'}
            {updateInfo.status === 'ready' && '✅'}
            {updateInfo.status === 'error' && '⚠️'}
          </span>
          <div className="update-banner-text">
            {updateInfo.status === 'available' && (
              <>Update <strong>v{updateInfo.version}</strong> available — downloading…</>
            )}
            {updateInfo.status === 'downloading' && (
              <>
                Downloading update… <strong>{updateInfo.percent}%</strong>
                <div className="update-progress-bar">
                  <div className="update-progress-fill" style={{ width: `${updateInfo.percent}%` }} />
                </div>
              </>
            )}
            {updateInfo.status === 'ready' && (
              <>Update <strong>v{updateInfo.version}</strong> ready to install</>
            )}
            {updateInfo.status === 'error' && (
              <>Update check failed</>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            {updateInfo.status === 'ready' && (
              <button
                className="update-install-btn"
                onClick={() => window.electronAPI?.installUpdate()}
              >
                Restart &amp; Install
              </button>
            )}
            <button
              onClick={() => setUpdateInfo(null)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem', opacity: 0.7 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsPanel 
          settings={settings} setSettings={setSettings}
          timetable={timetable} setTimetable={setTimetable}
          shortcuts={shortcuts} setShortcuts={setShortcuts}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

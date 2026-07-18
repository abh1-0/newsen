import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { GoogleLogo, YouTubeLogo, DefaultAppIcon } from './logos';

export default function ShortcutGrid({ shortcuts }) {
  const [error, setError] = useState(null);
  const errorTimerRef = useRef(null);

  // Auto-dismiss error toast after 5 seconds using a reliable useEffect pattern
  useEffect(() => {
    if (!error) return;
    // Clear any previous timer
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 5000);
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error]);

  const handleShortcutClick = async (shortcut) => {
    try {
      setError(null);

      if (!window.electronAPI) {
        console.warn('electronAPI not available — running outside Electron?');
        if (shortcut.type === 'url') {
          window.location.href = shortcut.target;
        } else {
          const msg = 'This shortcut requires the Electron app to be running';
          setError(msg);
          // Fallback alert in case React toast doesn't render (e.g. stale HMR bundle)
          setTimeout(() => alert(msg), 200);
        }
        return;
      }

      let result;
      if (shortcut.type === 'url') {
        result = await window.electronAPI.openExternal(shortcut.target);
      } else if (shortcut.type === 'app') {
        result = await window.electronAPI.launchApp(shortcut.target);
      } else if (shortcut.type === 'folder') {
        result = await window.electronAPI.openFolder();
      } else if (shortcut.type === 'action') {
        if (shortcut.target === 'minimize') {
          result = await window.electronAPI.minimizeApp();
        }
      }

      if (result && !result.success) {
        setError(`Failed to open ${shortcut.name}: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Shortcut click failed:', err);
      setError(`Something went wrong opening ${shortcut.name}`);
    }
  };

  const renderIcon = (sc) => {
    const name = sc.name.toLowerCase();
    if (name.includes('google') || name.includes('gmail')) return <GoogleLogo size={32} />;
    if (name.includes('youtube')) return <YouTubeLogo size={32} />;
    
    if (sc.icon && Icons[sc.icon]) {
      const IconComponent = Icons[sc.icon];
      return <IconComponent size={32} color="var(--accent-color)" />;
    }
    
    return <DefaultAppIcon size={32} />;
  };

  return (
    <div className="glass-panel shortcuts-card">
      <h3 className="shortcuts-title">Apps & Shortcuts</h3>
      <div className="shortcut-grid">
        {shortcuts.map(sc => (
          <button 
            key={sc.id}
            onClick={() => handleShortcutClick(sc)}
            className="shortcut-tile"
          >
            {renderIcon(sc)}
            <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2, textAlign: 'center' }}>{sc.name}</span>
          </button>
        ))}
      </div>
      {error && (
        <div className="shortcut-error-toast">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Palette, Clock, Monitor } from 'lucide-react';
import { periodsConfig } from '../data/defaults';

export default function SettingsPanel({ settings, setSettings, timetable, setTimetable, shortcuts, setShortcuts, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  
  // Create local copies to avoid updating main state until saved
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [localTimetable, setLocalTimetable] = useState([...timetable]);
  const [localShortcuts, setLocalShortcuts] = useState([...shortcuts]);

  const handleSave = () => {
    setSettings(localSettings);
    setTimetable(localTimetable);
    setShortcuts(localShortcuts);
    onClose();
  };

  const addShortcut = () => {
    const newId = localShortcuts.length > 0 ? Math.max(...localShortcuts.map(s => s.id)) + 1 : 1;
    setLocalShortcuts([...localShortcuts, { id: newId, name: "New App", type: "url", target: "https://", icon: "Monitor" }]);
  };

  const removeShortcut = (id) => setLocalShortcuts(localShortcuts.filter(s => s.id !== id));
  
  const updateShortcut = (id, field, value) => {
    setLocalShortcuts(localShortcuts.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateGridCell = (day, periodNum, field, value) => {
    let exists = false;
    const updated = localTimetable.map(t => {
      if (t.day === day && t.period === periodNum) {
        exists = true;
        return { ...t, [field]: value };
      }
      return t;
    });

    if (!exists) {
      const p = periodsConfig.find(per => per.num === periodNum) || {};
      updated.push({
        id: Date.now() + Math.random(),
        day,
        period: periodNum,
        isBreak: p.isBreak || false,
        subject: field === 'subject' ? value : '',
        teacher: field === 'teacher' ? value : '',
        room: field === 'room' ? value : '',
        startTime: p.startTime || '',
        endTime: p.endTime || ''
      });
    }
    setLocalTimetable(updated);
  };

  const getGridCell = (day, periodNum) => {
    return localTimetable.find(t => t.day === day && t.period === periodNum) || { subject: "", teacher: "", room: "" };
  };

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const presetColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="settings-overlay">
      <div className="glass-panel settings-modal-box" style={{ width: '96%', maxWidth: '1400px', height: '90%' }}>
        {/* Header */}
        <div className="settings-header">
          <h2>Dashboard Configuration</h2>
          <button className="glass-button" style={{ borderRadius: '50%', padding: '1rem', minWidth: '64px', minHeight: '64px' }} onClick={onClose}>
            <X size={32} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="settings-body">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar" style={{ width: '280px', minWidth: '280px' }}>
            <button 
              className={`glass-button settings-sidebar-button ${activeTab === 'general' ? 'settings-sidebar-button-active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Palette size={24} /> General & Theme
            </button>
            <button 
              className={`glass-button settings-sidebar-button ${activeTab === 'timetable' ? 'settings-sidebar-button-active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <Clock size={24} /> Simplified Timetable
            </button>
            <button 
              className={`glass-button settings-sidebar-button ${activeTab === 'shortcuts' ? 'settings-sidebar-button-active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              <Monitor size={24} /> App Shortcuts
            </button>
          </div>

          {/* Configuration Content */}
          <div className="settings-content-area" style={{ padding: '1.5rem' }}>
            
            {/* GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <div className="settings-tab-container" style={{ maxWidth: '900px' }}>
                <div className="settings-form-group">
                  <label>School / Institution Name</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localSettings.schoolName} 
                    onChange={e => setLocalSettings({ ...localSettings, schoolName: e.target.value })} 
                  />
                </div>

                <div className="settings-form-group">
                  <label>Teacher / Board Room Name</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localSettings.studentName} 
                    onChange={e => setLocalSettings({ ...localSettings, studentName: e.target.value })} 
                  />
                </div>

                <div className="settings-form-group">
                  <label>Marquee Notice Text</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localSettings.announcement} 
                    onChange={e => setLocalSettings({ ...localSettings, announcement: e.target.value })} 
                  />
                </div>

                <div className="settings-form-group">
                  <label>Custom Wallpaper URL (leave empty for live rainy background)</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localSettings.backgroundImage || ''} 
                    onChange={e => setLocalSettings({ ...localSettings, backgroundImage: e.target.value })} 
                  />
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>Clock Display Visibility</label>
                    <div className="type-toggler">
                      <button 
                        className={`type-btn ${!localSettings.hideClock ? 'type-btn-active' : ''}`}
                        onClick={() => setLocalSettings({ ...localSettings, hideClock: false })}
                      >
                        Visible
                      </button>
                      <button 
                        className={`type-btn ${localSettings.hideClock ? 'type-btn-active' : ''}`}
                        style={localSettings.hideClock ? { backgroundColor: 'var(--danger-color)' } : {}}
                        onClick={() => setLocalSettings({ ...localSettings, hideClock: true })}
                      >
                        Hidden
                      </button>
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label>Time Format</label>
                    <div className="type-toggler">
                      <button 
                        className={`type-btn ${localSettings.clockFormat === '12h' ? 'type-btn-active' : ''}`}
                        onClick={() => setLocalSettings({ ...localSettings, clockFormat: '12h' })}
                      >
                        12-Hour
                      </button>
                      <button 
                        className={`type-btn ${localSettings.clockFormat === '24h' ? 'type-btn-active' : ''}`}
                        onClick={() => setLocalSettings({ ...localSettings, clockFormat: '24h' })}
                      >
                        24-Hour
                      </button>
                    </div>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label>Board Theme Accent</label>
                  <div className="accent-picker-container">
                    {presetColors.map(color => (
                      <div 
                        key={color} 
                        className={`accent-circle ${localSettings.accentColor === color ? 'accent-circle-active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setLocalSettings({ ...localSettings, accentColor: color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>Glass Blur Intensity: {localSettings.glassBlur}px</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={localSettings.glassBlur} 
                      onChange={e => setLocalSettings({ ...localSettings, glassBlur: parseInt(e.target.value) })} 
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Glass Transparency: {Math.round(localSettings.glassOpacity * 100)}%</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={localSettings.glassOpacity * 100} 
                      onChange={e => setLocalSettings({ ...localSettings, glassOpacity: parseFloat(e.target.value) / 100 })} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TIMETABLE MATRIX GRID */}
            {activeTab === 'timetable' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', overflowX: 'auto' }}>
                <h3 className="timetable-title" style={{ margin: 0 }}>Timetable Matrix (Monday - Friday)</h3>
                <p className="text-secondary" style={{ marginBottom: '1rem' }}>Click and type directly into the cells to assign classes. Breaks are predefined and managed automatically.</p>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.125rem' }}>Day</th>
                      {periodsConfig.map(p => (
                        <th key={p.num} style={{ padding: '1rem', textAlign: 'center', fontSize: '1rem', minWidth: '120px' }}>
                          <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {p.startTime} - {p.endTime}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayNames.map((dayName, dayIdx) => {
                      const dayVal = dayIdx + 1;
                      return (
                        <tr key={dayName} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--accent-color)' }}>
                            {dayName}
                          </td>
                          {periodsConfig.map(p => {
                            const cell = getGridCell(dayVal, p.num);
                            
                            if (p.isBreak) {
                              return (
                                <td key={p.num} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                                  <div style={{ color: 'var(--warning-color)', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                    ☕ Break
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td key={p.num} style={{ padding: '0.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  <input 
                                    type="text" 
                                    placeholder="Subject"
                                    className="settings-input"
                                    style={{ 
                                      minHeight: '38px', 
                                      height: '38px', 
                                      fontSize: '0.9rem', 
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '8px',
                                      textAlign: 'center'
                                    }}
                                    value={cell.subject || ""} 
                                    onChange={e => updateGridCell(dayVal, p.num, 'subject', e.target.value)} 
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Teacher"
                                    className="settings-input"
                                    style={{ 
                                      minHeight: '38px', 
                                      height: '38px', 
                                      fontSize: '0.8rem', 
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '8px',
                                      textAlign: 'center',
                                      color: 'var(--text-secondary)'
                                    }}
                                    value={cell.teacher || ""} 
                                    onChange={e => updateGridCell(dayVal, p.num, 'teacher', e.target.value)} 
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Rm"
                                    className="settings-input"
                                    style={{ 
                                      minHeight: '38px', 
                                      height: '38px', 
                                      fontSize: '0.8rem', 
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '8px',
                                      textAlign: 'center',
                                      color: 'var(--text-secondary)'
                                    }}
                                    value={cell.room || ""} 
                                    onChange={e => updateGridCell(dayVal, p.num, 'room', e.target.value)} 
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SHORTCUTS CONFIG */}
            {activeTab === 'shortcuts' && (
              <div className="settings-tab-container">
                {localShortcuts.map((sc, index) => (
                  <div key={sc.id} className="settings-timetable-row">
                    <div className="settings-timetable-header">
                      <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Shortcut {index + 1}</span>
                      <button 
                        className="glass-button glass-button-danger" 
                        style={{ minWidth: '48px', minHeight: '48px', padding: '0 0.75rem', borderRadius: '12px' }}
                        onClick={() => removeShortcut(sc.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="settings-timetable-grid">
                      <div className="settings-form-group">
                        <label>Display Label</label>
                        <input 
                          type="text" 
                          className="settings-input" 
                          value={sc.name} 
                          onChange={e => updateShortcut(sc.id, 'name', e.target.value)} 
                        />
                      </div>

                      <div className="settings-form-group">
                        <label>Icon Name (Lucide)</label>
                        <input 
                          type="text" 
                          className="settings-input" 
                          value={sc.icon} 
                          placeholder="e.g. Monitor, Mail, FileText"
                          onChange={e => updateShortcut(sc.id, 'icon', e.target.value)} 
                        />
                      </div>

                      <div className="settings-form-group">
                        <label>Action Type</label>
                        <select 
                          className="settings-input" 
                          value={sc.type} 
                          onChange={e => updateShortcut(sc.id, 'type', e.target.value)}
                          style={{ color: 'white' }}
                        >
                          <option value="url" style={{ color: 'black' }}>🌐 Web URL (Default Browser)</option>
                          <option value="app" style={{ color: 'black' }}>🖥️ Local Windows App</option>
                        </select>
                      </div>
                    </div>

                    <div className="settings-form-group" style={{ marginTop: '0.5rem' }}>
                      <label>Target Execution / Path</label>
                      <input 
                        type="text" 
                        className="settings-input" 
                        placeholder={sc.type === 'url' ? 'https://google.com' : 'notepad.exe'}
                        value={sc.target} 
                        onChange={e => updateShortcut(sc.id, 'target', e.target.value)} 
                      />
                    </div>
                  </div>
                ))}

                <button 
                  className="glass-button" 
                  style={{ width: '100%', borderStyle: 'dashed', borderWidth: '3px', fontSize: '1.25rem', height: '80px', marginTop: '1rem' }}
                  onClick={addShortcut}
                >
                  <Plus size={24} style={{ marginRight: '0.5rem' }} /> Add App Shortcut
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer" style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <button 
            className="glass-button" 
            style={{ backgroundColor: 'rgba(255, 50, 50, 0.2)', color: 'white', flex: 1 }} 
            onClick={() => {
              if (window.confirm("Are you sure you want to completely reset all app data and userdata? (General Settings and Timetable will be kept)")) {
                const keepSettings = localStorage.getItem('smartboard_settings');
                const keepTimetable = localStorage.getItem('smartboard_timetable');
                
                localStorage.clear();
                sessionStorage.clear();
                
                if (keepSettings) localStorage.setItem('smartboard_settings', keepSettings);
                if (keepTimetable) localStorage.setItem('smartboard_timetable', keepTimetable);
                
                window.location.reload();
              }
            }}
          >
            <Trash2 size={24} style={{ marginRight: '0.75rem' }} /> Reset All Data (Keep Settings)
          </button>
          <button className="glass-button settings-save-btn" style={{ flex: 2 }} onClick={handleSave}>
            <Save size={28} style={{ marginRight: '0.75rem' }} /> Commit Configurations
          </button>
        </div>
      </div>
    </div>
  );
}

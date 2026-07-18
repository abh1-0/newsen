import React, { useState, useEffect } from 'react';
import { Timer, Mic, BarChart3, Search, Users } from 'lucide-react';

export default function ClassroomWidgets() {
  const [activeWidget, setActiveWidget] = useState('timer');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startTimer = (mins) => {
    setTimerSeconds(mins * 60);
    setTimerActive(true);
  };

  const renderTimer = () => (
    <div className="flex-col items-center justify-center h-full gap-4">
      <div className="text-6xl font-mono font-bold" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        {formatTime(timerSeconds)}
      </div>
      <div className="flex gap-4 mt-4">
        <button className="glass-button p-4 text-xl" onClick={() => startTimer(1)}>1m</button>
        <button className="glass-button p-4 text-xl" onClick={() => startTimer(5)}>5m</button>
        <button className="glass-button p-4 text-xl" onClick={() => startTimer(10)}>10m</button>
        <button className="glass-button p-4 text-xl text-danger" onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>Stop</button>
      </div>
    </div>
  );

  const renderPlaceholder = (title, icon) => (
    <div className="flex-col items-center justify-center h-full gap-4 text-secondary">
      {icon}
      <h4 className="text-xl">{title} Widget</h4>
      <p className="text-sm">Interactive features ready to be connected.</p>
    </div>
  );

  return (
    <div className="liquid-glass-panel p-6 flex-col" style={{ height: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Teaching Assistants</h3>
        <div className="flex gap-2">
          <button className={`glass-button p-3 ${activeWidget === 'timer' ? 'bg-accent-color' : ''}`} onClick={() => setActiveWidget('timer')}><Timer size={24} /></button>
          <button className={`glass-button p-3 ${activeWidget === 'search' ? 'bg-accent-color' : ''}`} onClick={() => setActiveWidget('search')}><Search size={24} /></button>
          <button className={`glass-button p-3 ${activeWidget === 'picker' ? 'bg-accent-color' : ''}`} onClick={() => setActiveWidget('picker')}><Users size={24} /></button>
          <button className={`glass-button p-3 ${activeWidget === 'noise' ? 'bg-accent-color' : ''}`} onClick={() => setActiveWidget('noise')}><Mic size={24} /></button>
          <button className={`glass-button p-3 ${activeWidget === 'poll' ? 'bg-accent-color' : ''}`} onClick={() => setActiveWidget('poll')}><BarChart3 size={24} /></button>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: '1rem' }}>
        {activeWidget === 'timer' && renderTimer()}
        {activeWidget === 'search' && renderPlaceholder('Quick Search', <Search size={48} />)}
        {activeWidget === 'picker' && renderPlaceholder('Random Student Picker', <Users size={48} />)}
        {activeWidget === 'noise' && renderPlaceholder('Classroom Noise Monitor', <Mic size={48} />)}
        {activeWidget === 'poll' && renderPlaceholder('Live Polling', <BarChart3 size={48} />)}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Edit3, Calendar } from 'lucide-react';

export default function ActiveClassTracker({ timetable }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [teacherNotes, setTeacherNotes] = useState(() => {
    return localStorage.getItem('smartboard_teacher_notes') || "✏️ Class Tasks & Homework Notes:\n1. Read Chapter 4 in Science textbook.\n2. Complete Math exercise 3.2.";
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const handleNotesChange = (e) => {
    setTeacherNotes(e.target.value);
    localStorage.setItem('smartboard_teacher_notes', e.target.value);
  };

  const dayIndex = currentTime.getDay();
  const currentHHMM = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

  const todaysClasses = timetable
    .filter(t => t.day === dayIndex)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let activePeriod = null;
  let nextPeriod = null;

  for (let i = 0; i < todaysClasses.length; i++) {
    const cls = todaysClasses[i];
    if (currentHHMM >= cls.startTime && currentHHMM <= cls.endTime) {
      activePeriod = cls;
      nextPeriod = todaysClasses[i + 1] || null;
      break;
    } else if (currentHHMM < cls.startTime) {
      if (!activePeriod) {
        nextPeriod = cls;
        break;
      }
    }
  }

  // Calculate percentage elapsed
  let progressPercentage = 0;
  if (activePeriod) {
    const startParts = activePeriod.startTime.split(':').map(Number);
    const endParts = activePeriod.endTime.split(':').map(Number);
    const currParts = currentHHMM.split(':').map(Number);

    const startMins = startParts[0] * 60 + startParts[1];
    const endMins = endParts[0] * 60 + endParts[1];
    const currMins = currParts[0] * 60 + currParts[1];

    const totalDuration = endMins - startMins;
    const elapsed = currMins - startMins;

    progressPercentage = totalDuration > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100))) : 0;
  }

  // Calculate time remaining to next
  let nextString = "No more classes today";
  if (nextPeriod) {
    const startParts = nextPeriod.startTime.split(':').map(Number);
    const currParts = currentHHMM.split(':').map(Number);
    const startMins = startParts[0] * 60 + startParts[1];
    const currMins = currParts[0] * 60 + currParts[1];
    const diff = startMins - currMins;

    if (diff > 0 && diff <= 60) {
      nextString = `Starts in ${diff} min`;
    } else if (diff > 60) {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      nextString = `Starts in ${h}h ${m}m`;
    } else {
      nextString = `Starting now`;
    }
  }

  // If there's no active period (e.g. after school/lunch break when nothing matches or after 3:45 PM)
  if (!activePeriod && !nextPeriod) {
    return (
      <div className="glass-panel tracker-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
          <h3 className="tracker-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
            <Edit3 size={24} color="var(--accent-color)" /> Teacher's Notepad
          </h3>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={16} /> Auto-saved
          </span>
        </div>
        <textarea 
          className="settings-input"
          style={{ 
            flexGrow: 1, 
            resize: 'none', 
            height: '100%', 
            minHeight: '120px', 
            fontFamily: 'inherit', 
            fontSize: '1.125rem',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.18)',
            border: '1px dashed var(--glass-border)',
            borderRadius: '16px',
            color: 'white'
          }}
          value={teacherNotes}
          onChange={handleNotesChange}
          placeholder="Jot down homework, tasks, or classroom reminders here..."
        />
      </div>
    );
  }

  return (
    <div className="glass-panel tracker-card">
      <div>
        <h3 className="tracker-title">Currently Active</h3>
        {activePeriod ? (
          <div>
            <div className="tracker-subject">
              {activePeriod.isBreak ? `☕ ${activePeriod.subject}` : activePeriod.subject}
            </div>
            
            <div className="tracker-details">
              {activePeriod.isBreak ? (
                <span className="text-secondary">Break / Recess Time</span>
              ) : (
                <span>{activePeriod.teacher} • Room {activePeriod.room}</span>
              )}
            </div>

            <div className="tracker-progress-container">
              <div className="progress-labels">
                <span>{activePeriod.startTime}</span>
                <span>{progressPercentage}% Completed</span>
                <span>{activePeriod.endTime}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="tracker-subject" style={{ color: 'var(--text-secondary)' }}>Free Period</div>
        )}
      </div>

      {nextPeriod && (
        <div className="tracker-next-card">
          <div>
            <div className="next-label">Up Next</div>
            <div className="next-subject">{nextPeriod.subject}</div>
            {!nextPeriod.isBreak && (
              <div className="next-details">{nextPeriod.teacher} • Room {nextPeriod.room}</div>
            )}
          </div>
          <div>
            <div className="next-time">{nextPeriod.startTime}</div>
            <div className="next-details" style={{ textAlign: 'right' }}>{nextString}</div>
          </div>
        </div>
      )}
    </div>
  );
}

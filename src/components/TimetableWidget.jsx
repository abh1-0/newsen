import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

export default function TimetableWidget({ timetable }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const dayIndex = currentTime.getDay();
  const currentHHMM = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

  const todaysClasses = timetable
    .filter(t => t.day === dayIndex)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let currentClassIdx = -1;
  todaysClasses.forEach((cls, idx) => {
    if (currentHHMM >= cls.startTime && currentHHMM <= cls.endTime) {
      currentClassIdx = idx;
    }
  });

  // Calculate percentage elapsed for the active period
  let progressPercentage = 0;
  if (currentClassIdx !== -1) {
    const activePeriod = todaysClasses[currentClassIdx];
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

  return (
    <div className="glass-panel timetable-card">
      <h3 className="timetable-title">Today's Schedule</h3>
      
      {todaysClasses.length === 0 ? (
        <div className="timetable-list" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p className="item-details text-secondary" style={{ fontSize: '1.25rem' }}>No classes scheduled for today.</p>
        </div>
      ) : (
        <div className="timetable-list">
          {todaysClasses.map((cls, idx) => {
            const isCompleted = currentClassIdx !== -1 ? idx < currentClassIdx : currentHHMM > cls.endTime;
            const isCurrent = idx === currentClassIdx;
            const isNext = currentClassIdx !== -1 ? idx === currentClassIdx + 1 : (idx === 0 && currentHHMM < cls.startTime) || (idx > 0 && currentHHMM > todaysClasses[idx - 1].endTime && currentHHMM < cls.startTime);
            const isUpcoming = !isCompleted && !isCurrent && !isNext;

            if (isCurrent) {
              return (
                <div 
                  key={`${cls.day}-${cls.period}`} 
                  className="timetable-item timetable-item-active"
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="item-left">
                      <div className="item-index item-index-active">{idx + 1}</div>
                      <div>
                        <div className="item-subject" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                          {cls.isBreak ? `☕ ${cls.subject}` : cls.subject}
                        </div>
                        {!cls.isBreak && (
                          <div className="item-details item-details-active" style={{ fontSize: '1rem' }}>
                            {cls.teacher} {cls.room ? `• Rm ${cls.room}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="item-right">
                      <div className="item-time" style={{ fontSize: '1.125rem' }}>
                        {cls.startTime} - {cls.endTime}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar inside the active item */}
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Progress</span>
                      <span>{progressPercentage}% Completed</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progressPercentage}%`, backgroundColor: '#ffffff', borderRadius: '4px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </div>
              );
            }

            if (isNext) {
              return (
                <div 
                  key={`${cls.day}-${cls.period}`} 
                  className="timetable-item"
                  style={{ border: '1px dashed var(--accent-color)', opacity: 0.9 }}
                >
                  <div className="item-left">
                    <div className="item-index">{idx + 1}</div>
                    <div>
                      <div className="item-subject">
                        {cls.isBreak ? `☕ ${cls.subject}` : cls.subject} 
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-color)', padding: '0.2rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}>Up Next</span>
                      </div>
                      {!cls.isBreak && (
                        <div className="item-details">
                          {cls.teacher} {cls.room ? `• Rm ${cls.room}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="item-time">{cls.startTime} - {cls.endTime}</div>
                    <Clock size={20} color="var(--accent-color)" />
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={`${cls.day}-${cls.period}`} 
                className="timetable-item"
              >
                <div className="item-left">
                  <div className="item-index">{idx + 1}</div>
                  <div>
                    <div className="item-subject">{cls.isBreak ? `☕ ${cls.subject}` : cls.subject}</div>
                    {!cls.isBreak && (
                      <div className="item-details">
                        {cls.teacher} {cls.room ? `• Rm ${cls.room}` : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="item-right">
                  <div className="item-time">
                    {cls.startTime} - {cls.endTime}
                  </div>
                  <div>
                    {isCompleted && <CheckCircle2 size={24} color="var(--success-color)" />}
                    {isUpcoming && <Clock size={24} color="var(--text-secondary)" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import customSettings from './settings.json';
import customTimetable from './timetable.json';
import customShortcuts from './shortcuts.json';

const baseSettings = {
  schoolName: "My School",
  studentName: "Teacher",
  announcement: "Welcome! Configure your dashboard via Settings.",
  backgroundImage: "",
  hideClock: false,
  clockFormat: '12h',
  accentColor: '#6366f1',
  glassBlur: 16,
  glassOpacity: 0.15
};

export const defaultSettings = { ...baseSettings, ...(Object.keys(customSettings).length > 0 ? customSettings : {}) };

export const periodsConfig = [
  { num: 1, name: "1st Period", startTime: "08:00", endTime: "09:10", isBreak: false },
  { num: 2, name: "2nd Period", startTime: "09:10", endTime: "09:50", isBreak: false },
  { num: 3, name: "Short Break", startTime: "09:50", endTime: "10:05", isBreak: true },
  { num: 4, name: "3rd Period", startTime: "10:05", endTime: "10:45", isBreak: false },
  { num: 5, name: "4th Period", startTime: "10:45", endTime: "11:25", isBreak: false },
  { num: 6, name: "5th Period", startTime: "11:25", endTime: "12:05", isBreak: false },
  { num: 7, name: "Lunch Break", startTime: "12:05", endTime: "12:45", isBreak: true },
  { num: 8, name: "6th Period", startTime: "12:45", endTime: "13:25", isBreak: false },
  { num: 9, name: "7th Period", startTime: "13:25", endTime: "14:05", isBreak: false },
  { num: 10, name: "8th Period", startTime: "14:05", endTime: "14:45", isBreak: false },
  { num: 11, name: "Short Break", startTime: "14:45", endTime: "14:55", isBreak: true },
  { num: 12, name: "Activity Period", startTime: "14:55", endTime: "15:45", isBreak: false }
];

// Generate default grid data (5 days x 12 periods)
const generateDefaultTimetable = () => {
  const timetable = [];
  let id = 1;
  for (let day = 1; day <= 5; day++) {
    periodsConfig.forEach(p => {
      let subject = "";
      let teacher = "";
      let room = "";

      if (p.isBreak) {
        subject = p.name;
      } else {
        // Just fill some default subjects to look good out of the box
        if (p.num === 1) { subject = "Math"; teacher = "Mr. Smith"; room = "101"; }
        else if (p.num === 2) { subject = "English"; teacher = "Ms. Adams"; room = "102"; }
        else if (p.num === 4) { subject = "Science"; teacher = "Mrs. Green"; room = "302"; }
        else if (p.num === 5) { subject = "History"; teacher = "Mr. Davis"; room = "204"; }
        else if (p.num === 6) { subject = "Geography"; teacher = "Mrs. Taylor"; room = "205"; }
        else if (p.num === 8) { subject = "Hindi"; teacher = "Mr. Sharma"; room = "105"; }
        else if (p.num === 9) { subject = "Computer"; teacher = "Mr. Patel"; room = "Lab A"; }
        else if (p.num === 10) { subject = "Arts"; teacher = "Ms. Miller"; room = "Studio"; }
        else if (p.num === 12) { subject = "Sports / Club"; teacher = "Coach Alex"; room = "Grounds"; }
      }

      timetable.push({
        id: id++,
        day,
        period: p.num,
        isBreak: p.isBreak,
        subject,
        teacher,
        room,
        startTime: p.startTime,
        endTime: p.endTime
      });
    });
  }
  return timetable;
};

const generatedTimetable = generateDefaultTimetable();
export const defaultTimetable = customTimetable.length > 0 ? customTimetable : generatedTimetable;

const baseShortcuts = [
  { id: 1, name: "Google Classroom", type: "url", target: "https://classroom.google.com", icon: "Monitor" },
  { id: 2, name: "Gmail", type: "url", target: "https://mail.google.com", icon: "Mail" },
  { id: 3, name: "Whiteboard", type: "app", target: "mspaint.exe", icon: "FileText" },
  { id: 4, name: "ChatGPT", type: "url", target: "https://chatgpt.com", icon: "MessageSquare" },
  { id: 5, name: "Chrome", type: "app", target: "chrome.exe", icon: "Globe" },
  { id: 6, name: "YouTube", type: "url", target: "https://youtube.com", icon: "PlaySquare" },
  { id: 7, name: "Files", type: "folder", target: "home", icon: "Folder" },
  { id: 8, name: "Desktop", type: "action", target: "minimize", icon: "MonitorDown" }
];

export const defaultShortcuts = customShortcuts.length > 0 ? customShortcuts : baseShortcuts;

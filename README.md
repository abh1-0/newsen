<div align="center">
  <img src="public/favicon.svg" alt="Newsen Logo" width="80" height="80" />
  <h1>Newsen</h1>
  <p><strong>A glassmorphic classroom smartboard dashboard for Windows</strong></p>

  ![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron&logoColor=white)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
  ![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---

## Features

| Feature | Description |
|---|---|
| 🕐 **Live Clock & Date** | Real-time clock with 12h/24h toggle, displayed in the header |
| 📅 **Today's Timetable** | Shows the day's class schedule with current/upcoming class highlighted |
| 🔔 **Active Class Tracker** | Progress bar showing how far through the current period you are |
| 📝 **Teacher's Notepad** | Persistent scratchpad for homework/tasks — auto-saved to localStorage |
| 🚀 **App Shortcuts** | One-click launch of web URLs, local Windows apps, folders, or system actions |
| 📢 **Marquee Announcements** | Scrolling notice bar for class-wide announcements |
| 🎨 **Full Theme Control** | Accent colour picker, glassmorphism blur/opacity sliders, custom wallpaper URL |
| 💾 **USB Drive Alerts** | Automatic toast notification when a USB drive is plugged in |
| ⬆️ **OTA Auto-Updates** | Built-in GitHub Releases auto-updater via `electron-updater` |
| 🌐 **Network Status** | WiFi/offline indicator in the header |
| 🖥️ **Fullscreen & Kiosk-ready** | Fullscreen toggle and window minimize-all shortcut |

---

## Preview

> The dashboard is designed to run fullscreen on a classroom projector or smartboard.

UI features:
- Dark glassmorphism panels
- Accent colour theming (indigo, pink, emerald, amber, blue)
- Responsive grid layout — active class tracker on the left, day schedule on the right, app shortcuts at the bottom..

---

## 🛠️ Tech Stack

- **Electron** 43 — Desktop shell
- **React** 19 — UI framework
- **Vite** 8 — Build tool with HMR
- **`vite-plugin-electron`** — Vite + Electron integration
- **`lucide-react`** — Icon library
- **`date-fns`** — Date/time formatting
- **`electron-updater`** — GitHub Releases OTA updates
- **Vanilla CSS** — Custom glassmorphism design system

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18+**
- [npm](https://npmjs.com/) **v9+** (comes with Node)
- Windows 10/11 (Windows only as of now, as i dont own a Mac) 

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-github-username/newsen.git
cd newsen

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
#    Copy the example env file and fill in your values
copy .env.example .env
```

### Running in Development

```bash
npm run dev
```

This starts the Vite dev server with HMR and launches Electron pointing at it. DevTools open automatically.

### Building a Production Installer

```bash
# Build the Vite bundle + Electron bundle, then package with electron-builder
npm run build:dist
```

The output installer (`Newsen Setup x.x.x.exe`) will be placed in `dist-installer/`.

---

## ⚙️ Configuration

### First Run

On first launch, the app uses built-in defaults. Open **Settings** (gear icon in the header) to configure:

- **General & Theme** — School/institution name, teacher/room name, accent colour, glass effects, clock format, custom wallpaper
- **Timetable** — Fill in the Monday–Friday class grid (subject, teacher, room per period)
- **App Shortcuts** — Add/remove quick-launch tiles (web URLs or Windows `.exe` paths)

All settings are persisted to `localStorage` and synced back to `src/data/*.json` in dev mode.

### Data Files

| File | Purpose |
|---|---|
| `src/data/settings.json` | Theme & general settings (school name, accent colour, etc.) |
| `src/data/timetable.json` | Class schedule — populated by the in-app timetable editor |
| `src/data/shortcuts.json` | App shortcut tiles |

These files are **intentionally blank/empty** in the repository. Fill them in via the Settings panel and they will be written automatically.

### Auto-Updater Setup

To enable OTA updates via GitHub Releases:

1. Set `build.publish.owner` and `build.publish.repo` in `package.json` to your GitHub details.
2. If your repo is private, create a [Personal Access Token](https://github.com/settings/tokens) (scopes: `repo`) and set it:
   ```bash
   # In .env (never commit this file!)
   GH_TOKEN=your_token_here
   ```
3. Publish a release with `npm run build:publish`.

---

## 📁 Project Structure

```
newsen/
├── electron/
│   ├── main.js          # Main process: window, IPC handlers, USB detection, auto-updater
│   └── preload.mjs      # Context bridge: exposes safe APIs to renderer
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── rain.mp4         # Background ambient video
├── scripts/
│   └── build.js         # Custom electron-builder helper script
├── src/
│   ├── components/
│   │   ├── ActiveClassTracker.jsx   # Current period tracker + Teacher's Notepad
│   │   ├── ClassroomWidgets.jsx     # Extra classroom widget helpers
│   │   ├── Header.jsx               # Top bar: school name, clock, controls
│   │   ├── SettingsPanel.jsx        # Full-screen settings modal
│   │   ├── ShortcutGrid.jsx         # App/URL shortcut tile grid
│   │   ├── TimetableWidget.jsx      # Today's class schedule widget
│   │   └── logos.jsx                # Custom SVG logo components
│   ├── data/
│   │   ├── defaults.js              # Default settings, timetable, shortcuts
│   │   ├── settings.json            # User settings (blank by default)
│   │   ├── timetable.json           # User timetable (blank by default)
│   │   └── shortcuts.json           # User shortcuts (blank by default)
│   ├── App.jsx           # Root component: state management, layout
│   ├── App.css           # Component-scoped styles
│   ├── index.css         # Global design system (CSS variables, glassmorphism)
│   └── main.jsx          # React entry point
├── .env.example          # Environment variable reference (copy to .env)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Contributing

Contributions are welcome! To get started:

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please keep PRs focused and include a clear description of what was changed and why.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by abh1</sub>
</div>

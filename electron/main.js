import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join, dirname } from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { createRequire } from 'module'
import { mkdirSync } from 'fs'

// electron-updater is a CommonJS module — import via require
const require = createRequire(import.meta.url)
const { autoUpdater } = require('electron-updater')

// Set your GitHub token via the GH_TOKEN environment variable, or configure it in
// electron-builder's publish settings. Do NOT hardcode tokens in source code.
const GH_TOKEN = process.env.GH_TOKEN || ''

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow
let rendererReady = false
const pendingEvents = [] // Queue events that fire before renderer is ready

function sendToRenderer(channel, data) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (rendererReady) {
    mainWindow.webContents.send(channel, data);
  } else {
    pendingEvents.push({ channel, data });
  }
}

function flushPendingEvents() {
  while (pendingEvents.length > 0) {
    const ev = pendingEvents.shift();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(ev.channel, ev.data);
    }
  }
}

function createWindow() {
  // The preload script extension must match the actual file (preload.mjs)
  const preloadPath = join(__dirname, 'preload.mjs');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    frame: true
  })

  mainWindow.maximize()

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Intercept navigation & new windows — force external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('file://')) {
      return;
    }
    event.preventDefault();
    shell.openExternal(url);
  });
}

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// --- Auto Updater ---
function setupAutoUpdater() {
  // Only run updater in packaged builds (not dev mode)
  if (!app.isPackaged) {
    console.log('[Updater] Skipping auto-update in dev mode')
    return
  }

  // Configure your GitHub owner/repo in electron-builder's publish config (package.json).
  // The token is read from the GH_TOKEN environment variable at runtime.
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: process.env.GITHUB_OWNER || 'your-github-username',
    repo: process.env.GITHUB_REPO || 'newsen',
    token: GH_TOKEN,
    private: false
  })

  autoUpdater.logger = null // Suppress logs to console
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = false // Manual restart control

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer('update-status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    sendToRenderer('update-status', { status: 'available', version: info.version })
  })

  autoUpdater.on('update-not-available', () => {
    sendToRenderer('update-status', { status: 'up-to-date' })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update-status', {
      status: 'downloading',
      percent: Math.round(progress.percent),
      speed: Math.round(progress.bytesPerSecond / 1024) // KB/s
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendToRenderer('update-status', { status: 'ready', version: info.version })
  })

  autoUpdater.on('error', (err) => {
    console.error('[Updater] Error:', err.message)
    sendToRenderer('update-status', { status: 'error', message: err.message })
  })

  // Check on startup (delay 10s to let app settle), then every 30 minutes
  setTimeout(() => autoUpdater.checkForUpdates(), 10000)
  setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000)
}

// Renderer signals it's ready — flush any queued USB events
ipcMain.handle('renderer-ready', async () => {
  rendererReady = true;
  flushPendingEvents();
  return { success: true };
})

ipcMain.handle('run-command', async (event, command) => {
  return new Promise((resolve) => {
    exec(command, { windowsHide: true, shell: true }, (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message })
        return
      }
      resolve({ success: true, output: stdout })
    })
  })
})

// Dedicated app launcher — uses cmd.exe 'start' which reliably resolves PATH/App Paths
// and properly launches GUI applications (works in both dev mode and production).
ipcMain.handle('launch-app', async (event, target) => {
  try {
    return new Promise((resolve) => {
      // 'start' is a cmd.exe built-in that locates executables via PATH and App Paths registry,
      // then launches them without waiting for exit (perfect for GUI apps).
      // The empty quoted string is the window title (required by 'start' syntax).
      exec(`start "" "${target}"`, { windowsHide: true, shell: true }, (error) => {
        if (error) {
          console.error(`Failed to launch app '${target}':`, error.message);
          resolve({ success: false, error: error.message });
        } else resolve({ success: true });
      });
    });
  } catch (error) {
    console.error(`Failed to launch app: ${target}`, error);
    return { success: false, error: error.message };
  }
})

// Opens the user's home directory in File Explorer using the native Windows Shell API
ipcMain.handle('open-folder', async () => {
  try {
    const homeDir = process.env.USERPROFILE || process.env.HOME || 'C:\\';
    const result = await shell.openPath(homeDir);
    if (result === '') return { success: true };
    return { success: false, error: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
})

ipcMain.handle('minimize-app', async () => {
  // First minimize the Electron window immediately (synchronous, always works)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }

  // Then try PowerShell MinimizeAll asynchronously to minimize all other windows
  return new Promise((resolve) => {
    exec('powershell -NoProfile -Command "(New-Object -ComObject Shell.Application).MinimizeAll()"', { windowsHide: true }, (err) => {
      if (err) {
        console.error('Failed to minimize all windows:', err);
        resolve({ success: false, error: err.message, partial: true });
      } else {
        resolve({ success: true });
      }
    });
  });
})

// URL opener — uses Electron's native shell.openExternal, designed exactly for this.
ipcMain.handle('open-external', async (event, url) => {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
      url = 'https://' + url;
    }
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
})

ipcMain.handle('save-config', async (event, { settings, timetable, shortcuts }) => {
  try {
    // In dev mode, write back to src/data so defaults are updated on next build.
    // In production, write to userData which persists across updates.
    let dataDir;
    if (!app.isPackaged) {
      dataDir = join(__dirname, '../src/data');
    } else {
      dataDir = join(app.getPath('userData'), 'config');
      mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2));
    fs.writeFileSync(join(dataDir, 'timetable.json'), JSON.stringify(timetable, null, 2));
    fs.writeFileSync(join(dataDir, 'shortcuts.json'), JSON.stringify(shortcuts, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
})

ipcMain.handle('get-usb-drives', async () => {
  return previousDrives;
})

// --- USB Drive Detection ---
let previousDrives = [];

function checkUSBDrives() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  const cmd = `powershell -NoProfile -Command "Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DriveType -eq 2} | Select-Object -ExpandProperty DeviceID"`;
  
  exec(cmd, { windowsHide: true }, (error, stdout) => {
    if (error) return;
    
    const drives = (stdout || '').trim()
      .split(/\r?\n/)
      .map(d => d.trim())
      .filter(d => /^[A-Z]:$/.test(d));
      
    const newDrives = drives.filter(d => !previousDrives.includes(d));
    if (newDrives.length > 0) {
      console.log('USB drives detected:', newDrives);
      sendToRenderer('usb-detected', newDrives);
    }
    
    previousDrives = drives;
  });
}

setTimeout(checkUSBDrives, 2000);
setInterval(checkUSBDrives, 3000);

// IPC: renderer requests manual update check
ipcMain.handle('check-for-update', async () => {
  if (!app.isPackaged) return { status: 'dev-mode' };
  try {
    await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
})

// IPC: renderer triggers install of the downloaded update
ipcMain.handle('install-update', async () => {
  autoUpdater.quitAndInstall(false, true); // isSilent=false, isForceRunAfter=true
})

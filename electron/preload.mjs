import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  launchApp: (target) => ipcRenderer.invoke('launch-app', target),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  getUSBDrives: () => ipcRenderer.invoke('get-usb-drives'),
  rendererReady: () => ipcRenderer.invoke('renderer-ready'),
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  onUSBUpdate: (callback) => {
    ipcRenderer.on('usb-detected', (_event, drives) => callback(drives));
  },
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_event, info) => callback(info));
  },
  removeUSBListener: () => {
    ipcRenderer.removeAllListeners('usb-detected');
  },
  removeUpdateListener: () => {
    ipcRenderer.removeAllListeners('update-status');
  }
})

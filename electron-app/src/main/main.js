const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // We'll create this later if needed for secure IPC
      contextIsolation: true,
      nodeIntegration: false, // Recommended for security
    },
  });

  // Load the index.html of the app.
  // In development, load from Vite dev server. In production, load from built files.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server URL from package.json script
    mainWindow.webContents.openDevTools(); // Open DevTools automatically in development
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist-renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// preload.js (optional, for secure IPC - create if needed)
// For now, we'll just ensure the main process refers to it.
// You would create 'ImgPOP/electron-app/src/main/preload.js'
// Example content for preload.js if we need it later:
/*
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Define functions here that your renderer process can call
  // Example: send: (channel, data) => ipcRenderer.send(channel, data),
  //          on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
*/ 
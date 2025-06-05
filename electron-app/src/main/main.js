const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const scriptsDir = path.join(__dirname, '../../python-ai-backend/cli');

function runPython(scriptName, args = []) {
  const scriptPath = path.join(scriptsDir, scriptName);
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    py.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    py.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch (e) {
          resolve({ output: stdout.trim() });
        }
      } else {
        reject(new Error(stderr.trim() || `Exited with code ${code}`));
      }
    });
  });
}

// IPC handlers to invoke Python CLI wrappers
ipcMain.handle('generative-fill', (event, opts) => {
  const args = [opts.imagePath, opts.prompt || '', opts.maskPath || ''];
  return runPython('generative_fill.py', args);
});

ipcMain.handle('remove-bg', (event, opts) => {
  const args = [opts.imagePath];
  return runPython('remove_bg.py', args);
});

ipcMain.handle('cleanup', (event, opts) => {
  const args = [opts.imagePath, opts.maskPath || ''];
  return runPython('cleanup.py', args);
});

ipcMain.handle('upscale', (event, opts) => {
  const args = [opts.imagePath, String(opts.scale || 2)];
  return runPython('upscale.py', args);
});

ipcMain.handle('extract-text', (event, opts) => {
  const args = [opts.imagePath];
  return runPython('extract_text.py', args);
});

ipcMain.handle('resize-image-local', (event, opts) => {
  const args = [opts.imagePath, String(opts.width), String(opts.height), String(opts.expand)];
  return runPython('resize_image.py', args);
});

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
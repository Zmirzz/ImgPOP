// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generativeFill: (opts) => ipcRenderer.invoke('generative-fill', opts),
  removeBg: (opts) => ipcRenderer.invoke('remove-bg', opts),
  cleanup: (opts) => ipcRenderer.invoke('cleanup', opts),
  upscale: (opts) => ipcRenderer.invoke('upscale', opts),
  extractText: (opts) => ipcRenderer.invoke('extract-text', opts),
  resizeImageLocal: (opts) => ipcRenderer.invoke('resize-image-local', opts),
});

console.log('Preload script loaded.');

// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Example: Expose a safe version of ipcRenderer to the renderer process
// We aren't using this specific example yet, but it shows the pattern.
/*
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
*/

console.log('Preload script loaded.'); 
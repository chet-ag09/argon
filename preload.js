const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const userCssPath = path.join(__dirname, 'user-style.css');

function pollTrackStatus() {
  setInterval(() => {
    ipcRenderer.send("python-command", "status");
  }, 1000);
}
pollTrackStatus();

contextBridge.exposeInMainWorld('api', {
  send: (command) => ipcRenderer.send('python-command', command),
  onResponse: (callback) => ipcRenderer.on('python-response', (_, data) => callback(data)),
});

contextBridge.exposeInMainWorld('customCSS', {
  save: (cssText) => {
    fs.writeFileSync(userCssPath, cssText, 'utf-8');
  },
  load: () => {
    if (fs.existsSync(userCssPath)) {
      return fs.readFileSync(userCssPath, 'utf-8');
    }
    return '';
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  getTrackInfo: () => ipcRenderer.invoke("get-track-info")
});

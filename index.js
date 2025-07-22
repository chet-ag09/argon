const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win; 

function createWindow () {
  win = new BrowserWindow({
    width: 400,
    height: 100,
    titleBarStyle: 'hidden',
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    }
  });

  win.loadFile('index.html');
  win.setAlwaysOnTop(true, 'screen');

  win.webContents.on('did-finish-load', () => {
  const process = spawn('python', ['pythons/main.py']);
  process.stdout.on('data', (data) => {
    win.webContents.send('python-response', data.toString());
  });
  process.stderr.on('data', (data) => {
    win.webContents.send('python-response', `Error: ${data.toString()}`);
  });
  });
}


app.whenReady().then(createWindow);

ipcMain.on('python-command', (event, command) => {
  const process = spawn('python', ['pythons/main.py', command]);

  process.stdout.on('data', (data) => {
    if (win) win.webContents.send('python-response', data.toString());
  });

  process.stderr.on('data', (data) => {
    if (win) win.webContents.send('python-response', `Error: ${data.toString()}`);
  });
});

ipcMain.handle("get-track-info", async () => {
  const { exec } = require("child_process");
  return new Promise((resolve) => {
    exec("python pythons/main.py", (error, stdout) => {
      if (error) return resolve({});
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({});
      }
    });
  });
});
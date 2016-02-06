/* eslint strict: 0 */
'use strict';
require('electron-debug')();
const path = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const crashReporter = electron.crashReporter;
const ipcMain = electron.ipcMain;

let mainWindow = null;

function log(msg) {
    mainWindow.webContents.send('log', msg);
}


function handleQuitting() {
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
    app.on('will-quit', function () {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
    });
}
function handleTitleChanges() {
    let originalTitle = "Music stream";

    ipcMain.on('song-changed', function (event, newSong) {
        if (newSong) {
            mainWindow.setTitle(`${newSong.name} - ${newSong.artist} - ${originalTitle}`);
        } else {
            mainWindow.setTitle(originalTitle);
        }
    });
}
function handleUseIdling() {
    var exec = require('child_process').exec;
    var cmd = path.join("lib", "binary", "win32-GetIdleTime.exe");

    setInterval(()=> {
        exec(cmd, function (error, stdout, stderr) {
            log(`Idle time: ${stdout}`);
            mainWindow.webContents.send('idle', stdout);
        });
    }, 60000);


}
function handleGlobalShortcuts() {
    const globalShortcut = electron.globalShortcut;
    globalShortcut.register('Super+Alt+CmdOrCtrl+Shift+O', function () {
        log('play/pause toggle key pressed');
        mainWindow.webContents.send('playPauseToggle');
    });
}

app.on('ready', () => {
    crashReporter.start();
    mainWindow = new BrowserWindow({width: 1024, height: 728});

    handleTitleChanges();
    handleUseIdling();
    handleGlobalShortcuts();
    handleQuitting();

    if (process.env.HOT) {
        mainWindow.loadURL(`file://${__dirname}/app/hot-dev-index.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
    }

});

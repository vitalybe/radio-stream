/* eslint strict: 0 */
'use strict';
const path = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const crashReporter = electron.crashReporter;
const shell = electron.shell;
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

let menu;
let template;
let mainWindow = null;


crashReporter.start();

require('electron-debug')();


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', function () {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});


app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 1024, height: 728});
    let originalTitle = "Music stream";

    function log(msg) {
        mainWindow.webContents.send('log', msg);
    }

    globalShortcut.register('Super+Alt+CmdOrCtrl+Shift+O', function () {
        log('play/pause toggle key pressed');
        mainWindow.webContents.send('playPauseToggle');
    });

    ipcMain.on('song-changed', function (event, newSong) {
        if(newSong) {
            mainWindow.setTitle(`${newSong.name} - ${newSong.artist} - ${originalTitle}`);
        } else {
            mainWindow.setTitle(originalTitle);
        }
    });


    var exec = require('child_process').exec;
    var cmd = path.join("lib", "binary", "win32-GetIdleTime.exe");

    setInterval(()=>{
        exec(cmd, function (error, stdout, stderr) {
            log(`Idle time: ${stdout}`);
            mainWindow.webContents.send('idle', stdout);
        });
    }, 60000);


    if (process.env.HOT) {
        mainWindow.loadURL(`file://${__dirname}/app/hot-dev-index.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.openDevTools();
    }

});

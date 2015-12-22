/* eslint strict: 0 */
'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const crashReporter = electron.crashReporter;
const shell = electron.shell;
const globalShortcut = electron.globalShortcut;
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

    function log(msg) {
        mainWindow.webContents.send('log', msg);
    }

    globalShortcut.register('ctrl+shift+p', function () {
        log('play/pause toggle key pressed');
        mainWindow.webContents.send('playPauseToggle');
    });

    if (process.env.HOT) {
        mainWindow.loadURL(`file://${__dirname}/app/hot-dev-index.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.openDevTools();
    }

});

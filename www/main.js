/* eslint strict: 0 */
'use strict';
require('electron-debug')();
const path = require('path');
const electron = require('electron');
const notifier = require('node-notifier');
const moment = require('moment');

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
    let currentSong = null;

    ipcMain.on('song-changed', function (event, newSong) {
        currentSong = newSong;
    });


    globalShortcut.register('Alt+Ctrl+Home', function () {
        log('play/pause toggle key pressed');
        mainWindow.webContents.send('playPauseToggle');
    });

    globalShortcut.register('Alt+Ctrl+Shift+Home', function () {
        log('show info pressed');
        const Growl = require('node-notifier').Growl;

        var notifier = new Growl({
            name: 'Music Stream', // Defaults as 'Node'
            host: 'localhost',
            port: 23053
        });

        if(currentSong) {
            let lastPlayed = moment.unix(currentSong.lastPlayed).fromNow();
            notifier.notify({
                title: `${currentSong.artist} - ${currentSong.name}`,
                message: `Rating: ${currentSong.rating/20}\nLast played: ${lastPlayed}`,
            });
        }
    });


    app.on('will-quit', function () {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
    });
}

app.on('ready', () => {
    crashReporter.start();
    mainWindow = new BrowserWindow({width: 1024, height: 728, icon: "app/images/icon.ico"});

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

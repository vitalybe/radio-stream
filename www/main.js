/* eslint strict: 0 */
'use strict';
require('electron-debug')();
const path = require('path');
const electron = require('electron');
const notifier = require('node-notifier');
const moment = require('moment');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
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
            mainWindow.setTitle(`${newSong.title} - ${newSong.artist} - ${originalTitle}`);
        } else {
            mainWindow.setTitle(originalTitle);
        }
    });
}
function handleUseIdling() {
    var exec = require('child_process').exec;
    // Windows:
    // var cmd = path.join("lib", "binary", "win32-GetIdleTime.exe");
    // OSX:
    var cmd = "/usr/sbin/ioreg -c IOHIDSystem | /usr/bin/awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'";

    setInterval(()=> {
        exec(cmd, function (error, stdout, stderr) {
            // log(`Idle time: ${stdout}`);
            mainWindow.webContents.send('idle', stdout);
        });
    }, 60000);


}
function handleGlobalShortcuts() {
    const globalShortcut = electron.globalShortcut;
    let currentSong = null;

    ipcMain.on('song-changed', function (event, newSong) {
        currentSong = newSong;
        if(!currentSong) {
            return;
        }

        currentSong.artistImageBuffer = null;

        // TODO: There might be a race condition in which it would show a picture of a previous artist
        // once the song has changed
        var request = require('request').defaults({encoding: null});
        request.get(currentSong.artistImage, function (err, res, body) {
            currentSong.artistImageBuffer = body;
        });
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

        if (currentSong) {
            let itunes_lastplayed = moment.unix(currentSong.itunes_lastplayed).fromNow();
            notifier.notify({
                title: `${currentSong.artist} - ${currentSong.title}`,
                message: `Rating: ${currentSong.itunes_rating / 20}\nLast played: ${itunes_lastplayed}`,
                icon: currentSong.artistImageBuffer
            });
        }
    });


    app.on('will-quit', function () {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
    });
}

app.on('ready', () => {
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

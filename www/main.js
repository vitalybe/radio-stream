/* eslint strict: 0 */
'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const crashReporter = electron.crashReporter;
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

let mainWindow = null;

crashReporter.start();

// stolen from: https://github.com/atom/electron/issues/1528
function getIdleTime() {
    let ref = require('ref');
    let refStruct = require('ref-struct');
    let refArray = require('ref-array');
    let ffi = require('ffi');

    var intPtr = null;
    var boolPtr = null;
    var LASTINPUTINFO = null;
    var pLASTINPUTINFO = null;
    var user32 = null;
    var kernel32 = null;

    function setupWindowsLibs() {
        intPtr = intPtr || ref.refType(ref.types.int32);
        boolPtr = boolPtr || ref.refType(ref.types.bool);

        LASTINPUTINFO = LASTINPUTINFO || refStruct({
                cbSize: ref.types.int32,
                dwTime: ref.types.uint32
            });

        pLASTINPUTINFO = pLASTINPUTINFO || ref.refType(LASTINPUTINFO);

        kernel32 = ffi.Library('kernel32', {'GetTickCount': ['int', null]});
        user32 = user32 || ffi.Library('user32', {
                'GetLastInputInfo': ['int', [pLASTINPUTINFO]]
            });
    }

    function getIdleTimeInMs() {
      setupWindowsLibs();

      let result = new LASTINPUTINFO();
      result.cbSize = LASTINPUTINFO.size;

      let failed = (user32.GetLastInputInfo(result.ref()) === 0);

      if (failed) {
        throw new Error("Couldn't get idle time");
      }

      return kernel32.GetTickCount() - result.dwTime;
    }

    return getIdleTimeInMs()
}

// Enable dev-tools
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

    globalShortcut.register('Super+Alt+CmdOrCtrl+Shift+P', function () {
        log('play/pause toggle key pressed');
        mainWindow.webContents.send('playPauseToggle');
    });

    ipcMain.on('song-changed', function (event, newSong) {
        if (newSong) {
            mainWindow.setTitle(`${newSong.name} - ${newSong.artist} - ${originalTitle}`);
        } else {
            mainWindow.setTitle(originalTitle);
        }
    });

    setInterval(() => log(`Idle time: ${getIdleTime()}`), 1000);

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

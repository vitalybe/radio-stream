/* eslint strict: 0 */
'use strict';
require('electron-debug')();
const path = require('path');
const electron = require('electron');
// shows devtools
require('electron-debug')({enabled: true});

const notifier = require('node-notifier');
const moment = require('moment');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const globalShortcuts = require("./app/native/global_shortcuts")
const titleHandler = require("./app/native/title_handler")
const nativeLog = require("./app/native/native_log")

let mainWindow = null;


function handleQuitting() {
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}

// TODO: Seperate
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

app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 1024, height: 728, icon: "app/images/icon.ico"});
    nativeLog.setMainWindow(mainWindow);

    titleHandler.register(app, mainWindow);
    handleUseIdling();
    handleQuitting();
    globalShortcuts.register(app, mainWindow);

    if (process.env.HOT) {
        mainWindow.loadURL(`file://${__dirname}/app/hot-dev-index.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
    }

});

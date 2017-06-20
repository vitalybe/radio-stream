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

const nativeLog = require("./app/native/native_log")

const globalShortcuts = require("./app/native/global_shortcuts")
const titleHandler = require("./app/native/title_handler")
const menu = require('./app/native/menu')

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 1024, height: 728, icon: "app/images/icon.ico"});
  nativeLog.setMainWindow(mainWindow);

  titleHandler.register(app, mainWindow);
  globalShortcuts.register(app, mainWindow);
  menu.setup();

  console.log("App settings are at: " + app.getPath('userData'));

  if (process.env.HOT) {
    mainWindow.loadURL(`file://${__dirname}/app/hot-dev-index.html`);
  } else {
    mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

});

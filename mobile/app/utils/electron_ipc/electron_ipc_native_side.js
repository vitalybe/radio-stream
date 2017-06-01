const nativeLog = require("./native_log");

const electron = require("electron");
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

let _mainWindow = null;

function onPlayPauseKey() {
  nativeLog.log("play/pause toggle key pressed");
  mainWindow.webContents.send("playPauseGlobalKey");
}

function onQuit() {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
}

module.exports.registerKeyboardShortcuts = function(mainWindow) {
  _mainWindow = mainWindow;
  ipcMain.on("onPlayPauseKeyChanged", (event, newKey) => {
    nativeLog.log(`registering key: ${newKey}`);

    globalShortcut.unregisterAll();

    if (newKey) {
      globalShortcut.register(newKey, onPlayPauseKey);
    }
  });

  app.on("will-quit", onQuit);
};

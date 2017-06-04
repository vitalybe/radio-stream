const electron = require("electron");
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

let _mainWindow = null;

module.exports = class ElectronIpcNativeSide {
  constructor(mainWindow) {
    this._mainWindow = mainWindow;
  }

  log(message) {
    this._mainWindow.webContents.send("nativeLog", message);
  }

  onPlayPauseKey() {
    this.log("play/pause toggle key pressed");
    this._mainWindow.webContents.send("playPauseGlobalKey");
  }

  onPlayPauseKeyChanged(event, newKey) {
    this.log(`registering key: ${newKey}`);

    globalShortcut.unregisterAll();

    if (newKey) {
      globalShortcut.register(newKey, this.onPlayPauseKey.bind(this));
    }
  }

  onQuit() {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
  }

  registerKeyboardShortcuts() {
    ipcMain.on("onPlayPauseKeyChanged", this.onPlayPauseKeyChanged.bind(this));
    electron.app.on("will-quit", this.onQuit.bind(this));
  }
};

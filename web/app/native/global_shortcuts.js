const nativeLog = require("../native/native_log")

const electron = require("electron")
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

module.exports.register = function(app, mainWindow) {
    ipcMain.on("onPlayPauseKeyChanged", (event, newKey) => {
        nativeLog.log(`registering key: ${newKey}`);

        globalShortcut.unregisterAll();

        if (newKey) {
            globalShortcut.register(newKey, function () {
                nativeLog.log('play/pause toggle key pressed');
                mainWindow.webContents.send('playPauseGlobalKey');
            });
        }
    })

    app.on('will-quit', function () {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
    });
}

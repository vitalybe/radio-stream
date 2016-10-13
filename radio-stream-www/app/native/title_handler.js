const nativeLog = require("../native/native_log")

const electron = require("electron")
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

module.exports.register = function (app, mainWindow) {
    var originalTitle = "Personal Radio Stream";

    ipcMain.on("onPlayerSongChanged", (event, newSong) => {

        if (newSong) {
            nativeLog.log(`song changed: ${newSong.toString()}`);
            mainWindow.setTitle(`${newSong.title} - ${newSong.artist} - ${originalTitle}`);
        } else {
            nativeLog.log(`song is null`);
            mainWindow.setTitle(originalTitle);
        }
    });
}

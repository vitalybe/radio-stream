var mainWindow = null;

module.exports.setMainWindow = function(window) {
    mainWindow = window;
}

module.exports.log = function(msg) {
    mainWindow.webContents.send('native-log', msg);
}

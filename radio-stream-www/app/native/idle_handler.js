const nativeLog = require("../native/native_log")

const electron = require("electron")
var exec = require('child_process').exec;

module.exports.register = function (app, mainWindow) {
    nativeLog.log(`idle handler registered`);

    // Windows:
    // var cmd = path.join("lib", "binary", "win32-GetIdleTime.exe");
    // OSX:
    var cmd = "/usr/sbin/ioreg -c IOHIDSystem | /usr/bin/awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'";

    setInterval(()=> {
        exec(cmd, function (error, stdout, stderr) {
            nativeLog.log(`Idle time: ${stdout}`);
            mainWindow.webContents.send('idle', stdout);
        });
    }, 60000);
}

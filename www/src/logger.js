// Usage:
//
//  var logger = require('logger').prefix('sessionStore');
//  logger.debug("Some debug messages");
//

console.log("initializing logging service");

var LoggingService = function() {

    var LEVELS = ['trace', 'debug', 'info', 'warn', 'error'];

    function prefixed (lvl, prefix, msg /*, ... */) {
        var args = Array.prototype.slice.call(arguments, 3);
        args.unshift('[' + prefix + '] ' + msg);
        this[lvl].apply(this, args);
    }

    function pad(num, size) {
        var numString = num+"";

        while (numString.length < size) {
             numString = "0" + numString;
        }

        return numString;
    }

    var inst = this;
    inst.__captured__ = [];

    // Detect the minimum log level activated
    var minLevel = 'debug';
    minLevel = LEVELS.indexOf(minLevel.toLowerCase());
    if (-1 === minLevel) {
        throw new Error('Unknown log level "' + minLevel + '"');
    }

    LEVELS.forEach(function (lvl, idx) {
        if (idx < minLevel) {
            inst[lvl] = function () {};
            return;
        }
        inst[lvl] = function (message) {

            // HACK: Capture every log message for bug reporting
            if (inst.__captured__) {
                inst.__captured__.push([lvl, Date.now(), message]);
            }

            // Prefix the message with a timestamp and the level
            var d = new Date();
            var hours = pad(d.getHours(), 2);
            var minutes = pad(d.getMinutes(), 2);
            var seconds = pad(d.getSeconds(), 2);
            var milliseconds = pad(d.getMilliseconds(), 3);
            message = `${hours}:${minutes}:${seconds}, ${milliseconds} - ${message}`;

            console[lvl].apply(console, [message]);
        };
    });

    // Handy method to provide an alias for logged messages
    inst.prefix = function (prefix) {
        var proxy = {};
        LEVELS.forEach(function (lvl) {
            proxy[lvl] = prefixed.bind(inst, lvl, prefix);
        });
        return proxy;
    };

    inst.formatException = function(exception) {
        var errorMessage = exception ? exception.toString() : "No error message";
        var stackTrace = window.printStackTrace({ e: exception });

        return errorMessage + '\n\t' + stackTrace.join('\n\t');
    };

    inst.formatCaptured = function () {
        return inst.__captured__.map((logEvent) =>  logEvent[2]).join("\n");
    };

    inst.clearCaptured = function () {
        inst.__captured__ = [];
    };

    return inst;
};

export default new LoggingService();

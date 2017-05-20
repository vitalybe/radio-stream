// Fork of: https://github.com/epeli/node-clim
// Usage:
//
// import moduleLogger from './logger'
// var logger = moduleLogger("file.js");
// let logger = moduleLogger("method", moduleLogger);
//
var clim;

module.exports = clim = function (prefix, parent, patch) {
  var ob;
  var noFormat = false;
  // Fiddle optional arguments
  patch = Array.prototype.slice.call(arguments, -1)[0];
  if (typeof patch === 'object') {
    noFormat = patch.noFormat;
    patch = patch.patch;
  }
  if (typeof patch !== "boolean") patch = false;
  if (typeof prefix === "object" && prefix !== null) {
    parent = prefix;
    prefix = undefined;
  }

  // if method is a path, take the last section (file name)
  let lastSlashWin = prefix.lastIndexOf("\\");
  let lastSlashUnix = prefix.lastIndexOf("/");
  let lastSlash = lastSlashWin > -1 ? lastSlashWin : lastSlashUnix;
  if (lastSlash > -1) {
    prefix = prefix.substr(lastSlash + 1)
  }

  if (patch && parent) {
    // Modify given object when patching is requested
    ob = parent;
  }
  else {
    // Otherwise create new object
    ob = {};
    if (parent && parent._prefixes) {
      // and inherit prefixes from the given object
      ob._prefixes = parent._prefixes.slice();
    }
  }

  // Append new prefix
  if (!ob._prefixes) ob._prefixes = [];
  if (prefix) ob._prefixes.push("[" + prefix + "]");

  ob.log = createLogger("log", ob._prefixes, noFormat);
  ob.debug = createLogger("debug", ob._prefixes, noFormat);
  ob.info = createLogger("info", ob._prefixes, noFormat);
  ob.warn = createLogger("warn", ob._prefixes, noFormat);
  ob.error = createLogger("error", ob._prefixes, noFormat);
  consoleProxy(ob);

  if(parent) {
    ob.info("created");
  }

  return ob;
};

// By default write all logs to stderr
clim.logWrite = function (level, prefixes, msg) {
  var line = clim.getTime();
  line += " - " + level.toUpperCase();
  if (prefixes.length > 0) line += " - " + prefixes.join(" ");
  line += " " + msg;
  console[level].call(console, line);
};


function pad(num, size) {
  var numString = num + "";

  while (numString.length < size) {
    numString = "0" + numString;
  }

  return numString;
}

clim.getTime = function () {
  var d = new Date();
  var hours = pad(d.getHours(), 2);
  var minutes = pad(d.getMinutes(), 2);
  var seconds = pad(d.getSeconds(), 2);
  var milliseconds = pad(d.getMilliseconds(), 3);

  return `${hours}:${minutes}:${seconds},${milliseconds}`;
};


// Just proxy methods we don't care about to original console object
function consoleProxy(ob) {
  // list from http://nodejs.org/api/stdio.html
  var methods = ["dir", "time", "timeEnd", "trace", "assert"];
  methods.forEach(function (method) {
    if (ob[method]) return;
    ob[method] = function () {
      return console[method].apply(console, arguments);
    };
  });
}

function createLogger(method, prefixes, noFormat) {

  return function () {
    // Handle formatting and circular objects like in the original
    var msg = Array.prototype.slice.call(arguments);

    clim.logWrite(method, prefixes, msg);
  };
}
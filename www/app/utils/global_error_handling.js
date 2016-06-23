// Global error handling
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    debugger;
    alert('Unhandled thrown error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
        + ' Column: ' + column + ' StackTrace: ' + errorObj);
};

console.error = (function (old_function) {
    return function (text) {
        old_function(text);
        debugger;
        alert("Unexpected console error: " + text)
    };
}(console.error.bind(console)));
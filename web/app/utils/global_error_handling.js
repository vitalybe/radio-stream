import navigator from '../stores/navigator'

var consoleErrorOriginal = console.error.bind(console);

// Global error handling
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    navigator.activateFatalError("Error text: " + errorMsg)
};

console.error = function (text, callstack) {
    consoleErrorOriginal(text, callstack);
    navigator.activateFatalError("Error text: " + text)
};
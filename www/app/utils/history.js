let history = null;

export default function getHistory() {
    if (!history) {
        let createHistoryFunc = null;
        if (__WEB__) {
            createHistoryFunc = require('history/lib/createBrowserHistory');
        } else {
            createHistoryFunc = require('history/lib/createHashHistory');
        }

        history = createHistoryFunc();
    }

    return history
}


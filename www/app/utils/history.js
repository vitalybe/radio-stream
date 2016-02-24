let createHistory = null;
if(__WEB__) {
  createHistory = require('history/lib/createBrowserHistory');
} else {
  createHistory = require('history/lib/createHashHistory');
}

const history = createHistory();

export default history;

const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
const shell = electron.shell;
const defaultMenu = require('electron-default-menu');

module.exports.setup = function () {
  const menu = defaultMenu(app, shell);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import {observable, action} from "mobx";

class Sidebar {
  @observable isOpen = true;
}

export default new Sidebar();
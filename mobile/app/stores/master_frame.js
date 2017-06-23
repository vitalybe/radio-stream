import loggerCreator from "../utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("MasterFrame");

import { observable } from "mobx";

class MasterFrame {
  @observable isNavigationSidebarOpen = true;

  constructor() {
    loggerCreator("constructor", moduleLogger);
  }
}

export default new MasterFrame();

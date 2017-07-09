import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("MasterStore");

import { observable } from "mobx";

class MasterStore {
  @observable isNavigationSidebarOpen = false;
  @observable isPlaylistSidebarOpen = true;

  constructor() {
    loggerCreator("constructor", moduleLogger);
  }
}

export default new MasterStore();

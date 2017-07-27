import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("MasterStore");

import { observable } from "mobx";

class MasterStore {
  // TEMP
  @observable isNavigationSidebarOpen = false;
  @observable isPlaylistSidebarOpen = false;

  closeSidebars() {
    this.isNavigationSidebarOpen = false;
    this.isPlaylistSidebarOpen = false;
  }

  constructor() {
    loggerCreator("constructor", moduleLogger);
  }
}

export const masterStore = new MasterStore();

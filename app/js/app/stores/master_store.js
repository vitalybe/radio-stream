import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("MasterStore");

import { observable } from "mobx";

class MasterStore {
  @observable isNavigationSidebarOpen = true;
  @observable isPlaylistSidebarOpen = false;
  @observable activeSlideIndex = 0;

  closeSidebars() {
    this.isNavigationSidebarOpen = false;
    this.isPlaylistSidebarOpen = false;
  }

  constructor() {
    loggerCreator("constructor", moduleLogger);
  }
}

export const masterStore = new MasterStore();

import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("ElectronIpcBrowserSide");

import { ipcRenderer } from "electron";
import { player } from "app/stores/player/player";

class ElectronIpcBrowserSide {
  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
  }

  onPlayPauseToggle() {
    let logger = loggerCreator("playPauseToggle", moduleLogger);
    logger.info("received message: playPauseToggle");

    if (player && player.currentPlaylist) {
      logger.info(`pausing current playlist: ${player.currentPlaylist.name}`);
      player.playPauseToggle();
    }
  }

  onNativeLog(event, message) {
    let logger = loggerCreator("onNativeLog", moduleLogger);
    logger.info(`from native side: ${message}`);
  }

  connect() {
    ipcRenderer.on("playPauseGlobalKey", this.onPlayPauseToggle);
    ipcRenderer.on("nativeLog", this.onNativeLog);
  }
}

export default new ElectronIpcBrowserSide();

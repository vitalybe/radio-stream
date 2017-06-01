import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("ElectronIpcBrowserSide");

import { ipcRenderer } from "electron";
import player from "../../stores/player/player";

class ElectronIpcBrowserSide {
  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
  }

  connect() {
    ipcRenderer.on("playPauseGlobalKey", function() {
      let logger = loggerCreator("playPauseToggle", moduleLogger);
      logger.info("received message: playPauseToggle");

      if (player && player.currentPlaylist) {
        logger.info(`pausing current playlist: ${player.currentPlaylist.name}`);
        player.playPauseToggle();
      }
    });
  }
}

export default new ElectronIpcBrowserSide();

import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsProvider.android");

import Orientation from "react-native-orientation";

class DimensionsProvider {
  callback = null;

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
    Orientation.lockToPortrait();
    Orientation.addOrientationListener(() => {
      logger.info(`orientation changed`);
      if (this.callback) {
        this.callback();
      }
    });
  }

  subscribeDimensionsChanged(callback) {
    this.callback = callback;
  }
}

export default new DimensionsProvider();

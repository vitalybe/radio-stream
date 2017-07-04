import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsChangedEmitter.android");

import Orientation from "react-native-orientation";

class DimensionsChangedEmitter {
  callback = null;

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
    Orientation.lockToPortrait();
  }

  subscribe(callback) {
    // only for web
  }
}

export default new DimensionsChangedEmitter();

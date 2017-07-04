import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsChangedEmitter");

class DimensionsChangedEmitter {
  callback = null;

  constructor() {
    loggerCreator("constructor", moduleLogger);

    window.addEventListener("resize", () => {
      if (this.callback) {
        this.callback();
      }
    });
  }

  subscribe(callback) {
    this.callback = callback;
  }
}

export default new DimensionsChangedEmitter();

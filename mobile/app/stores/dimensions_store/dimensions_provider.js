import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsProvider");

class DimensionsProvider {
  callback = null;

  constructor() {
    loggerCreator("constructor", moduleLogger);

    window.addEventListener("resize", () => {
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

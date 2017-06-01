import loggerCreator from "../logger";
const moduleLogger = loggerCreator("SettingsNativeDummy");

// This is only used to serve as a placeholder for platforms that don't have unique settings
class SettingsNativeDummy {
  //noinspection JSUnusedGlobalSymbols
  async save() {
    let logger = loggerCreator("save", moduleLogger);
    logger.info(`start`);
  }
}

const settingsNativeDummy = new SettingsNativeDummy();
export default settingsNativeDummy;

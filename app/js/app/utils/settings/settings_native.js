import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("SettingsNativeDummy");

// This is only used to serve as a placeholder for platforms that don't have unique settings
class SettingsNativeDummy {
  //noinspection JSUnusedGlobalSymbols
  async save() {
    loggerCreator("save", moduleLogger);
  }

  async load() {
    loggerCreator("load", moduleLogger);
  }
}

const settingsNativeDummy = new SettingsNativeDummy();
export default settingsNativeDummy;

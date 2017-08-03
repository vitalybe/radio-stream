import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("Routes");

class Routes {
  SETTINGS_PAGE = "SETTINGS_PAGE";
  PLAYER_PAGE = "PLAYER_PAGE";
  SEARCH_PAGE = "SEARCH_PAGE";
}

export const routes = new Routes();

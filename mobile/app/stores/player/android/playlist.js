import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("playlist");

import { observable } from "mobx";

export default class Playlist {
  @observable name = null;
}

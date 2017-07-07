import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsStore");

import { computed, observable } from "mobx";
import { Dimensions } from "react-native";
import DimensionsChangedEmitter from "app/utils/dimensions_changed_emitter/dimensions_changed_emitter";

const BIG_WIDTH = 500;

class DimensionsStore {
  @observable width = 0;
  @observable height = 0;

  _dimensionsChangedEmitter = new DimensionsChangedEmitter();

  @computed
  get isBigWidth() {
    return this.width > BIG_WIDTH;
  }

  _updateDimensions = () => {
    let logger = loggerCreator("_updateDimensions", moduleLogger);

    const { height, width } = Dimensions.get("window");
    logger.info(`updated dimensions: width=${width} height=${height}`);

    this.height = height;
    this.width = width;
  };

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
    this._updateDimensions();
    this._dimensionsChangedEmitter.subscribe(this._updateDimensions);
    logger.info(`subscribed to dimensions change`);
  }
}

export const dimensionsStoreInstance = new DimensionsStore();

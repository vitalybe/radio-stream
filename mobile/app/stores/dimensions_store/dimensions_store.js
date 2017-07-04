import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsStore");

import _ from "lodash";
import { computed, observable } from "mobx";
import { Dimensions } from "react-native";
import DimensionsChangedEmitter from "./dimensions_changed_emitter";

const BIG_WIDTH = 500;

class DimensionsStore {
  @observable width = 0;
  @observable height = 0;

  @computed
  get isBigWidth() {
    return this.width > BIG_WIDTH;
  }

  _updateDimensions = _.throttle(
    () => {
      let logger = loggerCreator("_updateDimensions", moduleLogger);

      const { height, width } = Dimensions.get("window");
      logger.info(`updated dimensions: width=${width} height=${height}`);

      this.height = height;
      this.width = width;
    },
    500,
    { leading: true, trailing: true }
  );

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
    this._updateDimensions();
    DimensionsChangedEmitter.subscribe(this._updateDimensions);
    logger.info(`subscribed to dimensions change`);
  }
}

export default new DimensionsStore();

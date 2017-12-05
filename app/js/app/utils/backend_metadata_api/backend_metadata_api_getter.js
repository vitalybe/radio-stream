import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("backendMetadataApi");

import constants from "app/utils/constants";
import settings from "app/utils/settings/settings";

import { backendMetadataApiReal } from "./backend_metadata_api_real";
import { backendMetadataApiMock } from "./backend_metadata_api_mock";

class BackendMetadataApiGetter {
  get() {
    let instance = backendMetadataApiReal;
    if (settings.values.isMock) {
      instance = backendMetadataApiMock;
    }

    return instance;
  }
}

export const backendMetadataApiGetter = new BackendMetadataApiGetter();

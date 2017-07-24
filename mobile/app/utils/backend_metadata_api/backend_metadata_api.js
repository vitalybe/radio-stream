import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("backendMetadataApi");

import constants from "app/utils/constants";

import { backendMetadataApiReal } from "./backend_metadata_api_real";
import { backendMetadataApiMock } from "./backend_metadata_api_mock";

let instance = backendMetadataApiReal;
if (constants.MOCK_MODE) {
  instance = backendMetadataApiMock;
}

export const backendMetadataApi = instance;

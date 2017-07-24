import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("backendMetadataApi");

import Config from "react-native-config";
import { backendMetadataApiReal } from "./backend_metadata_api_real";
import { backendMetadataApiMock } from "./backend_metadata_api_mock";

let instance = backendMetadataApiReal;
if (Config.MOCK_MODE === "true") {
  instance = backendMetadataApiMock;
}

export const backendMetadataApi = instance;

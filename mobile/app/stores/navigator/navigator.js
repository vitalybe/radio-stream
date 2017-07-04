import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("navigator");

import constants from "app/utils/constants";

import navigatorReal from "./navigator_real";
import navigatorMock from "./navigator_mock";

let navigator = navigatorReal;
if (constants.MOCK_MODE) {
  navigator = navigatorMock;
}

export default navigator;

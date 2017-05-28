import loggerCreator from "../../utils/logger";
const moduleLogger = loggerCreator("navigator");

import constants from "../../utils/constants";

import navigatorReal from "./navigator_real";
import navigatorMock from "./navigator_mock";

let navigator = navigatorReal;
if (constants.MOCK_MODE) {
  navigator = navigatorMock;
}

export default navigator;

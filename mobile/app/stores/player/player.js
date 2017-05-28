import loggerCreator from "../../utils/logger";
const moduleLogger = loggerCreator("player");

import constants from "../../utils/constants";

import playerReal from "./player_real";
import playerMock from "./player_mock";

let player = playerReal;
if (constants.MOCK_MODE) {
  player = playerMock;
}

export default player;

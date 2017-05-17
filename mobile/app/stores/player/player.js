import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("player");

import { MOCK_MODE } from "../../utils/constants"

import playerReal from './player_real'
import playerMock from './player_mock'

let player = playerReal;
// if (MOCK_MODE) {
//   player = playerMock
// }

export default player
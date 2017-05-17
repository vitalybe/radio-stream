import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("player_mock");

import sinon from 'sinon'
import playerReal from './player_real'

const playerMock = sinon.createStubInstance(playerReal.constructor)
playerMock.isLoading = false

export default playerMock
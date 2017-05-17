import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("navigator_mock");

import sinon from 'sinon'
import navigatorReal from './navigator_real'

const navigatorMock = sinon.stub(navigatorReal)
navigatorMock.activeRoute = {address: navigatorReal.ROUTE_PLAYLIST_COLLECTION_PAGE}

export default navigatorMock
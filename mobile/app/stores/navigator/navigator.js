import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("navigator");

import { observable } from "mobx";
import { MOCK_MODE } from "../../utils/constants"

import navigatorReal from './navigator_real'
import navigatorMock from './navigator_mock'

let navigator = navigatorReal;
if (MOCK_MODE) {
  navigator = navigatorMock
}

debugger

export default navigator
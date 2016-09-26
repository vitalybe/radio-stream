require('file?name=[name].[ext]!./index.html');
require("./styles/index.less");
require("../lib/styles/font-awesome/css/font-awesome.min.css");
require('./utils/global_error_handling.js');

window.Promise = require('yaku');

import loggerCreator from './utils/logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

import React from 'react';
import ReactDom from 'react-dom';

import * as desktopIpc from './utils/desktop_ipc'
import RadioStreamApp from './containers/radio_stream_app'
import * as wrappedSoundManager from './utils/wrapped_sound_manager'

import Navigator from "./stores/navigator"

logger.info("Compilation settings - __PROD__: " + __PROD__);
logger.info("Compilation settings - __WEB__: " + __WEB__);


// service initializations
wrappedSoundManager.setup();
desktopIpc.connect();

ReactDom.render(
    <RadioStreamApp navigator={new Navigator()} />

    , document.getElementById('root'));

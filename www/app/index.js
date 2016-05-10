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
import { Provider } from 'react-redux';
import { Router, Route, Link } from 'react-router';
import history from './utils/history'

import * as desktopIpc from './utils/desktop_ipc'
import configureStore from './store_config';
import DevToolsRedux from './components/dev_tools_redux'
import DevToolsProject from './components/dev_tools_project'
import { LoginPage } from './containers/login_page';
import { StartupPage } from './containers/startup_page';
import { PlaylistPage } from './containers/playlist_page';
import storeContainer from './utils/store_container'


logger.info("Compilation settings - __PROD__: " + __PROD__);
logger.info("Compilation settings - __WEB__: " + __WEB__);


const store = configureStore();
// The following allows us to dispatch actions everywhere
// Following the advice on this thread: https://github.com/rackt/redux/issues/806
storeContainer.store = store;

desktopIpc.connect();

ReactDom.render(
    <Provider store={store}>
        <div>
            <DevToolsRedux />
            <Router history={history}>
                <Route path="/" component={StartupPage}/>
                <Route path="/playlist/:playlistName" component={PlaylistPage}/>

                <Route path="/login" component={LoginPage}/>
            </Router>
        </div>
    </Provider>

    , document.getElementById('root'));

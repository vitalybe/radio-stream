require('file?name=[name].[ext]!../index.html');
require("./styles/index.less");
require("../lib/styles/font-awesome/css/font-awesome.min.css");

window.Promise = require('yaku');

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Link } from 'react-router';
import history from './utils/history'

import configureStore from './store_config';
import DevToolsRedux from './components/dev_tools_redux'
import DevToolsProject from './components/dev_tools_project'
import { LoginPage } from './containers/login_page';
import { StartupPage } from './containers/startup_page';
import { PlaylistPage } from './containers/playlist_page';
import storeContainer from './utils/store_container'

const store = configureStore();
// The following allows us to dispatch actions everywhere
// Following the advice on this thread: https://github.com/rackt/redux/issues/806
storeContainer.store = store;

ReactDom.render(
    <Provider store={store}>
        <div>
            <DevToolsRedux />
            <DevToolsProject />
            <Router history={history}>
                <Route path="/" component={StartupPage}/>
                <Route path="/playlist/:playlistName" component={PlaylistPage}/>

                <Route path="/login" component={LoginPage}/>
            </Router>
        </div>
    </Provider>

    , document.getElementById('root'));

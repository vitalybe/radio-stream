require('file?name=[name].[ext]!../index.html');
require("./styles/index.less");
require("../lib/styles/font-awesome/css/font-awesome.min.css");

window.Promise = require('yaku');

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { IndexRoute, Route, Link } from 'react-router';
import { ReduxRouter } from 'redux-router';

import configureStore from './store_config';
import DevTools from './components/dev_tools_redux'
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
            <ReduxRouter>
                <Route path="/" component={StartupPage}/>
                <Route path="/playlist/:playlistName" component={PlaylistPage}/>

                <Route path="/login" component={LoginPage}/>
            </ReduxRouter>
            <DevTools />
        </div>
    </Provider>

    , document.getElementById('root'));

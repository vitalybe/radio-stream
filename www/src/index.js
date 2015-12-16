require('file?name=[name].[ext]!../index.html');
require("./styles/index.less");
require("../lib/styles/font-awesome/css/font-awesome.min.css");

window.Promise = require('yaku');

import React from 'react';
import { Provider } from 'react-redux';
import { Router, IndexRoute, Route, Link } from 'react-router';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import {createHistory} from 'history';
import { syncReduxAndRouter } from 'redux-simple-router'

import configureStore from './store_config';
import { LoginPage } from './containers/login_page';
import { StartupPage } from './containers/startup_page';
import { PlaylistPage } from './containers/playlist_page';
import storeContainer from './utils/store_container'

const store = configureStore();
const history = createHistory();
syncReduxAndRouter(history, store);
// The following allows us to dispatch actions everywhere
// Following the advice on this thread: https://github.com/rackt/redux/issues/806
storeContainer.store = store;

React.render(
  <Provider store={store}>
    {() =>
    <div>
        <Router history={history}>
            <Route path="/" component={StartupPage}/>
            <Route path="/playlist/:playlistName" component={PlaylistPage}/>

            <Route path="/login" component={LoginPage}/>
        </Router>
        <DebugPanel top right bottom>
            <DevTools store={store}
            monitor={LogMonitor}
            visibleOnLoad={true} />
        </DebugPanel>
    </div>
    }
  </Provider>

, document.getElementById('root'));

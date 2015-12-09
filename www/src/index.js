require('file?name=[name].[ext]!../index.html');
require("./styles/index.less");
require("../lib/styles/font-awesome/css/font-awesome.min.css");

window.Promise = require('yaku');

import React from 'react';
import { Provider } from 'react-redux';
import { IndexRoute, Route, Link } from 'react-router';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { ReduxRouter } from 'redux-router';
import configureStore from './store_config';
import { LoginPage } from './containers/login_page';
import { StartupPage } from './containers/startup_page';
import { PlaylistPage } from './containers/playlist_page';
import { dispatchContainer } from './utils/dispatch'

const store = configureStore();
// The following allows us to dispatch actions everywhere
// Following the advice on this thread: https://github.com/rackt/redux/issues/806
dispatchContainer.dispatch = store.dispatch;

React.render(
  <Provider store={store}>
    {() =>
    <div>
        <ReduxRouter>
            <Route path="/" component={StartupPage}/>
            <Route path="/playlist/:playlistName" component={PlaylistPage}/>

            <Route path="/login" component={LoginPage}/>
        </ReduxRouter>
        <DebugPanel top right bottom>
            <DevTools store={store}
            monitor={LogMonitor}
            visibleOnLoad={true} />
        </DebugPanel>
    </div>
    }
  </Provider>

, document.getElementById('root'));

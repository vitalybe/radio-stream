require('file?name=[name].[ext]!../index.html');

window.Promise = require('yaku');

import React from 'react';
import { Provider } from 'react-redux';
import { IndexRoute, Route, Link } from 'react-router';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { ReduxRouter } from 'redux-router';
import configureStore from './store_config';
import { App, PlaylistPage, LoginPage } from './containers';
import { Silly } from './components';

const store = configureStore();

React.render(
  <Provider store={store}>
    {() =>
    <div>
        <ReduxRouter>
          <Route path="/" component={App}>
            <Route path="login" component={LoginPage}/>
            <Route path="playlist/:playlistName" component={PlaylistPage}/>
          </Route>
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

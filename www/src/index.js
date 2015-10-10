import React from 'react';
import { Provider } from 'react-redux';
import { Route, Link } from 'react-router';
import { ReduxRouter } from 'redux-router';
import configureStore from './store_config';
import { App } from './containers';
import { Silly } from './components';

const store = configureStore();

React.render(
  <Provider store={store}>
    {() => <ReduxRouter>
      <Route path="/" component={App}>
        <Route path="silly" component={Silly}/>
      </Route>
    </ReduxRouter>}
  </Provider>

, document.getElementById('root'));

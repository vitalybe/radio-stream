import React from 'react';
import App from './containers';
import { Provider } from 'react-redux';
import configureStore from './store_config';

const store = configureStore();


React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>
, document.getElementById('root'));

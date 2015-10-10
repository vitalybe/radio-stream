import { INCREMENT } from './actions';
import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';


function counter(state = 0, action = null) {
  switch (action.type) {
  case INCREMENT:
    return state + 2;
  default:
    return state;
  }
}

const rootReducer = combineReducers({
  counter,
  router: routerStateReducer
});

export default rootReducer;

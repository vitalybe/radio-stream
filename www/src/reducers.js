import { INCREMENT } from './actions';
import { combineReducers } from 'redux';

function counter(state = 0, action) {
  switch (action.type) {
  case INCREMENT:
    return state + 2;
  default:
    return state;
  }
}

const rootReducer = combineReducers({
  counter
});

export default rootReducer;

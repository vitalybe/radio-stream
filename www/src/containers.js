import React, { Component } from 'react';
import { connect } from 'react-redux';

import Counter from './components';
import { increment } from './actions';

// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state) {
  return {
    value: state.counter
  };
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
    onIncrement: () => dispatch(increment())
  };
}

class App extends Component {
  render() {
    return (
          <div>
            <h1>Hello world!</h1>
            <Counter value={this.props.value} handler={this.props.onIncrement}></Counter>
          </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
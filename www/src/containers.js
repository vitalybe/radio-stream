import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Counter } from './components';
import { increment } from './actions';

// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state) {
  return {
    value: state.counter,
    routerState: state.router
  };
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
    onIncrement: () => dispatch(increment())
  };
}

export class App extends Component {
  render() {
    return (
      <div>
        <h1>Menu</h1>
        <ul>
            <li>
              <Link to="/">Counter</Link>
            </li>
            <li>
              <Link to="/silly">Silly link</Link>
            </li>
        </ul>
        <h1>Content</h1>
        {this.props.children}
      </div>
    );
  }
}


@connect(mapStateToProps, mapDispatchToProps)
export class CounterDisplay extends Component {
  render() {
    return (
          <div>
            <Counter value={this.props.value} handler={this.props.onIncrement}></Counter>
          </div>
    );
  }
}
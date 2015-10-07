import React, { Component } from 'react';

export default class Counter extends Component {
  render() {
    return (
      <button onClick={this.props.handler}>
        {this.props.value}
      </button>
    );
  }
}
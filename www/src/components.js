import React, { Component } from 'react';

export class Counter extends Component {
  render() {
    return (
      <button onClick={this.props.handler}>
        {this.props.value}
      </button>
    );
  }
}

export class Silly extends Component {
  render() {
    return (
      <div>I am very silly</div>
    );
  }
}
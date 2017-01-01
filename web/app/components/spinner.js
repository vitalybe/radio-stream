import React, {Component} from 'react';
import {connect} from 'react-redux';

export default class Spinner extends Component {

  render() {
    return (
      <div className="spinner">
        <div className="hexdots-loader graphic"></div>
        <div className="status">{ this.props.action }</div>
        <If condition={ this.props.error }>
          <div className="last-error">
            <span className="prefix">Last error: </span>
            <span>{ this.props.error }</span>
          </div>
        </If>
      </div>
    )
  }
}
import React, {Component} from 'react';

import * as actions from '../actions/misc_actions';

export class LoginPage extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {success: ""};
  }

  login() {
    let inputPassword = this.refs.password.getDOMNode().value;
    this.setState({success: "Loading"});
    actions.login(inputPassword).then((result) => {
      this.setState({success: result.success})
    });
  }

  render() {
    return (
      <div>
        <input type="password" placeholder="Password" ref="password"></input>
        <button onClick={this.login.bind(this)}>Submit</button>
        <div>Success: {this.state.success.toString()}</div>
      </div>
    );
  }
}
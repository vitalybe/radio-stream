import React, {Component} from 'react';
import {View} from 'react-native';

import DropdownMenu from 'react-dd-menu';
require("react-dd-menu/dist/react-dd-menu.css");

let MenuContext = props => <View>{props.children}</View>

class Menu extends Component {
  componentWillMount() {
    this.state = {
      contextMenuOpen: false
    }
  }

  render() {
    return (
      <DropdownMenu
        isOpen={this.state.contextMenuOpen}
        close={() => this.setState({contextMenuOpen: false})}
        toggle={<div onClick={() => this.setState({contextMenuOpen: !this.state.contextMenuOpen})}>Hello</div>}>
        <li><a href="#" onClick={() => true}>Clear rating</a></li>
        <li><a href="#" onClick={() => true}>Delete song</a></li>
      </DropdownMenu>
    )
  }
}

let MenuOptions = props => <View>{props.children}</View>
let MenuOption = props => <View>{props.children}</View>
let MenuTrigger = props => <View>{props.children}</View>

export {MenuContext, Menu, MenuOptions, MenuOption, MenuTrigger}
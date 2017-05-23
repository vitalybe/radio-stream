import React, {Component} from 'react';
import {View} from 'react-native';

import DropdownMenu from 'react-dd-menu';
require("./context_menu.css");

let MenuContext = props => <View>{props.children}</View>

let MenuTrigger = props => <View style={props.style}>{props.children}</View>
let MenuOptions = props => <View style={props.style}>{props.children}</View>
let MenuOption = props => <li style={props.style}><a href="#" onClick={props.onSelect}>{props.children}</a></li>

class Menu extends Component {
  componentWillMount() {
    this.state = {
      contextMenuOpen: false
    }
  }

  render() {

    const toggle = this.props.children.find(component => component.type === MenuTrigger)
    const menuOptions = this.props.children.find(component => component.type === MenuOptions)

    return (
      <View style={this.props.style}>
        <DropdownMenu
          isOpen={this.state.contextMenuOpen}
          close={() => this.setState({contextMenuOpen: false})}
          toggle={<View onClick={() => this.setState({contextMenuOpen: !this.state.contextMenuOpen})}>{toggle}</View>}>
          {menuOptions}
        </DropdownMenu>
      </View>
    )
  }
}


export {MenuContext, Menu, MenuOptions, MenuOption, MenuTrigger}
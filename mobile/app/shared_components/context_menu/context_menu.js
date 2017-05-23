import React, {Component} from 'react';
import {View} from 'react-native';

import DropdownMenu from 'react-dd-menu';
require("./context_menu.css");

let MenuContext = props => <View>{props.children}</View>

let MenuTrigger = props => props.children
let MenuOptions = props => null

class MenuOption extends Component {
  render() {
    return <li><a href="#" onClick={this.props.onSelect}>{this.props.children}</a></li>
  }
}

class Menu extends Component {
  isTrigger(component) {
    return component.type === MenuTrigger
  }

  componentWillMount() {
    this.state = {
      contextMenuOpen: false
    }
  }

  render() {

    const toggle = this.props.children.find(component => component.type === MenuTrigger)
    const optionsContainer = this.props.children.find(component => component.type === MenuOptions)

    return (
      <DropdownMenu
        animate={false}
        isOpen={this.state.contextMenuOpen}
        close={() => this.setState({contextMenuOpen: false})}
        toggle={<View onClick={() => this.setState({contextMenuOpen: !this.state.contextMenuOpen})}>{toggle}</View>}>
        {optionsContainer.props.children}
      </DropdownMenu>
    )
  }
}


export {MenuContext, Menu, MenuOptions, MenuOption, MenuTrigger}
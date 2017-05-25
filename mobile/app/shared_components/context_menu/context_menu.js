import React, {Component} from 'react';
import {View, StyleSheet, TouchableHighlight, Text} from 'react-native';

import DropdownMenu from 'react-dd-menu';
require("./context_menu.css");

let MenuContext = props => <View style={props.customStyles.menuContextWrapper}>{props.children}</View>

let MenuTrigger = props => <View style={props.style}>{props.children}</View>
let MenuOptions = props => (
  <View style={props.customStyles.optionsWrapper}>
    {
      React.Children.map(props.children, child =>
        React.cloneElement(child, {
          optionTouchable: props.customStyles.optionTouchable,
          optionText: props.customStyles.optionText
        })
      )
    }
  </View>
)
let MenuOption = props => (
  <TouchableHighlight onPress={props.onSelect} {...props.optionTouchable}>
    <Text style={[{whiteSpace: "pre"}, props.optionText]}>{props.text}</Text>
  </TouchableHighlight>
)

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
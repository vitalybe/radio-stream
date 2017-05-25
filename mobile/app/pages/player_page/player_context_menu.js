import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlayerContextMenu");

import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, TouchableHighlight} from 'react-native';

import {Menu, MenuOptions, MenuOption, MenuTrigger} from '../../shared_components/context_menu/context_menu';
import {colors} from '../../styles/styles'

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    right: 0,
    top: -5
  },
  menuTrigger: {
    paddingRight: 20,
    fontSize: 25,
    fontWeight: "bold",
    color: colors.CYAN_BRIGHT,
  },
});

const menuOptionsCustomStyles = {
  OptionTouchableComponent: TouchableHighlight,
  optionsWrapper: {
    backgroundColor: colors.CYAN_DARKEST,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
  },
  optionTouchable: {
    activeOpacity: 1,
    underlayColor: colors.CYAN_DARK,
  },
  optionText: {
    color: colors.CYAN_BRIGHT,
    padding: 10,
    textAlign: "center",
  },
}


export default class PlayerContextMenu extends Component {

  render() {
    return (
      <Menu style={styles.menu}>
        <MenuTrigger>
          <Text style={styles.menuTrigger}>&#8942;</Text>
        </MenuTrigger>
        <MenuOptions customStyles={menuOptionsCustomStyles}>
          <MenuOption onSelect={() => this.props.song.actions.changeRating(0)} text="Clear rating"/>
          <MenuOption onSelect={() => this.props.song.actions.markAsDeleted()} text="Delete song"/>
        </MenuOptions>
      </Menu>
    );
  }
}

PlayerContextMenu.propTypes = {
  song: React.PropTypes.object.isRequired
};
import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlayerContextMenu");

import React, {Component} from 'react';
import {Image, StyleSheet, Text, View,} from 'react-native';

import {Menu, MenuOptions, MenuOption, MenuTrigger} from '../../shared_components/context_menu/context_menu';
import {colors} from '../../styles/styles'

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    right: 0,
    top: -5},
  menuTrigger: {
    paddingRight: 20,
    fontSize: 25,
    fontWeight: "bold",
    color: colors.CYAN_BRIGHT.rgbString(),
  },
  menuOptions: {
    backgroundColor: "black",
    borderColor: colors.CYAN_BRIGHT.rgbString(),
    borderStyle: "solid",
    borderWidth: 1,
    padding: 10,
    paddingBottom: 0,
    minWidth: 120,
  },
  menuOption: {
    marginBottom: 10,
  },
  menuOptionText: {
    color: colors.CYAN_BRIGHT.rgbString(),
    textAlign: "center",
  }

});

export default class PlayerContextMenu extends Component {

  render() {
    return (
      <Menu style={styles.menu}>
        <MenuTrigger>
          <Text style={styles.menuTrigger}>&#8942;</Text>
        </MenuTrigger>
        <MenuOptions style={styles.menuOptions}>
          <MenuOption style={styles.menuOption} onSelect={(value) => alert(`User selected the number 1`)}>
            <Text style={styles.menuOptionText}>Clear rating</Text>
          </MenuOption>
          <MenuOption style={styles.menuOption} onSelect={(value) => alert(`User selected the number 2`)}>
            <Text style={styles.menuOptionText}>Delete song</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }
}
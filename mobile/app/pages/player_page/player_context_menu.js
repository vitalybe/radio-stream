import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlayerContextMenu");

import React, {Component} from 'react';
import {Image, StyleSheet, Text, View,} from 'react-native';

import {Menu, MenuOptions, MenuOption, MenuTrigger} from '../../shared_components/context_menu/context_menu';
import {colors} from '../../styles/styles'

const styles = StyleSheet.create({
  menuTrigger: {
    paddingRight: 20,
    paddingLeft: 0,
    backgroundColor: "pink",
    fontSize: 20,
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
      <Menu style={{position: "absolute", right: 0}}>
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
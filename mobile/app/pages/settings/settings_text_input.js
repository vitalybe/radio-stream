import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SettingsTextInput");

import React, {Component, PropTypes} from 'react';
import {Image, StyleSheet, Text, View, TextInput} from 'react-native';

import NormalText from '../../shared_components/text/normal_text'
import {colors} from "../../styles/styles";

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
  },
  
  input: {
    height: 50,
    
    color: colors.SEMI_WHITE,
    backgroundColor: colors.CYAN_DARK_CLEARER,
    
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
    
    padding: 10,
    marginBottom: 25,
  },
  
  
});

export default class SettingsTextInput extends Component {
  render() {
    
    return (
      <View>
        <NormalText style={[styles.label]}>{this.props.label}</NormalText>
        <TextInput style={[styles.input]} value={this.props.value} onChangeText={this.props.onChangeText}
                   secureTextEntry={this.props.secureTextEntry} />
      </View>
    );
  }
}

SettingsTextInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  
  secureTextEntry: PropTypes.bool,
};
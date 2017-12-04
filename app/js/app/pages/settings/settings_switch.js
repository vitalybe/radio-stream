import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SettingsSwitch");

import React, { Component, PropTypes } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";
import Switch from "react-native-material-switch";

import { colors } from "app/styles/styles";
import NormalText from "app/shared_components/text/normal_text";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});

@observer
export default class SettingsSwitch extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Switch
          thumbTintColor={colors.CYAN_BRIGHT}
          tintColor={colors.CYAN_DARKEST}
          onTintColor={colors.CYAN_DARK}
          active={this.props.value}
          onChangeState={this.props.onValueChange}
          enableSlideDragging={false}
        />
        <NormalText>{this.props.label}</NormalText>
      </View>
    );
  }
}

SettingsSwitch.propTypes = {
  label: PropTypes.string,
  value: PropTypes.bool.isRequired,
  onValueChange: PropTypes.func,
};

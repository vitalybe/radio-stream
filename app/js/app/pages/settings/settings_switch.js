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
    alignItems: "center",
  },
  label: {
    marginLeft: 10,
  },
});

const enabledColors = {
  background: colors.CYAN_BRIGHT,
  inactiveButton: colors.SEMI_WHITE,
  activeButton: colors.CYAN_BRIGHT,
  text: colors.SEMI_WHITE,
};

const disabledColors = {
  background: colors.CYAN_DARKEST,
  inactiveButton: colors.CYAN_DARKEST,
  activeButton: colors.CYAN_DARKEST,
  text: colors.CYAN_DARKEST,
};

@observer
export default class SettingsSwitch extends Component {
  render() {
    let switchColors = this.props.isDisabled ? disabledColors : enabledColors;

    return (
      <View style={[styles.container, this.props.style]}>
        <Switch
          inactiveButtonColor={switchColors.inactiveButton}
          activeButtonColor={switchColors.activeButton}
          inactiveBackgroundColor={switchColors.background}
          activeBackgroundColor={switchColors.background}
          active={this.props.value}
          onChangeState={this.props.onValueChange}
          enableSlideDragging={false}
          enableSlide={!this.props.isDisabled}
        />
        <NormalText style={[styles.label, { color: switchColors.text }]}>{this.props.label}</NormalText>
      </View>
    );
  }
}

SettingsSwitch.propTypes = {
  label: PropTypes.string,
  value: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  onValueChange: PropTypes.func,
};

import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SettingsSwitchGroup");

import React, { Component, PropTypes } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";
import Switch from "react-native-material-switch";

import { colors } from "app/styles/styles";
import NormalText from "app/shared_components/text/normal_text";

const styles = StyleSheet.create({
  container: {},
});

@observer
export default class SettingsSwitchGroup extends Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {this.props.children.map((child, i) =>
          React.cloneElement(child, { isDisabled: this.props.isDisabled, key: i })
        )}
      </View>
    );
  }
}

SettingsSwitchGroup.propTypes = {
  isDisabled: PropTypes.bool,
};

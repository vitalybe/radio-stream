import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SettingsPagePlatformSpecific");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({});

export default class SettingsPagePlatformSpecific extends Component {
  render() {
    return <View style={{ backgroundColor: "red", height: 100, width: 100 }} />;
  }
}

SettingsPagePlatformSpecific.propTypes = {};

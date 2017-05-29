import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("SettingsPagePlatformSpecific");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import keycode from "keycode";
import _ from "lodash";

import SettingsTextInput from "./settings_text_input";

const styles = StyleSheet.create({});

export default class SettingsPagePlatformSpecific extends Component {
  componentWillMount() {
    this._modifierKeys = [
      keycode("left command"),
      keycode("right command"),
      keycode("shift"),
      keycode("ctrl"),
      keycode("alt"),
    ];

    this.state = { playPauseKey: "" };
  }

  keyboardEventToString(keyboardEvent) {
    let logger = loggerCreator(this.keyboardEventToString.name, moduleLogger);
    logger.info(`start`);

    let name = keycode(keyboardEvent);
    let code = keyboardEvent.keyCode;
    let ctrl = keyboardEvent.ctrlKey;
    let shift = keyboardEvent.shiftKey;
    let alt = keyboardEvent.altKey;
    let meta = keyboardEvent.metaKey;

    logger.info(`[${name}] code: ${code}. ctrl: ${ctrl}. shift: ${shift}. alt: ${alt}. meta: ${meta}`);

    let keyParts = [];
    if (this._modifierKeys.indexOf(code) === -1 && name) {
      if (ctrl) keyParts.push("Ctrl");
      if (shift) keyParts.push("Shift");
      if (alt) keyParts.push("Alt");
      if (meta) keyParts.push("Cmd");

      if (name.match(/[\w]/)) {
        name = _.startCase(name).split(" ").join("");
      }
      keyParts.push(name);

      let key = keyParts.join("+");

      logger.info(`accelerator: ${key}`);
      return key;
    } else {
      logger.info(`modifier key`);
      return "";
    }
  }

  render() {
    return (
      <View>
        <SettingsTextInput
          textInputProps={{
            onKeyDown: event => this.setState({ ...this.state, playPauseKey: this.keyboardEventToString(event) }),
          }}
          label="Play/Pause shortcut"
          value={this.state.playPauseKey}
        />
      </View>
    );
  }
}

SettingsPagePlatformSpecific.propTypes = {};

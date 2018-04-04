import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("SettingsPageNative");

import React, { Component, PropTypes } from "react";
import { Image, StyleSheet, Text, View, TextInput } from "react-native";
import keycode from "keycode";
import _ from "lodash";
import { observable, extendObservable } from "mobx";
import { observer } from "mobx-react";
import settingsNative from "app/utils/settings/settings_native";

import SettingsTextInput from "./settings_text_input";
const styles = StyleSheet.create({});

@observer
export default class SettingsPageNative extends Component {
  componentWillMount() {
    const logger = loggerCreator("componentWillMount", moduleLogger);

    this._modifierKeys = [
      keycode("left command"),
      keycode("right command"),
      keycode("shift"),
      keycode("ctrl"),
      keycode("alt"),
    ];

    logger.info(`playPauseKey: ${settingsNative.playPauseKey}`);
    extendObservable(this.props.settingsValuesNative, {
      playPauseKey: settingsNative.playPauseKey,
    });
  }

  onPlayPauseKeyDown(event) {
    let logger = loggerCreator("onPlayPauseKeyDown", moduleLogger);
    let keyboardEvent = this.keyboardEventToString(event);
    logger.info(`keyboardEvent: ${keyboardEvent}`);
    this.props.settingsValuesNative.playPauseKey = keyboardEvent;
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
        name = _.startCase(name)
          .split(" ")
          .join("");
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
          textInputProps={{ onKeyDownCapture: event => this.onPlayPauseKeyDown(event) }}
          label="Play/Pause shortcut"
          value={this.props.settingsValuesNative.playPauseKey}
        />
      </View>
    );
  }
}

SettingsPageNative.propTypes = {
  settingsValuesNative: PropTypes.object.isRequired,
};

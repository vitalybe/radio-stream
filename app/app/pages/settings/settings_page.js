import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("settings_page");

import React, { Component } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import BackHandler from "app/utils/back_handler/back_handler";
import mobx from "mobx";
import { observer } from "mobx-react";

import Button from "app/shared_components/rectangle_button";
import NormalText from "app/shared_components/text/normal_text";
import ButtonText from "app/shared_components/text/button_text";
import SettingsPageNative from "./settings_page_native";
import settings from "app/utils/settings/settings";
import settingsNative from "app/utils/settings/settings_native";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";
import { navigator } from "app/stores/navigator.js";
import SettingsTextInput from "./settings_text_input";
import { playlistsStore } from "app/stores/playlists_store";
import { masterStore } from "app/stores/master_store";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: 250,
    height: null,
    alignSelf: "center",

    marginVertical: 20,
  },
  submit: {
    alignSelf: "flex-start",
    marginTop: 20,
  },

  saveButton: {
    marginTop: 10,
  },
});

@observer
export default class SettingsPage extends Component {
  constructor(props) {
    super(props);

    let logger = loggerCreator("constructor", moduleLogger);

    this.settingsValues = mobx.observable({
      host: settings.host,
      password: settings.password,

      status: null,
    });

    this.settingsValuesNative = mobx.asMap();
  }

  onTextChange(label, text) {
    let logger = loggerCreator("onTextChange", moduleLogger);
    logger.info(`changing ${label}`);

    this.settingsValues[label] = text;
  }

  async onSavePress() {
    let logger = loggerCreator("onSavePress", moduleLogger);

    let host = this.settingsValues.host;
    let password = this.settingsValues.password;

    try {
      this.settingsValues.message = "Connecting with the given host/password...";
      await backendMetadataApi.testConnection(host, password);
      this.settingsValues.message = "Connected";

      logger.info(`updating global settings`);

      settings.host = host;
      settings.password = password;
      logger.info(`saving settings`);
      await settings.save();
      await settingsNative.save(this.settingsValuesNative.toJS());

      logger.info(`upadting playlists`);
      await playlistsStore.updatePlaylists();

      masterStore.closeSidebars();
      masterStore.isNavigationSidebarOpen = true;

      navigator.navigateToPlayer();
    } catch (error) {
      this.settingsValues.message = `Failed: ${error}`;
    }
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

    return (
      <View style={styles.container}>
        <SettingsTextInput
          label="Host"
          value={this.settingsValues.host}
          onChangeText={text => this.onTextChange("host", text)}
        />
        <SettingsTextInput
          label="Password"
          value={this.settingsValues.password}
          textInputProps={{ secureTextEntry: true }}
          onChangeText={text => this.onTextChange("password", text)}
        />

        <SettingsPageNative settingsValuesNative={this.settingsValuesNative} />

        <Button style={[styles.saveButton]} onPress={() => this.onSavePress()}>
          <ButtonText>Save</ButtonText>
        </Button>
        <NormalText style={[styles.message]}>
          {this.settingsValues.message}
        </NormalText>
      </View>
    );
  }
}

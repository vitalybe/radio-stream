import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("settings_page");

import React, { Component } from "react";
import { StyleSheet, View, Switch } from "react-native";
import mobx, { observable } from "mobx";
import { observer } from "mobx-react";

import Button from "app/shared_components/rectangle_button";
import NormalText from "app/shared_components/text/normal_text";
import ButtonText from "app/shared_components/text/button_text";
import SettingsPageNative from "./settings_page_native";
import settings from "app/utils/settings/settings";
import settingsNative from "app/utils/settings/settings_native";
import { backendMetadataApiGetter } from "app/utils/backend_metadata_api/backend_metadata_api_getter";
import { navigator } from "app/stores/navigator.js";
import SettingsTextInput from "./settings_text_input";
import { playlistsStore } from "app/stores/playlists_store";
import { masterStore } from "app/stores/master_store";
import SettingsSwitch from "app/pages/settings/settings_switch";
import SettingsSwitchGroup from "app/pages/settings/settings_switch_group";

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
    marginTop: 20,
  },
  mockSwitch: {
    marginTop: 20,
  },
  mockSwitchGroup: {
    marginLeft: 20,
  },
});

@observer
export default class SettingsPage extends Component {
  @observable saveMessage = "";

  settingsValues = observable({
    host: null,
    password: null,

    isMock: null,
    isMockStartPlaying: null,
    isMockStartSettings: null,
  });

  settingsValuesNative = observable({});

  componentWillMount() {
    const logger = loggerCreator("componentWillMount", moduleLogger);

    Object.keys(settings.values).forEach(key => {
      if (key in this.settingsValues) {
        logger.info(`settings: ${key} = ${settings.values[key]}`);
        this.settingsValues[key] = settings.values[key];
      }
    });
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
      this.saveMessage = "Connecting with the given host/password...";
      await backendMetadataApiGetter.get().testConnection(host, password);
      this.saveMessage = "Connected";

      logger.info(`saving settings`);
      await settings.save(mobx.toJS(this.settingsValues));
      await settingsNative.save(mobx.toJS(this.settingsValuesNative));

      logger.info(`upadting playlists`);
      await playlistsStore.updatePlaylists();

      masterStore.closeSidebars();
      masterStore.isNavigationSidebarOpen = true;

      navigator.navigateToPlayer();
    } catch (error) {
      this.saveMessage = `Failed: ${error}`;
    }
  }

  render() {
    loggerCreator(this.render.name, moduleLogger);

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

        <SettingsSwitch
          label={"Mock mode"}
          value={this.settingsValues.isMock || false}
          onValueChange={value => (this.settingsValues.isMock = value)}
        />
        <SettingsSwitchGroup style={styles.mockSwitchGroup} isDisabled={!this.settingsValues.isMock}>
          <SettingsSwitch
            label={"Play on startup"}
            value={this.settingsValues.isMockStartPlaying || false}
            onValueChange={value => (this.settingsValues.isMockStartPlaying = value)}
          />
          <SettingsSwitch
            label={"Settings on startup"}
            value={this.settingsValues.isMockStartSettings || false}
            onValueChange={value => (this.settingsValues.isMockStartSettings = value)}
          />
        </SettingsSwitchGroup>

        <Button style={[styles.saveButton]} onPress={() => this.onSavePress()}>
          <ButtonText>Save</ButtonText>
        </Button>
        <NormalText style={[styles.message]}>{this.saveMessage}</NormalText>
      </View>
    );
  }
}

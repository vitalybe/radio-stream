import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("settings_page");

import React, {Component} from 'react';
import {StyleSheet, View, TextInput} from 'react-native';
import BackHandler from '../../utils/back_handler/back_handler'
import {observable} from "mobx";
import {observer} from "mobx-react"

import {colors, fontSizes} from '../../styles/styles'
import Button from '../../shared_components/rectangle_button'
import NormalText from '../../shared_components/text/normal_text'
import ButtonText from '../../shared_components/text/button_text'
import SettingsPagePlatformSpecific from './settings_page_platform_specific';
import {globalSettings} from '../../utils/settings'
import backendMetadataApi from '../../utils/backend_metadata_api'
import navigator from '../../stores/navigator/navigator'
import SettingsTextInput from './settings_text_input'

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
  }
});

@observer
export default class SettingsPage extends Component {

  constructor(props) {
    super(props);

    let logger = loggerCreator("constructor", moduleLogger);

    this.store = observable({
      host: globalSettings.host,
      password: globalSettings.password,

      status: null,
    });

    BackHandler.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());
  }

  onPressHardwareBack() {
    let logger = loggerCreator("onPressHardwareBack", moduleLogger);

    if (globalSettings.host) {
      logger.info(`cancelling setting changes`);
      navigator.navigateToPlaylistCollection();
    } else {
      logger.info(`no host was configured - quitting`);
      BackHandler.exitApp();

    }

    return true;
  }

  onTextChange(label, text) {
    let logger = loggerCreator("onTextChange", moduleLogger);
    logger.info(`changing ${label}`);

    this.store[label] = text;
  }

  onSavePress() {
    let logger = loggerCreator("onSavePress", moduleLogger);

    let host = this.store.host;
    let password = this.store.password;

    this.store.status = "Connecting...";
    backendMetadataApi.testConnection(host, password)
      .then(() => {
        this.store.status = "Connected";

        logger.info(`updating global settings`);

        globalSettings.update(host, password);
        return globalSettings.save().then(() => {
          navigator.navigateToPlaylistCollection();
        });
      })
      .catch(error => {
        this.store.status = `Failed: ${error}`;
      })
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

    return (
      <View style={styles.container}>
        <SettingsTextInput label="Host" value={this.store.host} onChangeText={text => this.onTextChange("host", text)}/>
        <SettingsTextInput label="Password" value={this.store.password} secureTextEntry={true}
                           onChangeText={text => this.onTextChange("password", text)}/>

        <SettingsPagePlatformSpecific />
        
        <Button style={[styles.saveButton]} onPress={() => this.onSavePress()}>
          <ButtonText>Save</ButtonText>
        </Button>
        <NormalText style={[styles.status]}>{this.store.status}</NormalText>
      </View>
    );
  }
}
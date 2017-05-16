import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("settings_page");

import React, {Component} from 'react';
import {StyleSheet, View, TextInput} from 'react-native';
import BackHandler from '../utils/back_handler/back_handler'
import {observable} from "mobx";
import {observer} from "mobx-react"

import {colors, fontSizes} from '../styles/styles'
import Button from '../components/rectangle_button'
import Text from '../components/text'
import Navigator from '../stores/navigator'
import {globalSettings} from '../utils/settings'
import backendMetadataApi from '../utils/backend_metadata_api'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: 250,
    height: null,
    alignSelf: "center",

    marginVertical: 20,
  },

  label: {
    fontSize: fontSizes.NORMAL,
    marginBottom: 10,
  },

  input: {
    height: 50,

    color: colors.SEMI_WHITE.rgbString(),
    backgroundColor: colors.CYAN_DARK.clone().clearer(0.5).rgbString(),

    borderColor: colors.CYAN_BRIGHT.rgbString(),
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,

    marginBottom: 25,
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
      this.props.navigator.navigateToPlaylistCollection();
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
          this.props.navigator.navigateToPlaylistCollection();
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
        <Text style={[styles.label]}>Host</Text>
        <TextInput style={[styles.input]} value={this.store.host}
                   onChangeText={text => this.onTextChange("host", text)}/>

        <Text style={[styles.label]}>Password</Text>
        <TextInput style={[styles.input]} value={this.store.password} secureTextEntry={true}
                   onChangeText={text => this.onTextChange("password", text)}/>

        <Button style={[styles.saveButton]} onPress={() => this.onSavePress()}>
          <Text>Save</Text>
        </Button>
        <Text style={[styles.status]}>{this.store.status}</Text>
      </View>
    );
  }
}

SettingsPage.propTypes = {
  navigator: React.PropTypes.instanceOf(Navigator).isRequired
};
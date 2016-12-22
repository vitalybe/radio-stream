import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("settings_page");

import React, {Component} from 'react';
import {StyleSheet, View, BackAndroid, TextInput} from 'react-native';

import {colors, fontSizes} from '../styles/styles'
import Button from '../components/rectangle_button'
import Text from '../components/text'
import Navigator from '../stores/navigator'
import {globalSettings} from '../utils/settings'

export default class SettingsPage extends Component {

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.state = {
      host: globalSettings.host,
      password: globalSettings.password
    };

    BackAndroid.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());
  }

  onPressHardwareBack() {
    let logger = loggerCreator("onPressHardwareBack", moduleLogger);
    logger.info(`start`);

    // BackAndroid.exitApp();
    // return true;
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`start`);

    return (
      <View style={styles.container}>
        <Text style={[styles.label]}>Host</Text>
        <TextInput style={[styles.input]}/>

        <Text style={[styles.label]}>Password</Text>
        <TextInput style={[styles.input]}/>

        <Button style={[styles.submit]}><Text>Save</Text></Button>
        <Text style={[styles.status]}>Connecting...</Text>
      </View>
    );
  }
}

SettingsPage.propTypes = {
  navigator: React.PropTypes.instanceOf(Navigator).isRequired
};

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

  status: {
    marginTop: 10,
  }
});
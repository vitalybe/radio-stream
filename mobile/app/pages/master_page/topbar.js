import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Topbar");

import React, { Component } from "react";
import { Image, StyleSheet, TouchableHighlight, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "../../shared_components/text/normal_text";

import dimensionsStore from "app/stores/dimensions_store";
import masterStore from "app/stores/master_store";
import hamburgerImage from "app/images/hamburger.png";

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    margin: 10,
  },
  topBarLeft: {
    flex: 0.2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "green",
  },
  topBarRight: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "red",
  },
  hamburgerImage: { height: 34, width: 34 },
  hamburgerContainer: {},
});

@observer
export default class Topbar extends Component {
  onHamburgerClick = () => {
    let logger = loggerCreator("onHamburgerClick", moduleLogger);

    masterStore.isNavigationSidebarOpen = !masterStore.isNavigationSidebarOpen;
    logger.info(`navigation sidebar should be now open? ${masterStore.isNavigationSidebarOpen}`);
  };

  render() {
    return (
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableHighlight onPress={this.onHamburgerClick} style={styles.hamburgerContainer}>
            <Image source={hamburgerImage} style={styles.hamburgerImage} />
          </TouchableHighlight>
          {dimensionsStore.isBigWidth ? <NormalText style={{ flex: 1 }}>Player</NormalText> : null}
        </View>
        <View style={styles.topBarRight}>
          <NormalText>Player</NormalText>
        </View>
      </View>
    );
  }
}

Topbar.propTypes = {};

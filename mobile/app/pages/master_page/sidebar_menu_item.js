import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SidebarMenuItem");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "../../shared_components/text/normal_text";
import { colors } from "../../styles/styles";

const styles = StyleSheet.create({
  itemContainer: { flexDirection: "row", height: 45, alignItems: "center" },
  itemText: { marginLeft: 5, color: colors.CYAN_BRIGHT },

  leftImage: { flex: 1 },
  leftImageContainer: { marginLeft: 10, height: 25, width: 25 },

  rightImage: { flex: 1 },
  rightImageContainer: { marginLeft: "auto", marginRight: 10, height: 25, width: 25 },
});

@observer
export default class SidebarMenuItem extends Component {
  render() {
    let itemContainerBackground = "transparent";
    if (this.props.isActive) {
      itemContainerBackground = colors.CONTAINER_BACKGROUND_ACTIVE;
    }

    return (
      <View style={[styles.itemContainer, { backgroundColor: itemContainerBackground }]}>
        <View style={styles.leftImageContainer}>
          <Image source={this.props.leftImage} resizeMode="contain" style={styles.leftImage} />
        </View>
        <NormalText style={styles.itemText}>
          {this.props.text}
        </NormalText>
        <View style={styles.rightImageContainer}>
          <Image source={this.props.rightImage} resizeMode="contain" style={styles.rightImage} />
        </View>
      </View>
    );
  }
}

SidebarMenuItem.propTypes = {
  text: React.PropTypes.string.isRequired,
  leftImage: React.PropTypes.any.isRequired,
  rightImage: React.PropTypes.any,

  isActive: React.PropTypes.bool,
};

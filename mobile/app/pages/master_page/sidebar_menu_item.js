import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SidebarMenuItem");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "../../shared_components/text/normal_text";
import { colors } from "../../styles/styles";

const styles = StyleSheet.create({
  itemContainer: { flexDirection: "row", height: 51, alignItems: "center" },
  image: { flex: 1 },
  imageContainer: { marginLeft: 10, height: 25, width: 25 },
  itemText: { marginLeft: 10, color: colors.CYAN_BRIGHT },
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
        <View style={styles.imageContainer}>
          <Image source={this.props.image} resizeMode="contain" style={styles.image} />
        </View>
        <NormalText style={styles.itemText}>
          {this.props.text}
        </NormalText>
      </View>
    );
  }
}

SidebarMenuItem.propTypes = {
  text: React.PropTypes.string.isRequired,
  image: React.PropTypes.number.isRequired,

  isActive: React.PropTypes.bool,
};

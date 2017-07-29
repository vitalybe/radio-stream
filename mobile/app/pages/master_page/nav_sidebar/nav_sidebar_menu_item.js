import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("NavSidebarMenuItem");

import React, { Component } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "app/shared_components/text/normal_text";
import { colors } from "app/styles/styles";
import HoverableOpacity from "app/utils/hoverable_opacity";

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    height: 45,
    alignItems: "center",
    paddingLeft: 10,
  },
  itemText: { marginLeft: 5, color: colors.CYAN_BRIGHT },

  leftImage: { height: 25, width: 25, resizeMode: "contain" },
  leftImageContainer: {},

  rightImage: { flex: 1 },
  rightImageContainer: { marginLeft: "auto", marginRight: 10, height: 45, width: 45, padding: 10 },
});

@observer
export default class NavSidebarMenuItem extends Component {
  render() {
    let itemContainerBackground = "transparent";
    if (this.props.isActive) {
      itemContainerBackground = colors.CONTAINER_BACKGROUND_ACTIVE;
    }

    return (
      <HoverableOpacity
        activeOpacity={0.5}
        style={[styles.itemContainer, { backgroundColor: itemContainerBackground }]}
        hoverStyle={{ backgroundColor: colors.CONTAINER_BACKGROUND_HOVER }}
        onPress={this.props.onPress}>
        <Image source={this.props.leftImage} style={styles.leftImage} />
        <NormalText style={styles.itemText}>
          {this.props.text}
        </NormalText>
        {this.props.rightImage
          ? <HoverableOpacity
              style={styles.rightImageContainer}
              activeOpacity={0.5}
              hoverStyle={{ backgroundColor: colors.CONTAINER_BACKGROUND_HOVER }}>
              <Image source={this.props.rightImage} resizeMode="contain" style={styles.rightImage} />
            </HoverableOpacity>
          : null}
      </HoverableOpacity>
    );
  }
}

NavSidebarMenuItem.propTypes = {
  text: React.PropTypes.string.isRequired,
  leftImage: React.PropTypes.any.isRequired,
  rightImage: React.PropTypes.any,
  isActive: React.PropTypes.bool,

  onPress: React.PropTypes.func,
};

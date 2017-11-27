import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View } from "react-native";

import Swiper from "react-native-swiper";
import { colors } from "app/styles/styles";

var styles = StyleSheet.create({
  wrapper: { flex: 1, marginTop: 10 },
  dotStyle: { borderColor: colors.CYAN_BRIGHT, borderWidth: 1 },
  dotStyleActive: { backgroundColor: colors.CYAN_BRIGHT },
  paginationStyle: { top: 0, bottom: null },
});

export default class ContentSwiper extends Component {
  render() {
    return (
      <Swiper
        style={styles.wrapper}
        dotStyle={styles.dotStyle}
        activeDotStyle={StyleSheet.flatten([styles.dotStyle, styles.dotStyleActive])}
        paginationStyle={styles.paginationStyle}>
        {this.props.children}
      </Swiper>
    );
  }
}

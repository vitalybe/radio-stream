import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View } from "react-native";

import Swiper from "react-native-swiper";

var styles = StyleSheet.create({
  wrapper: { flex: 1, width: 300, height: 300 },
});

export default class ContentSwiper extends Component {
  render() {
    return <Swiper style={styles.wrapper}>{this.props.children}</Swiper>;
  }
}

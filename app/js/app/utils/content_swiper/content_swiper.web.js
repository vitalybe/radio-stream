import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View } from "react-native";

import Swiper from "react-id-swiper";
import "react-id-swiper/src/styles/css/swiper.css";
import "app/utils/content_swiper/content-swiper.css";

var styles = StyleSheet.create({
  wrapper: { flex: 1, width: 300, height: 300 },
});

export default class ContentSwiper extends Component {
  render() {
    return (
      <Swiper style={styles.wrapper} containerClass="content-swiper-container" showsButtons={true}>
        {this.props.children}
      </Swiper>
    );
  }
}

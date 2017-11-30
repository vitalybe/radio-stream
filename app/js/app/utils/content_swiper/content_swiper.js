import React, { Component } from "react";
import { StyleSheet } from "react-native";

import Swiper from "react-id-swiper";
import "react-id-swiper/src/styles/css/swiper.css";
import "app/utils/content_swiper/content-swiper.css";
import { masterStore } from "app/stores/master_store";

const styles = StyleSheet.create({
  wrapper: { flex: 1, width: 300, height: 300 },
});

// noinspection JSUnusedGlobalSymbols
export default class ContentSwiper extends Component {
  // NOTE: Must be non-arrow-function since "this" is the Swiper object
  onSlideChange() {
    masterStore.activeSlideIndex = this.activeIndex;
  }

  render() {
    return (
      <Swiper
        style={styles.wrapper}
        pagination={{
          el: ".swiper-pagination",
          type: "bullets",
          clickable: true,
        }}
        containerClass="content-swiper-container"
        showsButtons={true}
        on={{ slideChange: this.onSlideChange }}>
        {this.props.children}
      </Swiper>
    );
  }
}

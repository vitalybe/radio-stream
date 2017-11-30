import React, { Component } from "react";
import { StyleSheet, View } from "react-native";

import Swiper from "react-id-swiper";
import "react-id-swiper/src/styles/css/swiper.css";
import "app/utils/content_swiper/content-swiper.css";

const styles = StyleSheet.create({
  wrapper: { flex: 1, width: 300, height: 300 },
});

// noinspection JSUnusedGlobalSymbols
export default class ContentSwiper extends Component {
  componentWillMount() {
    this.state = {
      activeSlideIndex: 0,
    };
  }

  onSlideChange = swiper => {
    this.setState({ activeSlideIndex: swiper.activeIndex });
  };

  render() {
    let that = this;

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
        on={{
          slideChange: function() {
            that.onSlideChange(this);
          },
        }}>
        {this.props.children.map((child, i) => {
          return (
            <View key={i}>
              {React.cloneElement(child, { slideNumber: i, activeSlideIndex: this.state.activeSlideIndex })}
            </View>
          );
        })}
      </Swiper>
    );
  }
}

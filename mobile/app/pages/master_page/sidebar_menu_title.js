import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SidebarMenuTitle");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import BigText from "../../shared_components/text/big_text";

const styles = StyleSheet.create({
  text: {
    marginLeft: 10,
    marginTop: 10,
  },
});

@observer
export default class SidebarMenuTitle extends Component {
  render() {
    return (
      <BigText style={[styles.text]}>
        {this.props.text}
      </BigText>
    );
  }
}

SidebarMenuTitle.propTypes = {
  text: React.PropTypes.string.isRequired,
};

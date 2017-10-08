import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("NavSidebarMenuTitle");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import BigText from "app/shared_components/text/big_text";

const styles = StyleSheet.create({
  text: {
    marginLeft: 10,
    marginTop: 10,
  },
});

@observer
export default class NavSidebarMenuTitle extends Component {
  render() {
    return (
      <BigText style={[styles.text]}>
        {this.props.text}
      </BigText>
    );
  }
}

NavSidebarMenuTitle.propTypes = {
  text: React.PropTypes.string.isRequired,
};

import { Dimensions } from "react-native";

const BIG_WIDTH = 500;

class DeviceSize {
  isBigWidth() {
    return Dimensions.get("window").width > BIG_WIDTH;
  }
}

const deviceSize = new DeviceSize();
export default deviceSize;

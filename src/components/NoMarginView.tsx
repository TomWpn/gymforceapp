import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import globalStyles from "../styles/globalStyles";

interface NoMarginViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const NoMarginView: React.FC<NoMarginViewProps> = ({ style, children }) => (
  <View
    style={[
      globalStyles.noMargin,
      style,
      { marginVertical: 0, marginHorizontal: 0 },
    ]}
  >
    {children}
  </View>
);

export default NoMarginView;

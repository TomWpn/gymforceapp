import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import NoMarginView from "./NoMarginView";

interface SpacerProps {
  size?: number; // size in pixels, e.g., 8, 16, 24
  vertical?: boolean; // applies vertical margin/padding
  horizontal?: boolean; // applies horizontal margin/padding
  padding?: boolean; // applies padding instead of margin
}

const Spacer: React.FC<SpacerProps> = ({
  size = 16,
  vertical,
  horizontal,
  padding = false,
}) => {
  const style: StyleProp<ViewStyle> = padding
    ? {
        paddingVertical: vertical ? size : 0,
        paddingHorizontal: horizontal ? size : 0,
      }
    : {
        marginVertical: vertical ? size : 0,
        marginHorizontal: horizontal ? size : 0,
      };

  return <NoMarginView style={style} />;
};

export default Spacer;

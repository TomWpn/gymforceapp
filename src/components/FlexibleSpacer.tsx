import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import NoMarginView from "./NoMarginView";

interface FlexibleSpacerProps {
  size?: number;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  padding?: boolean;
}

const FlexibleSpacer: React.FC<FlexibleSpacerProps> = ({
  size = 16,
  top,
  bottom,
  left,
  right,
  padding = false,
}) => {
  const isVertical = top || bottom;
  const isHorizontal = left || right;

  const style: StyleProp<ViewStyle> = {
    marginTop: top && !padding ? size : undefined,
    marginBottom: bottom && !padding ? size : undefined,
    marginLeft: left && !padding ? size : undefined,
    marginRight: right && !padding ? size : undefined,
    paddingTop: top && padding ? size : undefined,
    paddingBottom: bottom && padding ? size : undefined,
    paddingLeft: left && padding ? size : undefined,
    paddingRight: right && padding ? size : undefined,
    // Ensure visible space by setting width/height if only margin or padding
    height: isVertical && !isHorizontal ? size : "100%",
    width: isHorizontal && !isVertical ? size : "100%",
  };

  return <NoMarginView style={style} />;
};

export default FlexibleSpacer;

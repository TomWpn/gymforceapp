import React from "react";
import { View, StyleProp, ViewStyle, StyleSheet } from "react-native";

interface GridItemProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
}

const GridItem: React.FC<GridItemProps> = ({
  children,
  style,
  alignItems = "center", // Default to center
  justifyContent = "center", // Default to center
}) => (
  <View
    style={[styles.gridItem, style, { alignItems, justifyContent, flex: 1 }]}
  >
    {children}
  </NoMarginView >
);

const styles = StyleSheet.create({
  gridItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
});

export default GridItem;

import React from "react";
import { View, StyleProp, ViewStyle, StyleSheet } from "react-native";
import NoMarginView from "./NoMarginView";

interface AlignCenterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AlignCenter: React.FC<AlignCenterProps> = ({ children, style }) => (
  <NoMarginView style={[styles.center, style]}>{children}</NoMarginView>
);

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AlignCenter;

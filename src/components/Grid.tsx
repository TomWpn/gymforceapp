import React from "react";
import { View, StyleSheet } from "react-native";
import NoMarginView from "./NoMarginView";

interface GridProps {
  children: React.ReactNode;
  spacing?: number;
  numColumns?: number;
}

const Grid: React.FC<GridProps> = ({
  children,
  spacing = 8,
  numColumns = 2,
}) => (
  <NoMarginView style={[styles.grid, { marginHorizontal: -spacing / 2 }]}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child as React.ReactElement<any>, {
        style: [
          { margin: spacing / 2, flex: 1 },
          (child as React.ReactElement<any>).props.style,
        ],
      })
    )}
  </NoMarginView>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
});

export default Grid;

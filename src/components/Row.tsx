import React from "react";
import { View, StyleSheet } from "react-native";
import NoMarginView from "./NoMarginView";

interface RowProps {
  children: React.ReactNode;
  spacing?: number;
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
}

const Row: React.FC<RowProps> = ({
  children,
  spacing = 8,
  alignItems = "center",
  justifyContent = "center",
}) => {
  return (
    <NoMarginView
      style={[
        styles.row,
        { marginHorizontal: -spacing / 2, alignItems, justifyContent },
      ]}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          style: [
            { marginHorizontal: spacing / 2, flex: 1 },
            (child as React.ReactElement<any>).props.style,
          ],
        })
      )}
    </NoMarginView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%", // Ensures each row takes up the full width of the container
  },
});

export default Row;

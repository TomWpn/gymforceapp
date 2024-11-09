import React from "react";
import {
  Pressable,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from "react-native";

interface GymForceButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  size?: "small" | "large";
  disabled?: boolean;
  width?: DimensionValue | "auto"; // Use `auto` or a specific number width
  fullWidth?: boolean; // New prop to handle full width using `flex: 1`
}

const GymForceButton: React.FC<GymForceButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size,
  disabled = false,
  width = "auto", // Default to auto
  fullWidth = false, // Default to false, only set to true when you want full width
}) => {
  const backgroundColor =
    variant === "primary"
      ? "#1a265a"
      : variant === "secondary"
      ? "#f1600d"
      : "transparent";
  const fontSize = size === "large" ? 18 : 14;
  const paddingVertical = size === "large" ? 18 : 12;
  const paddingHorizontal = size === "large" ? 18 : 12;
  const borderStyle = variant === "tertiary" ? "solid" : undefined;
  const borderColor = variant === "tertiary" ? "black" : undefined;
  const borderWidth = variant === "tertiary" ? 1 : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor,
        borderRadius: 4,
        paddingVertical,
        paddingHorizontal,
        minWidth: 100,
        width: fullWidth ? undefined : width, // Use flex if fullWidth is true
        flex: fullWidth ? 1 : undefined, // Full width if fullWidth is true
        borderStyle,
        borderColor,
        borderWidth,
        alignSelf: fullWidth ? "stretch" : "center", // Center or stretch based on fullWidth
        ...(disabled ? { opacity: 0.5 } : {}),
      }}
    >
      <Text
        style={{
          color: variant === "tertiary" ? "black" : "white",
          fontSize,
          fontFamily: "Gymforce",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default GymForceButton;

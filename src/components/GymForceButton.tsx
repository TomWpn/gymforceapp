// GymForceButton.tsx
import React from "react";
import { Pressable, DimensionValue } from "react-native";
import GymForceText from "./GymForceText";

interface GymForceButtonProps {
  title: string;
  onPress: any;
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "small" | "large";
  disabled?: boolean;
  width?: DimensionValue | "auto";
  fullWidth?: boolean;
}

const GymForceButton: React.FC<GymForceButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size,
  disabled = false,
  width = "auto",
  fullWidth = false,
}) => {
  const backgroundColor =
    variant === "primary"
      ? "#1a265a"
      : variant === "secondary"
      ? "#f1600d"
      : variant === "destructive"
      ? "#FF0000"
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
        width: fullWidth ? "100%" : width, // Use "100%" for fullWidth
        borderStyle,
        borderColor,
        borderWidth,
        alignSelf: fullWidth ? "stretch" : "center", // Stretch or center based on fullWidth
        ...(disabled ? { opacity: 0.5 } : {}),
      }}
    >
      <GymForceText
        style={{
          color: variant === "tertiary" ? "black" : "white",
          fontSize,
          fontFamily: "Gymforce",
          textAlign: "center",
        }}
      >
        {title}
      </GymForceText>
    </Pressable>
  );
};

export default GymForceButton;

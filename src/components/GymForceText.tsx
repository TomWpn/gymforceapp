// src/components/GymForceText.tsx
import React from "react";
import {
  Text,
  TextProps,
  StyleSheet,
  StyleProp,
  TextStyle,
} from "react-native";

type TextType = "Title" | "Tagline" | "Subtitle" | "Note";
type FontFamily = "Gymforce" | "OpenSansGymforce";
type TextAlign = "auto" | "left" | "right" | "center" | "justify";

interface GymForceTextProps extends TextProps {
  type?: TextType;
  fontFamily?: FontFamily;
  fontSize?: number; // Override font size
  textAlign?: TextAlign; // Text alignment
  lineHeight?: number; // Line height/spacing
  color?: string; // Text color
  style?: StyleProp<TextStyle>; // Additional style prop
}

const GymForceText: React.FC<GymForceTextProps> = ({
  children,
  type = "Subtitle",
  fontFamily = "Gymforce",
  fontSize,
  textAlign = "center",
  lineHeight,
  color,
  style,
  ...props
}) => {
  const getFontSize = () => {
    switch (type) {
      case "Title":
        return fontSize || 28;
      case "Tagline":
        return fontSize || 18;
      case "Subtitle":
        return fontSize || 16;
      case "Note":
        return fontSize || 12;
      default:
        return fontSize || 16;
    }
  };

  const getLineHeight = () => (lineHeight ? lineHeight : getFontSize() * 1.4); // Default line height multiplier

  return (
    <Text
      style={[
        styles.base,
        {
          fontFamily,
          fontSize: getFontSize(),
          textAlign,
          lineHeight: getLineHeight(),
          color: color || styles.base.color, // Use provided color or default
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: "#fff", // Default text color, can be overridden by color prop
  },
});

export default GymForceText;

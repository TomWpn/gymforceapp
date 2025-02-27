import React from "react";
import { View, StyleSheet } from "react-native";
import { useDynamicIcon } from "../hooks/useDynamicIcon";

interface CardWithIconBackgroundProps {
  iconLibrary:
    | "AntDesign"
    | "Entypo"
    | "EvilIcons"
    | "Feather"
    | "FontAwesome"
    | "FontAwesome5"
    | "FontAwesome6"
    | "Fontisto"
    | "Foundation"
    | "Ionicons"
    | "MaterialIcons"
    | "MaterialCommunityIcons"
    | "Octicons"
    | "Zocial"
    | "SimpleLineIcons";
  iconName: string;
  children: React.ReactNode;
}

const CardWithIconBackground: React.FC<CardWithIconBackgroundProps> = ({
  iconLibrary,
  iconName,
  children,
}) => {
  const IconComponent = useDynamicIcon(iconLibrary);
  if (!IconComponent) return null;

  return (
    <View style={styles.card}>
      <IconComponent name={iconName} style={styles.backgroundIcon} />
      {children}
    </View>
  );
};

export default CardWithIconBackground;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  backgroundIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    transform: [{ translateX: 10 }, { translateY: -20 }],
    fontSize: 200,
    color: "#f1600d",
    opacity: 0.1,
    zIndex: -1,
  },
});

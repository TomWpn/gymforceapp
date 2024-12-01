import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
  TextStyle,
} from "react-native";

interface GymForceCardProps {
  style?: StyleProp<ViewStyle>; // Custom styles for the card container
  title?: string; // Optional title for the card
  titleStyle?: StyleProp<TextStyle>; // Custom styles for the title
  children: React.ReactNode; // Content inside the card
}

const GymForceCard: React.FC<GymForceCardProps> = ({
  style,
  title,
  titleStyle,
  children,
}) => {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={[styles.cardTitle, titleStyle]}>{title}</Text>}
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    padding: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  cardContent: {
    flex: 1,
  },
});

export default GymForceCard;

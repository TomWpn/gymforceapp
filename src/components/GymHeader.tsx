import React from "react";
import {
  View,
  ImageBackground,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import GymForceText from "./GymForceText"; // Adjust the import path as needed
import { Ionicons } from "@expo/vector-icons"; // Adjust the import path if not using Expo

interface GymHeaderProps {
  name: string;
  backgroundImageUrl?: string;
  defaultImageUrl?: string;
  rating?: number; // Gym rating (optional)
  style?: StyleProp<ViewStyle>; // Customizable styles for the header container
  onRatePress?: () => void; // Optional handler when the rating is pressed
}

const GymHeader: React.FC<GymHeaderProps> = ({
  name,
  backgroundImageUrl,
  defaultImageUrl = "https://gymforce.app/assets/images/badge.png",
  rating,
  style,
  onRatePress,
}) => {
  const renderStars = () => {
    const fullStars = Math.floor(rating || 0); // Number of full stars
    const hasHalfStar = rating
      ? rating % 1 >= 0.25 && rating % 1 < 0.75
      : false; // Check for half-star

    return Array.from({ length: 5 }, (_, index) => {
      if (index < fullStars) {
        return <Ionicons key={index} name="star" size={24} color="#FFD700" />;
      }
      if (index === fullStars && hasHalfStar) {
        return (
          <Ionicons key={index} name="star-half" size={24} color="#FFD700" />
        );
      }
      return (
        <Ionicons key={index} name="star-outline" size={24} color="#FFD700" />
      );
    });
  };

  return (
    <ImageBackground
      source={{ uri: backgroundImageUrl || defaultImageUrl }}
      style={[styles.headerBackground, style]}
    >
      <View style={styles.headerOverlay} />
      <View style={styles.headerContent}>
        <GymForceText
          type="Title"
          color="#1a265a"
          fontFamily="Gymforce"
          style={styles.gymName}
        >
          {name}
        </GymForceText>

        <TouchableOpacity style={styles.ratingContainer} onPress={onRatePress}>
          {renderStars()}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Overlay with transparency
  },
  headerContent: {
    marginHorizontal: 20,
    padding: 35,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  gymName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 8,
    margin: "auto",
  },
});

export default GymHeader;

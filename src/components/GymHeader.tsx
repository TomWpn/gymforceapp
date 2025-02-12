import React from "react";
import {
  View,
  ImageBackground,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import GymForceText from "./GymForceText";
import { Ionicons } from "@expo/vector-icons";
import Padding from "./Padding";

interface GymHeaderProps {
  name: string;
  backgroundImageUrl?: string;
  defaultImageUrl?: string;
  rating?: number;
  totalReviews?: number;
  style?: StyleProp<ViewStyle>;
  onRatePress?: () => void;
  children?: React.ReactNode;
}

const GymHeader: React.FC<GymHeaderProps> = ({
  name,
  backgroundImageUrl,
  defaultImageUrl = "https://gymforce.app/assets/images/badge.png",
  rating = 0,
  totalReviews = 0,
  style,
  onRatePress,
  children,
}) => {
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;

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
      <Padding horizontal size={16}>
        {children}
      </Padding>
      {/* <TouchableOpacity style={styles.ratingContainer} onPress={onRatePress}>
          <View style={styles.starsRow}>{renderStars()}</View>
          <GymForceText
            type="Subtitle"
            color="#1a265a"
            fontFamily="Gymforce"
            style={styles.ratingText}
          >
            {rating.toFixed(1)} ({totalReviews} reviews)
          </GymForceText>
          <GymForceText
            type="Subtitle"
            color="#1a265a"
            fontFamily="Gymforce"
            style={styles.ratingText}
          />
        </TouchableOpacity> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  headerContent: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    margin: "auto",
  },
  gymName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 12,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 16,
    marginTop: 4,
    textAlign: "center",
  },
});

export default GymHeader;

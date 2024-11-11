// WelcomeScreen.tsx

import React from "react";
import {
  StyleSheet,
  ImageBackground,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppStackParamList";
import GymForceButton from "../components/GymForceButton";
import NoMarginView from "../components/NoMarginView";
import badge from "../../assets/badge.png"; // Using import instead of require
import AlignCenter from "../components/AlignCenter";
import FlexibleSpacer from "../components/FlexibleSpacer";
import Row from "../components/Row";
import Padding from "../components/Padding";
import GymForceText from "../components/GymForceText";

type WelcomeScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "Welcome"
>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <ImageBackground
      source={{ uri: "https://gymforce.app/assets/images/kettlebell.jpeg" }} // Replace with a relevant image URL
      style={styles.background}
    >
      <View style={styles.overlay} />
      <NoMarginView style={styles.contentContainer}>
        {/* Logo Image */}
        <Image source={badge} style={styles.logo} />

        {/* Hero Text */}
        <GymForceText type="Title">Welcome to Gym Force</GymForceText>
        <FlexibleSpacer top size={12} />
        <GymForceText>
          Achieve your fitness milestones with personalized goals and a vibrant
          community
        </GymForceText>

        {/* Call-to-Action Button */}
        <FlexibleSpacer top size={12} />
        <AlignCenter>
          <Padding>
            <Row>
              <GymForceButton
                title="Get Started"
                onPress={() =>
                  navigation.navigate("SignUp", { mode: "signup" })
                }
                size="large"
                fullWidth
              />
            </Row>
          </Padding>
        </AlignCenter>

        <GymForceText type="Note">
          By continuing, you agree to our Terms & Privacy Policy
        </GymForceText>

        {/* Log In Link */}
        <FlexibleSpacer top size={32} />
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <GymForceText color="#ff7f50">
            Already have an account? Log In
          </GymForceText>
        </TouchableOpacity>
      </NoMarginView>
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "cover",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark overlay for better text contrast
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed to keep aspect ratio
    marginBottom: 20,
    resizeMode: "contain",
  },
});

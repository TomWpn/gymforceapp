// src/navigation/AppContent.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";

const AppContent = () => {
  const { user, loading } = useAuth();

  const [fontsLoaded] = useFonts({
    Gymforce: require("../../assets/fonts/VTFRedzone-Classic.ttf"),
    OpenSansGymforce: require("../../assets/fonts/OpenSans-VariableFont_wdth,wght.ttf"),
  });

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return user ? <MainStack /> : <AuthStack />;
};

export default AppContent;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff", // Optional: set background color
  },
});

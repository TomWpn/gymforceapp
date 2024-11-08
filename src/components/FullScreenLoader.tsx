// src/components/FullScreenLoader.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";

interface FullScreenLoaderProps {
  message?: string; // Optional message to display
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: "#ffffff",
  },
});

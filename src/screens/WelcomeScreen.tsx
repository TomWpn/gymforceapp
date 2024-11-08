// WelcomeScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import {
  AppRouteProp,
  AppStackParamList,
} from "../navigation/AppStackParamList";

type WelcomeScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "Welcome"
>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Gym Force</Text>
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate("SignUp", { mode: "signup" })}
      />
      <Button title="Log In" onPress={() => navigation.navigate("Login")} />
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
});

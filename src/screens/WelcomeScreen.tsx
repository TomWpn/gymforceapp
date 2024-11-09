// WelcomeScreen.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppStackParamList";
import GymForceButton from "../components/GymForceButton";
import NoMarginView from "../components/NoMarginView";

type WelcomeScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "Welcome"
>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <NoMarginView style={styles.container}>
      <Text style={styles.title}>Welcome to Gym Force</Text>
      <GymForceButton
        title="Sign Up"
        onPress={() => navigation.navigate("SignUp", { mode: "signup" })}
      />
      <GymForceButton
        title="Log In"
        onPress={() => navigation.navigate("Login")}
      />
    </NoMarginView>
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

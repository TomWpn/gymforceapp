// src/navigation/AuthStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppStackParamList } from "./AppStackParamList";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import LoginScreen from "../screens/LoginScreen";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import EmployerSelectionScreen from "../screens/EmployerScreen";
import GymSelectionScreen from "../screens/GymSelectionScreen";

const Stack = createStackNavigator<AppStackParamList>();

const AuthStack = ({
  initialScreen,
}: {
  initialScreen: keyof AppStackParamList;
}) => (
  <Stack.Navigator initialRouteName={initialScreen || "Welcome"}>
    <Stack.Screen
      name="Welcome"
      component={WelcomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUpScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    {/* UserDetails */}
    <Stack.Screen
      name="UserDetails"
      component={UserDetailsScreen}
      options={{ title: "Complete Profile" }}
      initialParams={{ mode: "signup" }}
    />
    {/* EmployerSelection */}
    <Stack.Screen
      name="EmployerSelection"
      component={EmployerSelectionScreen}
      options={{ title: "Select Employer" }}
      initialParams={{ mode: "signup" }}
    />
    {/* GymSelection */}
    <Stack.Screen
      name="GymSelection"
      component={GymSelectionScreen}
      options={{ title: "Select Gym" }}
      initialParams={{ mode: "signup" }}
    />
  </Stack.Navigator>
);

export default AuthStack;

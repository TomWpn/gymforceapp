// src/navigation/MainStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppStackParamList } from "./AppStackParamList";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import EmployerSelectionScreen from "../screens/EmployerSelectionScreen";
import GymSelectionScreen from "../screens/GymSelectionScreen";
import BottomTabs from "../components/BottomTabs";
import GymReviewsScreen from "../screens/GymReviewsScreen";

const Stack = createStackNavigator<AppStackParamList>();

const MainStack = () => (
  <Stack.Navigator initialRouteName="BottomTabs">
    {/* Bottom Tabs, which includes Dashboard as one of its tabs */}
    <Stack.Screen
      name="BottomTabs"
      component={BottomTabs}
      options={{ headerShown: false }} // Hide header for Bottom Tabs
    />

    {/* Additional screens not in Bottom Tabs */}
    <Stack.Screen
      name="UserDetails"
      component={UserDetailsScreen}
      options={{ title: "Complete Profile" }}
    />
    <Stack.Screen
      name="EmployerSelection"
      component={EmployerSelectionScreen}
      options={{ title: "Select Employer" }}
    />
    <Stack.Screen
      name="GymSelection"
      component={GymSelectionScreen}
      options={{ title: "Select Gym" }}
    />
    {/* <Stack.Screen
      name="GymReviews"
      component={GymReviewsScreen}
      options={{ title: "Gym Reviews" }}
    /> */}
  </Stack.Navigator>
);

export default MainStack;

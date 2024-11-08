// src/navigation/MainStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppStackParamList } from "./AppStackParamList";
import EmployerSelectionScreen from "../screens/EmployerSelectionScreen";
import GymSelectionScreen from "../screens/GymSelectionScreen";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import DashboardScreen from "../screens/DashboardScreen";

const Stack = createStackNavigator<AppStackParamList>();

const MainStack = () => (
  <Stack.Navigator initialRouteName="Dashboard">
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen
      name="EmployerSelection"
      component={EmployerSelectionScreen}
    />
    <Stack.Screen name="GymSelection" component={GymSelectionScreen} />
    <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
  </Stack.Navigator>
);

export default MainStack;

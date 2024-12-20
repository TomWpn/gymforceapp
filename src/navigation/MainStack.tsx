import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppStackParamList } from "./AppStackParamList";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import EmployerSelectionScreen from "../screens/EmployerSelectionScreen";
import GymSelectionScreen from "../screens/GymSelectionScreen";
import BottomTabs from "../components/BottomTabs";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import LoginScreen from "../screens/LoginScreen";

const Stack = createStackNavigator<AppStackParamList>();

const MainStack = ({
  initialRoute = "Welcome",
  initialRouteParams = {},
}: {
  initialRoute?: keyof AppStackParamList;
  initialRouteParams?: object;
}) => (
  <Stack.Navigator initialRouteName={initialRoute}>
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
    {/* Bottom Tabs */}
    <Stack.Screen
      name="BottomTabs"
      component={BottomTabs}
      options={{ headerShown: false }}
    />
    {/* UserDetails */}
    <Stack.Screen
      name="UserDetails"
      component={UserDetailsScreen}
      options={{ title: "Complete Profile" }}
      initialParams={
        initialRoute === "UserDetails" ? initialRouteParams : undefined
      }
    />
    {/* EmployerSelection */}
    <Stack.Screen
      name="EmployerSelection"
      component={EmployerSelectionScreen}
      options={{ title: "Select Employer" }}
      initialParams={
        initialRoute === "EmployerSelection" ? initialRouteParams : undefined
      }
    />
    {/* GymSelection */}
    <Stack.Screen
      name="GymSelection"
      component={GymSelectionScreen}
      options={{ title: "Select Gym" }}
      initialParams={
        initialRoute === "GymSelection" ? initialRouteParams : undefined
      }
    />
  </Stack.Navigator>
);

export default MainStack;

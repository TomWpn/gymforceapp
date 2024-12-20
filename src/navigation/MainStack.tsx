import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppStackParamList } from "./AppStackParamList";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import EmployerSelectionScreen from "../screens/EmployerSelectionScreen";
import GymSelectionScreen from "../screens/GymSelectionScreen";
import BottomTabs from "../components/BottomTabs";

const Stack = createStackNavigator<AppStackParamList>();

const MainStack = ({
  initialRoute = "BottomTabs",
  initialRouteParams = {},
}: {
  initialRoute?: keyof AppStackParamList;
  initialRouteParams?: object;
}) => (
  <Stack.Navigator initialRouteName={initialRoute}>
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

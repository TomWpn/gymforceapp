import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import GymScreen from "../screens/GymScreen";
import EmployerScreen from "../screens/EmployerScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useDynamicIcon } from "../hooks/useDynamicIcon";
import GymForceText from "./GymForceText";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const HomeIcon = useDynamicIcon("Ionicons");
  const FitnessIcon = useDynamicIcon("MaterialIcons");
  const BusinessIcon = useDynamicIcon("Ionicons");
  const SettingsIcon = useDynamicIcon("Ionicons");

  if (!HomeIcon || !FitnessIcon || !BusinessIcon || !SettingsIcon)
    return <GymForceText>app load failed</GymForceText>; // Ensure all icons are loaded

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: { height: 60, backgroundColor: "#1a265a" },
        tabBarIconStyle: { marginTop: 10 },
        tabBarActiveTintColor: "#f1600d",
        tabBarInactiveTintColor: "#ffffff",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Gyms"
        component={GymScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FitnessIcon name="fitness-center" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Employers"
        component={EmployerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BusinessIcon name="business-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

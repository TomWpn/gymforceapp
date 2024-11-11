// src/navigation/AppStackParamList.ts
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define the list of routes and their parameter types
// src/navigation/AppStackParamList.ts
export type AppStackParamList = {
  Welcome: undefined;
  SignUp: { mode?: "signup" | "edit" } | undefined;
  Login: undefined;
  EmployerSelection: { mode?: "signup" | "edit" } | undefined;
  GymSelection: { mode?: "signup" | "edit" } | undefined;
  UserDetails: { mode?: "signup" | "edit" } | undefined;
  BottomTabs:
    | { screen?: "Dashboard" | "Gyms" | "Employer" | "Settings" }
    | undefined;
  Dashboard: undefined;
  Gyms: undefined;
  Employer: undefined;
  Settings: undefined;
};

// Define navigation prop types
export type AppNavigationProp = StackNavigationProp<AppStackParamList>;
export type AppRouteProp<RouteName extends keyof AppStackParamList> = RouteProp<
  AppStackParamList,
  RouteName
>;

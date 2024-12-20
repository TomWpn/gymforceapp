import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userProfileService";
import MainStack from "./MainStack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { getIncompleteProfileFields } from "../utils/profileUtils";
import { UserProfile } from "../types";
import { useNavigationContainerRef } from "@react-navigation/native";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [incompleteFields, setIncompleteFields] = useState<string[] | null>(
    null
  );
  const navigationRef = useNavigationContainerRef(); // Navigation reference for resetting stack

  const [fontsLoaded] = useFonts({
    Gymforce: require("../../assets/fonts/VTFRedzone-Classic.ttf"),
    OpenSansGymforce: require("../../assets/fonts/OpenSans-VariableFont_wdth,wght.ttf"),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const fetchedProfile = await getUserProfile(user.uid);
        setProfile(fetchedProfile || ({} as UserProfile));
        const incompleteFields = getIncompleteProfileFields(
          fetchedProfile || ({} as UserProfile)
        );
        setIncompleteFields(incompleteFields);
      }
    };

    fetchProfile();
  }, [user]);

  // Reset navigation stack when the user signs out
  useEffect(() => {
    if (!user && navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: "Welcome" }], // Reset to the Welcome screen
      });
    }
  }, [user, navigationRef]);

  if (loading || !fontsLoaded || (user && !profile)) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Render Welcome if user is not signed in
  if (!user) {
    return <MainStack initialRoute="Welcome" />;
  }

  // Redirect based on profile completeness
  if (incompleteFields && incompleteFields.length > 0) {
    const firstIncompleteField = incompleteFields[0];
    switch (firstIncompleteField) {
      case "address":
        return (
          <MainStack
            initialRoute="UserDetails"
            initialRouteParams={{ mode: "signup" }}
          />
        );
      case "employer":
        return (
          <MainStack
            initialRoute="EmployerSelection"
            initialRouteParams={{ mode: "signup" }}
          />
        );
      case "gym":
        return (
          <MainStack
            initialRoute="GymSelection"
            initialRouteParams={{ mode: "signup" }}
          />
        );
      default:
        return (
          <MainStack
            initialRoute="UserDetails"
            initialRouteParams={{ mode: "signup" }}
          />
        );
    }
  }

  return <MainStack />;
};

export default AppContent;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

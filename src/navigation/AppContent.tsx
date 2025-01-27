import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MainStack from "./MainStack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { getIncompleteProfileFields } from "../utils/profileUtils";
import { UserProfile } from "../types";
import { getUserProfile } from "../services/userProfileService";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [incompleteFields, setIncompleteFields] = useState<string[] | null>(
    null
  );

  const [fontsLoaded] = useFonts({
    Gymforce: require("../../assets/fonts/VTFRedzone-Classic.ttf"),
    OpenSansGymforce: require("../../assets/fonts/OpenSans-VariableFont_wdth,wght.ttf"),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const fetchedProfile = await getUserProfile(user.uid);
        setProfile(fetchedProfile || ({} as UserProfile));
        setIncompleteFields(
          getIncompleteProfileFields(fetchedProfile || ({} as UserProfile))
        );
      } else {
        setProfile(null);
        setIncompleteFields(null);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || !fontsLoaded || (user && !profile)) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If the user is not authenticated, show the Welcome screen
  if (!user) {
    return <MainStack initialRoute="Welcome" />;
  }

  // If the profile has incomplete fields, redirect to the first missing field
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

  // If authenticated and profile is complete, navigate to the main app (Dashboard)
  return <MainStack initialRoute="Home" />;
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

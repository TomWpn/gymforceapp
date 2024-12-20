import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userProfileService";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { getIncompleteProfileFields } from "../utils/profileUtils";
import { UserProfile } from "../types";

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
        const incompleteFields = getIncompleteProfileFields(
          fetchedProfile || ({} as UserProfile)
        );
        setIncompleteFields(incompleteFields);
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

  if (!user) {
    console.log("User is not authenticated.");
    return <AuthStack initialScreen="Welcome" />;
  }

  if (incompleteFields && incompleteFields.length > 0) {
    const firstIncompleteField = incompleteFields[0];
    switch (firstIncompleteField) {
      case "address":
        console.log("Redirecting to address screen.");
        return (
          <MainStack
            initialRoute="UserDetails"
            initialRouteParams={{ mode: "signup" }}
          />
        );
      case "employer":
        console.log("Redirecting to employer screen.");
        return (
          <MainStack
            initialRoute="EmployerSelection"
            initialRouteParams={{ mode: "signup" }}
          />
        );
      case "gym":
        console.log("Redirecting to gym screen.");
        return (
          <MainStack
            initialRoute="GymSelection"
            initialRouteParams={{ mode: "signup" }}
          />
        );
      default:
        console.log("Redirecting to user details screen.");
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

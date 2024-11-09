// src/navigation/AppContent.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../services/firebaseConfig";
import { AppNavigationProp } from "./AppStackParamList";
import { useFonts } from "expo-font";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const navigation = useNavigation<AppNavigationProp>();

  const [fontsLoaded] = useFonts({
    Gymforce: require("../../assets/fonts/VTFRedzone-Classic.ttf"),
    OpenSansGymforce: require("../../assets/fonts/OpenSans-VariableFont_wdth,wght.ttf"),
  });

  useEffect(() => {
    const checkUserProfileCompleteness = async () => {
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User Data:", userData);

          // Redirect based on profile completeness
          if (!userData?.address) {
            navigation.navigate("UserDetails", { mode: "signup" });
          } else if (!userData?.employer) {
            navigation.navigate("EmployerSelection", { mode: "signup" });
          } else if (!userData?.gym) {
            navigation.navigate("GymSelection", { mode: "signup" });
          } else {
            navigation.navigate("Dashboard");
          }
        } else {
          navigation.navigate("UserDetails", { mode: "signup" });
        }
      }
      setProfileLoading(false);
    };

    if (user) {
      checkUserProfileCompleteness();
    } else {
      setProfileLoading(false);
    }
  }, [user, navigation]);

  if (loading || profileLoading || !fontsLoaded) return null; // Optionally add a loading indicator

  return user ? <MainStack /> : <AuthStack />;
};

export default AppContent;

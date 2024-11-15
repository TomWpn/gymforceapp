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
import Gymforce from "../../assets/fonts/VTFRedzone-Classic.ttf";
import OpenSansGymforce from "../../assets/fonts/OpenSans-VariableFont_wdth,wght.ttf";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const navigation = useNavigation<AppNavigationProp>();

  const [fontsLoaded] = useFonts({
    Gymforce,
    OpenSansGymforce,
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
            console.log("User data is incomplete, redirecting to UserDetails");
            navigation.navigate("UserDetails", { mode: "signup" });
          } else if (!userData?.employer) {
            console.log(
              "User data is incomplete, redirecting to EmployerSelection"
            );
            navigation.navigate("EmployerSelection", { mode: "signup" });
          } else if (!userData?.gym) {
            console.log("User data is incomplete, redirecting to GymSelection");
            navigation.navigate("GymSelection", { mode: "signup" });
          } else {
            console.log("User data is complete, redirecting to BottomTabs");
            navigation.navigate("BottomTabs", {});
          }
        } else {
          console.log("User data does not exist, redirecting to UserDetails");
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

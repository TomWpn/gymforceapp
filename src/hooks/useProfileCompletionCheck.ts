import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCallback } from "react";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { auth } from "../services/firebaseConfig";
import { getUserProfile } from "../services/userProfileService";
import { getIncompleteProfileFields } from "../utils/profileUtils";

type NavigationProp = StackNavigationProp<AppStackParamList>;

/**
 * Hook to check if a user's profile is complete and navigate to the appropriate screen if not
 * @param mode The mode to use for navigation ("signup" or "edit")
 * @returns A function that checks profile completion and returns true if complete, false otherwise
 */
export const useProfileCompletionCheck = (
  mode: "signup" | "edit" = "signup"
) => {
  const navigation = useNavigation<NavigationProp>();

  const checkProfileAndNavigate = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;

    try {
      const userProfile = await getUserProfile(auth.currentUser.uid);
      const incompleteFields = getIncompleteProfileFields(userProfile || {});

      if (incompleteFields.length === 0) {
        // Profile is complete
        return true;
      }

      // Navigate to the appropriate screen based on the first incomplete field
      const firstIncompleteField = incompleteFields[0];
      switch (firstIncompleteField) {
        case "address":
        case "name":
        case "phone":
          navigation.navigate("UserDetails", { mode });
          break;
        case "employer":
          navigation.navigate("EmployerSelection", { mode });
          break;
        case "gym":
          navigation.navigate("GymSelection", { mode });
          break;
        default:
          // This shouldn't happen, but just in case
          navigation.navigate("UserDetails", { mode });
      }

      return false;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
    }
  }, [navigation, mode]);

  return checkProfileAndNavigate;
};

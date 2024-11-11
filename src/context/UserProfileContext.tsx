import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserProfile } from "../services/userProfileService";
import { auth } from "../services/firebaseConfig";
import { UserProfile } from "../types";
import { onAuthStateChanged } from "firebase/auth"; // Import auth listener

interface UserProfileContextType {
  userProfile: UserProfile | null;
  refreshUserProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export const useUserProfileContext = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error(
      "useUserProfileContext must be used within a UserProfileProvider"
    );
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const refreshUserProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const profile = await getUserProfile(uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener to trigger profile refresh
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        refreshUserProfile();
      } else {
        setUserProfile(null); // Reset user profile when signed out
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, refreshUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

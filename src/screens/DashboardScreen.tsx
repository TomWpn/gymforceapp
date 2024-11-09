// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import GymCard from "../components/GymCard";
import EmployerCard from "../components/EmployerCard";
import UserDetailsCard from "../components/UserDetailsCard";
import CheckInHistoryCard from "../components/CheckInHistoryCard";
import { getUserProfile } from "../services/userProfileService";
import { UserProfile } from "../types";
import { auth } from "../services/firebaseConfig";
import Accordion from "../components/Accordion";
import Padding from "../components/Padding";

const DashboardScreen = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const profile = await getUserProfile(uid);
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userProfile && (
        <>
          {/* My Gym section (not collapsible) */}
          <Padding size={8}>
            <Text style={styles.sectionTitle}>My Gym</Text>
            <GymCard gym={userProfile.gym} />
          </Padding>

          {/* Employer Information (collapsible) */}
          <Padding size={8}>
            <Accordion title="Employer Information">
              <EmployerCard employer={userProfile.employer} />
            </Accordion>
          </Padding>

          {/* User Profile (collapsible) */}
          <Padding size={8}>
            <Accordion title="User Profile">
              <UserDetailsCard
                name={userProfile.name}
                phone={userProfile.phone}
                address={userProfile.address}
              />
            </Accordion>
          </Padding>

          {/* Check-In History (collapsible) */}
          <Padding size={8}>
            <Accordion title="Check-In History">
              <CheckInHistoryCard />
            </Accordion>
          </Padding>
        </>
      )}
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1, // This helps ScrollView enable vertical scrolling
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
});

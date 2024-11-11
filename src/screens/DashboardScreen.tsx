// src/screens/DashboardScreen.tsx
import React, { useCallback } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import GymCard from "../components/GymCard";
import CheckInHistoryCard from "../components/CheckInHistoryCard";
import Accordion from "../components/Accordion";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useUserProfileContext } from "../context/UserProfileContext";
import { useCheckInContext } from "../context/CheckInContext";

const DashboardScreen = () => {
  const { userProfile, refreshUserProfile } = useUserProfileContext();
  const { fetchCheckInHistory } = useCheckInContext();

  // Refresh user profile every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  // fetch Check in history on load
  useFocusEffect(
    useCallback(() => {
      fetchCheckInHistory();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userProfile && (
        <>
          <GymCard />

          {/* Check-In History (collapsible) */}
          <FlexibleSpacer size={16} top />
          <Accordion title="Check-In History">
            <CheckInHistoryCard />
          </Accordion>
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
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
});

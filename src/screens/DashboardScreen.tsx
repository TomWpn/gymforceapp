import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, ActivityIndicator, View } from "react-native";
import GymCard from "../components/GymCard";
import CheckInHistoryCard from "../components/CheckInHistoryCard";
import Accordion from "../components/Accordion";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useUserProfileContext } from "../context/UserProfileContext";
import { useCheckInContext } from "../context/CheckInContext";

const DashboardScreen = () => {
  const { userProfile, refreshUserProfile } = useUserProfileContext();
  const { fetchCheckInHistory } = useCheckInContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      await refreshUserProfile();
      await fetchCheckInHistory();
      setLoading(false);
    };
    loadUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userProfile && !loading && (
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
});

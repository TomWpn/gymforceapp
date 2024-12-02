import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import UserDetailsCard from "../components/UserDetailsCard";
import EmployerCard from "../components/EmployerCard";
import GymCard from "../components/GymCard";
import FlexibleSpacer from "../components/FlexibleSpacer";
import GymForceButton from "../components/GymForceButton";
import { auth } from "../services/firebaseConfig";

const SettingsScreen: React.FC = () => {
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Unable to sign out at this time.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardContainer}>
        {/* User Details */}
        <UserDetailsCard />

        {/* Employer Details */}
        <FlexibleSpacer size={8} top />
        <EmployerCard />

        {/* Gym Details */}
        <FlexibleSpacer size={8} top />
        <GymCard showCheckIn={false} />
      </View>
      <GymForceButton
        title="Sign Out"
        onPress={handleSignOut}
        fullWidth={true}
        variant="tertiary"
        size="small"
      />
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  cardContainer: {
    marginBottom: 20,
  },
});
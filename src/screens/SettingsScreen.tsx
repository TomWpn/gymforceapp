import React, { version } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import UserDetailsCard from "../components/UserDetailsCard";
import EmployerCard from "../components/EmployerCard";
import GymCard from "../components/GymCard";
import FlexibleSpacer from "../components/FlexibleSpacer";
import GymForceButton from "../components/GymForceButton";
import { auth } from "../services/firebaseConfig";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import DeleteAccountButton from "../components/DeleteAccountButton";

type SettingsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "Settings"
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }], // Reset to the Welcome screen
      });
      // alert("Signed out successfully!");
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
      <DeleteAccountButton />
      <Text style={styles.version}>version 3.18.25</Text>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  cardContainer: {
    marginBottom: 20,
  },
  version: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 20,
  },
});

// src/components/UserDetailsCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../services/firebaseConfig";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "./GymForceButton";
import NoMarginView from "./NoMarginView";
import Spacer from "./Spacer";
import { Address } from "../types";
import FlexibleSpacer from "./FlexibleSpacer";

type UserDetailsCardProps = {
  name: string | undefined;
  phone: string | undefined;
  email?: string;
  address?: Address;
};

type UserDetailsNavigationProp = StackNavigationProp<
  AppStackParamList,
  "UserDetails"
>;

const UserDetailsCard: React.FC<UserDetailsCardProps> = ({
  name,
  phone,
  email,
  address,
}) => {
  const navigation = useNavigation<UserDetailsNavigationProp>();

  const handleEditProfile = () => {
    navigation.navigate("UserDetails", { mode: "edit" });
  };

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
    <NoMarginView style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
      </View>

      {/* User Details Section */}
      <View style={styles.details}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.info}>{name || "Not provided"}</Text>

        <FlexibleSpacer size={8} top />

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.info}>{phone || "Not provided"}</Text>

        {email && (
          <>
            <FlexibleSpacer size={8} top />
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{email}</Text>
          </>
        )}

        {address && (
          <>
            <FlexibleSpacer size={8} top />
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.info}>{address.formatted_address}</Text>
          </>
        )}
      </View>

      <Spacer size={16} />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <GymForceButton
          title="Edit Profile"
          onPress={handleEditProfile}
          fullWidth={true}
          variant="primary"
          size="large"
        />
        <FlexibleSpacer size={8} top />
        <GymForceButton
          title="Sign Out"
          onPress={handleSignOut}
          fullWidth={true}
          variant="tertiary"
          size="small"
        />
      </View>
    </NoMarginView>
  );
};

export default UserDetailsCard;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a265a",
  },
  details: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  info: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
  },
  actions: {
    marginTop: 15,
  },
});

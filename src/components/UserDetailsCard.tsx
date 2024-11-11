import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "./GymForceButton";
import CardWithIconBackground from "./CardWithIconBackground";
import { useUserProfileContext } from "../context/UserProfileContext";
import FlexibleSpacer from "./FlexibleSpacer";
import GymForceText from "./GymForceText";

type UserDetailsNavigationProp = StackNavigationProp<
  AppStackParamList,
  "UserDetails"
>;

const UserDetailsCard: React.FC = () => {
  const navigation = useNavigation<UserDetailsNavigationProp>();
  const { userProfile } = useUserProfileContext();

  const handleEditProfile = () => {
    navigation.navigate("UserDetails", { mode: "edit" });
  };

  return (
    <CardWithIconBackground iconLibrary="Ionicons" iconName="person-outline">
      <View style={styles.header}>
        <GymForceText style={styles.title}>Your Details</GymForceText>
      </View>
      <View style={styles.details}>
        <GymForceText style={styles.label}>Name:</GymForceText>
        <GymForceText style={styles.info}>
          {userProfile?.name || "Not provided"}
        </GymForceText>

        <FlexibleSpacer size={4} top />
        <GymForceText style={styles.label}>Phone:</GymForceText>
        <GymForceText style={styles.info}>
          {userProfile?.phone || "Not provided"}
        </GymForceText>

        <FlexibleSpacer size={4} top />
        {userProfile?.email && (
          <>
            <GymForceText style={styles.label}>Email:</GymForceText>
            <GymForceText style={styles.info}>{userProfile.email}</GymForceText>
          </>
        )}

        <FlexibleSpacer size={4} top />
        {userProfile?.address && (
          <>
            <GymForceText style={styles.label}>Address:</GymForceText>
            <GymForceText style={styles.info}>
              {userProfile.address.formatted_address}
            </GymForceText>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <GymForceButton
          title="Edit Profile"
          onPress={handleEditProfile}
          variant="primary"
          size="small"
          width={"50%"}
        />
      </View>
    </CardWithIconBackground>
  );
};

export default UserDetailsCard;

const styles = StyleSheet.create({
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

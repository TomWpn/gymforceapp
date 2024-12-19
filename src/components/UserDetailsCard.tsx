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
import { MaterialIcons, Feather, FontAwesome5 } from "@expo/vector-icons";

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
        <GymForceText type="Title" color="primary">
          Your Details
        </GymForceText>
      </View>
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={20} color="#1a265a" />
          <GymForceText style={styles.info}>
            {userProfile?.name || "Name not provided"}
          </GymForceText>
        </View>

        <FlexibleSpacer size={4} top />
        <View style={styles.detailRow}>
          <Feather name="phone" size={20} color="#1a265a" />
          <GymForceText style={styles.info}>
            {userProfile?.phone || "Phone not provided"}
          </GymForceText>
        </View>

        <FlexibleSpacer size={4} top />
        {userProfile?.address && (
          <View style={styles.detailRow}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#1a265a" />
            <GymForceText style={styles.info}>
              {userProfile.address.formatted_address}
            </GymForceText>
          </View>
        )}

        <FlexibleSpacer size={4} top />
        {userProfile?.email && (
          <View style={styles.detailRow}>
            <Feather name="mail" size={20} color="#1a265a" />
            <GymForceText style={styles.info}>{userProfile.email}</GymForceText>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <GymForceButton
          title="Edit Profile"
          onPress={handleEditProfile}
          variant="primary"
          size="small"
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
    textAlign: "left",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
    marginLeft: 8,
  },
  actions: {
    marginTop: 15,
  },
});

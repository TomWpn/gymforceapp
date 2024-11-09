import React from "react";
import { View, Text, StyleSheet, Alert, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { logCheckIn } from "../services/checkInService";
import { Company } from "../types";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "../services/firebaseConfig";
import GymForceButton from "./GymForceButton";
import Spacer from "./Spacer";
import NoMarginView from "./NoMarginView";

type GymCardProps = {
  gym: Company | undefined;
};

type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

const GymCard: React.FC<GymCardProps> = ({ gym }) => {
  const navigation = useNavigation<GymSelectionNavigationProp>();

  const handleEditGym = () => {
    navigation.navigate("GymSelection", { mode: "edit" });
  };

  const handleCheckIn = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const gymId = gym?.id;
      if (uid && gymId) {
        await logCheckIn(uid, gymId, gym.properties.name!);
        alert("Check-in successful!");
      } else {
        alert("User or Gym information is missing.");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Unable to check in at this time.");
    }
  };

  const handleOpenMap = () => {
    if (!gym?.properties.address || !gym?.properties.city) {
      Alert.alert("Location unavailable", "No address found for this gym.");
      return;
    }

    const address = `${gym.properties.address}, ${gym.properties.city}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to open the maps app.");
        }
      })
      .catch((err) => console.error("Error opening map:", err));
  };

  return (
    <NoMarginView style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{gym?.properties.name || "Gym Name"}</Text>
      </View>

      {/* Main Action */}
      <View style={styles.mainAction}>
        <GymForceButton
          fullWidth={true}
          title="Check In"
          variant="secondary"
          onPress={handleCheckIn}
          size="large"
        />
      </View>

      <Spacer size={20} />

      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        <GymForceButton
          title="Change Your Gym"
          onPress={handleEditGym}
          size="small"
          variant="primary"
          width="48%" // Adjust width to half of the row
        />
        <GymForceButton
          title="Get Directions"
          variant="tertiary"
          onPress={handleOpenMap}
          size="small"
          width="48%" // Adjust width to half of the row
        />
      </View>
    </NoMarginView>
  );
};

export default GymCard;

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
  mainAction: {
    marginVertical: 10,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
});

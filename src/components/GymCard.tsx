import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { logCheckIn } from "../services/checkInService";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "./GymForceButton";
import Spacer from "./Spacer";
import CardWithIconBackground from "./CardWithIconBackground";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { useUserProfileContext } from "../context/UserProfileContext";
import { auth } from "../services/firebaseConfig";
import { handleOpenMap } from "../services/gymService";
import GymForceText from "./GymForceText";
import { useCheckInContext } from "../context/CheckInContext";
import CheckInConfirmationModal from "./CheckInConfirmationModal";

type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

const GymCard: React.FC<{ showCheckIn?: boolean }> = ({
  showCheckIn = true,
}) => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const { userProfile } = useUserProfileContext();
  const { fetchCheckInHistory } = useCheckInContext();
  const [isModalVisible, setModalVisible] = useState(false);
  const gym = userProfile?.gym;

  const handleEditGym = () => {
    navigation.navigate("GymSelection", { mode: "edit" });
  };

  const handleCheckIn = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const gymId = gym?.id;
      if (uid && gymId) {
        await logCheckIn(uid, gymId, gym.properties.name!);
        await fetchCheckInHistory();
        setModalVisible(true);
      } else {
        alert("User or Gym information is missing.");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Unable to check in at this time.");
    }
  };

  const closeModal = () => {
    setModalVisible(false); // Close the modal
  };

  return (
    <CardWithIconBackground
      iconLibrary="MaterialCommunityIcons"
      iconName="weight-lifter"
    >
      <View style={styles.header}>
        <GymForceText style={styles.title}>
          {gym?.properties.name || "Gym Name"}
        </GymForceText>
      </View>

      {/* Main Action */}
      {showCheckIn && (
        <View style={styles.mainAction}>
          <GymForceButton
            fullWidth={true}
            title="Check In"
            variant="secondary"
            onPress={handleCheckIn}
            size="large"
          />
        </View>
      )}

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
          onPress={() => handleOpenMap(gym!)}
          size="small"
          width="48%" // Adjust width to half of the row
        />
      </View>
      {/* Confirmation Modal */}
      <CheckInConfirmationModal
        isVisible={isModalVisible}
        onClose={closeModal}
        gymName={gym?.properties.name!}
      />
    </CardWithIconBackground>
  );
};

export default GymCard;

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
  mainAction: {
    marginVertical: 10,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
});

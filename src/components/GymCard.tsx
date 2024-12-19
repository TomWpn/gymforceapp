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
import NoMarginView from "./NoMarginView";
import FlexibleSpacer from "./FlexibleSpacer";

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

  const handleEditOrFindGym = () => {
    navigation.navigate("GymSelection", { mode: "edit" });
  };

  const handleGetDirections = () => {
    if (gym) {
      handleOpenMap(gym);
    }
  };

  const handleCheckIn = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const gymId = gym?.id;

      if (!uid || !gymId) {
        console.error("Check-in failed: Missing user or gym information.");
        return;
      }

      await logCheckIn(uid, gymId, gym.properties.name!);
      await fetchCheckInHistory();
      setModalVisible(true); // Show confirmation modal
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false); // Close the check-in confirmation modal
  };

  const hasBothButtons = !!gym; // Show "Get Directions" only if gym exists

  return (
    <CardWithIconBackground
      iconLibrary="MaterialCommunityIcons"
      iconName="weight-lifter"
    >
      <NoMarginView>
        <GymForceText type="Title" color="primary">
          {gym?.properties.name || "No Gym Selected"}
        </GymForceText>
        {gym && (
          <>
            <GymForceText type="Note" color="#666666">
              {gym.properties.address}, {gym.properties.city},
              {gym.properties.state}
            </GymForceText>
            <FlexibleSpacer size={8} bottom />
          </>
        )}
      </NoMarginView>

      {/* Main Action */}
      {showCheckIn && gym && (
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
      <View style={[styles.secondaryActions]}>
        <GymForceButton
          title={gym ? "Change Your Gym" : "Find a Gym"}
          onPress={handleEditOrFindGym}
          size="small"
          variant="primary"
        />
        {gym && (
          <GymForceButton
            title="Get Directions"
            variant="tertiary"
            onPress={handleGetDirections}
            size="small"
          />
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a265a",
    paddingTop: 10,
  },
  mainAction: {
    marginVertical: 10,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 10,
  },
});

import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
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
import { useMembershipStatus } from "../hooks/useMembershipStatus";

type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

interface GymCardProps {
  showCheckIn?: boolean;
  requireAttestation?: boolean;
  gym?: any;
}

const NetworkGymContent: React.FC<{
  gym: any;
  onCheckIn: () => void;
  onEditGym: () => void;
  onGetDirections: () => void;
  showCheckIn: boolean;
  canCheckIn: boolean;
}> = ({
  gym,
  onCheckIn,
  onEditGym,
  onGetDirections,
  showCheckIn,
  canCheckIn,
}) => (
  <View>
    <NoMarginView>
      <GymForceText type="Title" color="primary">
        {gym.properties.name}
      </GymForceText>
      <GymForceText type="Note" color="#666666">
        {gym.properties.address}, {gym.properties.city}, {gym.properties.state}
      </GymForceText>
      <FlexibleSpacer size={8} bottom />
    </NoMarginView>

    {showCheckIn && canCheckIn && (
      <View style={styles.mainAction}>
        <GymForceButton
          fullWidth={true}
          title="Check In"
          variant="secondary"
          onPress={onCheckIn}
          size="large"
        />
      </View>
    )}

    <Spacer size={20} />

    <View style={styles.secondaryActions}>
      <GymForceButton
        title="Change Your Gym"
        onPress={onEditGym}
        size="small"
        variant="primary"
      />
      <GymForceButton
        title="Get Directions"
        variant="tertiary"
        onPress={onGetDirections}
        size="small"
      />
    </View>
  </View>
);

const MembershipOptions: React.FC<{
  gym: any;
  membershipStatus: any;
  onExistingMember: () => void;
  onMembershipInterest: () => void;
  onGymContact: () => void;
  sendingInterest: boolean;
  claimingMembership: boolean;
  isLoading: boolean;
}> = ({
  gym,
  membershipStatus,
  onExistingMember,
  onMembershipInterest,
  onGymContact,
  sendingInterest,
  claimingMembership,
  isLoading,
}) => (
  <View style={styles.membershipOptions}>
    <GymForceText style={styles.membershipTitle}>
      Welcome to {gym?.properties.name}
    </GymForceText>
    <GymForceText style={styles.membershipSubtitle}>
      {membershipStatus?.sent
        ? "Once you've completed your membership signup with the gym, click below:"
        : "Are you currently a member of this gym?"}
    </GymForceText>
    <View style={styles.buttonContainer}>
      <GymForceButton
        title={
          claimingMembership
            ? "Verifying..."
            : membershipStatus?.sent
            ? "I have become a member"
            : "I am already a member"
        }
        onPress={onExistingMember}
        variant="primary"
        fullWidth
        disabled={claimingMembership}
      />
      {!membershipStatus?.sent && (
        <>
          <FlexibleSpacer bottom size={12} />
          <GymForceButton
            title={sendingInterest ? "Sending..." : "I want to become a member"}
            onPress={onMembershipInterest}
            variant="secondary"
            fullWidth
            disabled={sendingInterest}
            loading={sendingInterest}
          />
        </>
      )}
      {membershipStatus?.sent && (
        <>
          <FlexibleSpacer bottom size={12} />
          <GymForceButton
            title="Gym hasn't reached out yet?"
            onPress={onGymContact}
            variant="tertiary"
            fullWidth
          />
        </>
      )}
    </View>
  </View>
);
const GymCard: React.FC<GymCardProps> = ({
  showCheckIn = true,
  requireAttestation = false,
  gym = null,
}) => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const { fetchCheckInHistory } = useCheckInContext();
  const [isModalVisible, setModalVisible] = useState(false);
  const [claimingMembership, setClaimingMembership] = useState(false);

  const {
    membershipStatus,
    sendingInterest,
    handleExistingMember,
    handleMembershipInterest,
    handleGymContact,
    isLoading,
  } = useMembershipStatus(gym);

  const handleExistingMemberWithLoading = async () => {
    setClaimingMembership(true);
    try {
      await handleExistingMember();
    } finally {
      setClaimingMembership(false);
    }
  };

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
      setModalVisible(true);
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  if (!gym) {
    return (
      <CardWithIconBackground
        iconLibrary="MaterialCommunityIcons"
        iconName="weight-lifter"
      >
        <View style={styles.mainAction}>
          <GymForceButton
            fullWidth={true}
            title="Find a Gym"
            variant="primary"
            onPress={handleEditOrFindGym}
            size="large"
          />
        </View>
      </CardWithIconBackground>
    );
  }
  const canCheckIn =
    !gym?.isOnNetwork || membershipStatus?.userClaimedMembership === true;
  return (
    <CardWithIconBackground
      iconLibrary="MaterialCommunityIcons"
      iconName="weight-lifter"
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <GymForceText>Checking membership status...</GymForceText>
        </View>
      ) : gym?.isOnNetwork && !membershipStatus?.userClaimedMembership ? (
        <MembershipOptions
          gym={gym}
          membershipStatus={membershipStatus}
          onExistingMember={handleExistingMemberWithLoading}
          onMembershipInterest={handleMembershipInterest}
          onGymContact={handleGymContact}
          sendingInterest={sendingInterest}
          claimingMembership={claimingMembership}
          isLoading={isLoading}
        />
      ) : (
        <NetworkGymContent
          gym={gym}
          onCheckIn={handleCheckIn}
          onEditGym={handleEditOrFindGym}
          onGetDirections={handleGetDirections}
          showCheckIn={showCheckIn}
          canCheckIn={canCheckIn}
        />
      )}

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
  mainAction: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
    width: "100%",
    paddingHorizontal: 16,
  },
  membershipOptions: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  membershipTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a265a",
    textAlign: "center",
    marginBottom: 8,
  },
  membershipSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
});

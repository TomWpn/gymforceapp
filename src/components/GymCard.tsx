import React, { useState, useEffect } from "react";
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
import {
  sendMembershipInterest,
  checkMembershipInterestStatus,
  claimMembership,
} from "../services/membershipService";

type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

interface GymCardProps {
  showCheckIn?: boolean;
  requireAttestation?: boolean;
}

const GymCard: React.FC<GymCardProps> = ({
  showCheckIn = true,
  requireAttestation = false,
}) => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const { userProfile } = useUserProfileContext();
  const { fetchCheckInHistory } = useCheckInContext();
  const [isModalVisible, setModalVisible] = useState(false);
  const [showMembershipOptions, setShowMembershipOptions] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<{
    userClaimedMembership: boolean;
    userClaimedMembershipAt?: Date;
    sent?: boolean;
    sentAt?: Date;
  } | null>(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const gym = userProfile?.gym;

  useEffect(() => {
    const checkStatus = async () => {
      if (gym?.id && auth.currentUser && requireAttestation) {
        try {
          const status = await checkMembershipInterestStatus(
            auth.currentUser.uid,
            gym.id
          );
          setMembershipStatus({
            userClaimedMembership: status?.userClaimedMembership || false,
            userClaimedMembershipAt: status?.userClaimedMembershipAt,
            sent: status?.sent || false,
            sentAt: status?.sentAt,
          });
        } catch (error) {
          console.error("Error checking membership status:", error);
        }
      }
    };
    checkStatus();
  }, [gym?.id, requireAttestation]);

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

  const handleExistingMember = async () => {
    if (!gym?.id) return;

    try {
      await claimMembership(auth.currentUser?.uid || "anonymous", gym.id);
      setMembershipStatus((prev) => ({
        ...prev!,
        userClaimedMembership: true,
        userClaimedMembershipAt: new Date(),
      }));
      setShowMembershipOptions(false);
      Alert.alert("Welcome!", "You can now start checking in at this gym!");
    } catch (error) {
      console.error("Error claiming membership:", error);
      Alert.alert(
        "Error",
        "There was a problem. Please try again or contact support."
      );
    }
  };

  const handleMembershipInterest = async () => {
    if (!gym?.id) return;

    try {
      setSendingInterest(true);

      if (auth.currentUser?.email && userProfile?.name) {
        await sendMembershipInterest({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          userName: userProfile.name,
          userPhone: userProfile.phone,
          gymId: gym.id,
        });
        setMembershipStatus((prev) => ({
          ...prev!,
          sent: true,
          sentAt: new Date(),
        }));
        Alert.alert(
          "Thank you!",
          "We've notified the gym of your interest. They will contact you about membership options."
        );
      } else {
        Alert.alert(
          "Profile Required",
          "Please complete your profile with email and name to express interest in membership."
        );
      }
    } catch (error) {
      console.error("Error in membership process:", error);
      Alert.alert(
        "Error",
        "There was a problem sending your membership interest. Please try again or contact support."
      );
    } finally {
      setSendingInterest(false);
    }
  };

  const handleGymContact = () => {
    Alert.alert(
      "Gym Contact",
      "If the gym hasn't contacted you yet, feel free to visit during business hours or give them a call!"
    );
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderMembershipOptions = () => (
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
            membershipStatus?.sent
              ? "I have become a member"
              : "I am already a member"
          }
          onPress={handleExistingMember}
          variant="primary"
          fullWidth
        />
        {!membershipStatus?.sent && (
          <>
            <FlexibleSpacer bottom size={12} />
            <GymForceButton
              title="I want to become a member"
              onPress={handleMembershipInterest}
              variant="secondary"
              fullWidth
              disabled={sendingInterest}
            />
          </>
        )}
        {membershipStatus?.sent && (
          <>
            <FlexibleSpacer bottom size={12} />
            <GymForceButton
              title="Gym hasn't reached out yet?"
              onPress={handleGymContact}
              variant="tertiary"
              fullWidth
            />
          </>
        )}
      </View>
    </View>
  );

  const renderMemberContent = () => (
    <View>
      <NoMarginView>
        <GymForceText type="Title" color="primary">
          {gym?.properties.name}
        </GymForceText>
        <GymForceText type="Note" color="#666666">
          {gym?.properties.address}, {gym?.properties.city},{" "}
          {gym?.properties.state}
        </GymForceText>
        <FlexibleSpacer size={8} bottom />
      </NoMarginView>

      {showCheckIn &&
        (!requireAttestation || membershipStatus?.userClaimedMembership) && (
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

      <View style={styles.secondaryActions}>
        <GymForceButton
          title="Change Your Gym"
          onPress={handleEditOrFindGym}
          size="small"
          variant="primary"
        />
        <GymForceButton
          title="Get Directions"
          variant="tertiary"
          onPress={handleGetDirections}
          size="small"
        />
      </View>
    </View>
  );

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

  return (
    <CardWithIconBackground
      iconLibrary="MaterialCommunityIcons"
      iconName="weight-lifter"
    >
      {requireAttestation && !membershipStatus?.userClaimedMembership
        ? renderMembershipOptions()
        : renderMemberContent()}

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
});

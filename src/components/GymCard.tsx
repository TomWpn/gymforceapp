import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
import SkeletonLoader from "./SkeletonLoader";
import { useContestContext } from "../context/ContestContext";
import { CheckInContestModal } from "./CheckInContest";
import { useCheckInEligibility } from "../hooks/useCheckInEligibility";
import { formatContestDuration } from "../utils/contestUtils";

type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

interface GymCardProps {
  showCheckIn?: boolean;
  requireAttestation?: boolean;
  gym?: any;
  onAttestationComplete?: () => void;
}

const ContestBanner: React.FC<{
  gym: any;
  onPress: () => void;
}> = ({ gym, onPress }) => {
  const { isContestEnabled, activeContest, getUserRank } = useContestContext();

  if (!isContestEnabled || !activeContest) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.contestBanner}>
      <View style={styles.contestBannerContent}>
        <View style={styles.contestHeader}>
          <GymForceText
            type="Title"
            color="#FFD700"
            style={styles.contestTitle}
          >
            🏆 Check-In Contest
          </GymForceText>
          <GymForceText
            type="Note"
            color="#FFFFFF"
            style={styles.contestPeriod}
          >
            {formatContestDuration(activeContest.endDate, true)}
          </GymForceText>
        </View>
        {getUserRank() > 0 && (
          <View style={styles.userRankBadge}>
            <GymForceText type="Note" color="#FFFFFF" style={styles.rankText}>
              Your Rank: #{getUserRank()}
            </GymForceText>
          </View>
        )}
      </View>
      <GymForceText type="Note" color="#CCCCCC" style={styles.tapToView}>
        Tap to view leaderboard →
      </GymForceText>
    </TouchableOpacity>
  );
};

const NetworkGymContent: React.FC<{
  gym: any;
  onCheckIn: () => void;
  onEditGym: () => void;
  onGetDirections: () => void;
  showCheckIn: boolean;
  canCheckIn: boolean;
  onContestPress: () => void;
  isCheckingIn: boolean;
}> = ({
  gym,
  onCheckIn,
  onEditGym,
  onGetDirections,
  showCheckIn,
  canCheckIn,
  onContestPress,
  isCheckingIn,
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

    <ContestBanner gym={gym} onPress={onContestPress} />

    {showCheckIn && canCheckIn && (
      <View style={styles.mainAction}>
        <GymForceButton
          fullWidth={true}
          title="Check In"
          variant="secondary"
          onPress={onCheckIn}
          size="large"
          loading={isCheckingIn}
          disabled={isCheckingIn}
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
  onAttestationComplete,
}) => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const { fetchCheckInHistory, logUserCheckIn } = useCheckInContext();
  const [isModalVisible, setModalVisible] = useState(false);
  const [claimingMembership, setClaimingMembership] = useState(false);
  const [isContestModalVisible, setContestModalVisible] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Create animated values for fade-in effect
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const {
    membershipStatus,
    sendingInterest,
    handleExistingMember,
    handleMembershipInterest,
    handleGymContact,
    isLoading,
  } = useMembershipStatus(gym);

  const {
    eligibility,
    loading: eligibilityLoading,
    refetchEligibility,
  } = useCheckInEligibility();

  // Animate opacity when loading state changes
  useEffect(() => {
    if (isLoading) {
      // When loading starts, immediately show loader and hide content
      loadingOpacity.setValue(1);
      contentOpacity.setValue(0);
    } else {
      // When loading ends, fade out loader and fade in content
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, loadingOpacity, contentOpacity]);

  const handleExistingMemberWithLoading = async () => {
    setClaimingMembership(true);
    try {
      await handleExistingMember();
      // Notify parent component that attestation is complete
      if (onAttestationComplete) {
        onAttestationComplete();
      }
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
    // Prevent duplicate submissions
    if (isCheckingIn) {
      console.log(
        "⏳ Check-in already in progress, ignoring duplicate request"
      );
      return;
    }

    try {
      setIsCheckingIn(true);

      // First check if user is eligible to check in
      if (!eligibility?.canCheckIn) {
        Alert.alert(
          "Cannot Check In",
          eligibility?.reason ||
            "You are not eligible to check in at this time."
        );
        return;
      }

      const gymId = gym?.id;

      if (!gymId) {
        console.error("Check-in failed: Missing gym information.");
        return;
      }

      console.log("🏋️ Starting check-in process for gym:", gym.properties.name);
      await logUserCheckIn(gymId, gym.properties.name!);
      console.log("✅ Check-in completed successfully");

      // Refresh eligibility after successful check-in
      await refetchEligibility();

      setModalVisible(true);
    } catch (error) {
      console.error("❌ Error checking in:", error);

      // Check if it's a validation error from Firebase Function
      if (
        error instanceof Error &&
        error.message.includes("already checked in")
      ) {
        Alert.alert(
          "Already Checked In",
          "You can only check in once per day. You've already checked in today!"
        );
        // Refresh eligibility to update UI state
        await refetchEligibility();
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleContestPress = () => {
    setContestModalVisible(true);
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
      {/* Loading skeleton with fade-out animation */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: loadingOpacity,
            position: "absolute",
            zIndex: isLoading ? 1 : 0,
            width: "100%",
            left: "5%",
            right: 0,
          },
        ]}
        pointerEvents={isLoading ? "auto" : "none"}
      >
        <SkeletonLoader height={24} style={styles.skeletonTitle} />
        <SkeletonLoader
          height={12}
          style={styles.skeletonSubtitle}
          width="70%"
        />
        <FlexibleSpacer top size={12} />
        <SkeletonLoader height={40} style={styles.skeletonButton} />
        <FlexibleSpacer top size={8} />
        <SkeletonLoader height={32} style={styles.skeletonButton} />
        <GymForceText type="Note" color="#1a265a" style={styles.loadingText}>
          Checking membership status...
        </GymForceText>
      </Animated.View>

      {/* Content with fade-in animation */}
      <Animated.View
        style={{ opacity: contentOpacity, width: "100%" }}
        pointerEvents={isLoading ? "none" : "auto"}
      >
        {gym?.isOnNetwork && !membershipStatus?.userClaimedMembership ? (
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
            onContestPress={handleContestPress}
            isCheckingIn={isCheckingIn}
          />
        )}
      </Animated.View>

      <CheckInConfirmationModal
        isVisible={isModalVisible}
        onClose={closeModal}
        gymName={gym?.properties.name!}
      />

      <CheckInContestModal
        isVisible={isContestModalVisible}
        onClose={() => setContestModalVisible(false)}
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
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    minWidth: "100%",
    paddingHorizontal: 16,
  },
  // Skeleton styles
  skeletonTitle: {
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: "#E8E8E8",
  },
  skeletonSubtitle: {
    marginBottom: 6,
    borderRadius: 4,
    backgroundColor: "#E8E8E8",
  },
  skeletonButton: {
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: "#E8E8E8",
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
    color: "#1a265a",
    fontSize: 14,
  },
  // Contest banner styles
  contestBanner: {
    backgroundColor: "#2B2D42", // More neutral navy background
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  contestBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contestHeader: {
    flex: 1,
  },
  contestTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  contestPeriod: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
  userRankBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tapToView: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});

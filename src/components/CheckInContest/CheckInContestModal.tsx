import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useContestContext } from "../../context/ContestContext";
import ContestLeaderboard from "./ContestLeaderboard";
import {
  contestStyles,
  contestColors,
  contestSizes,
} from "./styles/contestStyles";

interface CheckInContestModalProps {
  isVisible: boolean;
  onClose: () => void;
  gymName?: string;
  onCheckIn?: () => void;
}

const CheckInContestModal: React.FC<CheckInContestModalProps> = ({
  isVisible,
  onClose,
  gymName = "Gym",
  onCheckIn,
}) => {
  const { isContestEnabled, activeContest, isLoading } = useContestContext();

  // Rules expansion state
  const [rulesExpanded, setRulesExpanded] = useState(false);

  // Animation values
  const translateY = useSharedValue(1000);
  const backdropOpacity = useSharedValue(0);
  const rulesHeight = useSharedValue(0);
  const arrowRotation = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(1000, { duration: 300 });
    }
  }, [isVisible, backdropOpacity, translateY]);

  // Rules expansion effect
  React.useEffect(() => {
    if (rulesExpanded) {
      rulesHeight.value = withSpring(120, { damping: 25, stiffness: 120 });
      arrowRotation.value = withSpring(180, { damping: 25, stiffness: 120 });
    } else {
      rulesHeight.value = withSpring(0, { damping: 25, stiffness: 120 });
      arrowRotation.value = withSpring(0, { damping: 25, stiffness: 120 });
    }
  }, [rulesExpanded, rulesHeight, arrowRotation]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const rulesAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: rulesHeight.value,
      opacity: rulesHeight.value > 0 ? 1 : 0,
    };
  });

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${arrowRotation.value}deg` }],
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleBackdropPress = () => {
    onClose();
  };

  const handleCheckIn = () => {
    onCheckIn?.();
  };

  const toggleRules = () => {
    setRulesExpanded(!rulesExpanded);
  };

  if (!isContestEnabled) {
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View style={[contestStyles.card, { margin: contestSizes.lg }]}>
            <Text style={contestStyles.headerTitle}>Contest Not Available</Text>
            <Text
              style={[
                contestStyles.headerSubtitle,
                { marginTop: contestSizes.md },
              ]}
            >
              No active contest at the moment. Check back later!
            </Text>
            <TouchableOpacity
              style={[
                contestStyles.primaryButton,
                { marginTop: contestSizes.lg },
              ]}
              onPress={onClose}
            >
              <Text style={contestStyles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          },
          backdropStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </Animated.View>
      {/* Modal Content */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: "10%",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: contestColors.white,
            borderTopLeftRadius: contestSizes.radiusXl,
            borderTopRightRadius: contestSizes.radiusXl,
          },
          modalStyle,
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Modal Header */}
          <View
            style={[
              contestStyles.header,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: contestSizes.lg,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={contestStyles.headerTitle}>Check-In Contest</Text>
              <Text style={contestStyles.headerSubtitle}>
                Compete with other members at {gymName}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: contestColors.gray100,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: contestSizes.md,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: contestColors.gray600,
                  fontWeight: "bold",
                }}
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={contestStyles.loadingContainer}>
              <Text style={contestStyles.loadingText}>
                Loading contest data...
              </Text>
            </View>
          ) : (
            <ContestLeaderboard onCheckIn={handleCheckIn} onClose={onClose} />
          )}

          {/* Collapsible Rules Section */}
          <View
            style={[
              contestStyles.card,
              {
                margin: contestSizes.lg,
                marginTop: 0,
                backgroundColor: contestColors.gray100,
              },
            ]}
          >
            {/* Rules Toggle Button */}
            <TouchableOpacity
              onPress={toggleRules}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: contestSizes.xs,
                paddingHorizontal: contestSizes.xs,
                borderRadius: contestSizes.radiusBase,
                backgroundColor: "transparent",
              }}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  contestStyles.headerSubtitle,
                  {
                    fontWeight: "600",
                    color: contestColors.primary,
                    marginBottom: 0,
                    textDecorationLine: "underline",
                    textDecorationColor: contestColors.primary,
                  },
                ]}
              >
                Contest Rules{" "}
                {rulesExpanded ? "(tap to hide)" : "(tap to view)"}
              </Text>
              <Animated.Text
                style={[
                  contestStyles.headerSubtitle,
                  {
                    color: contestColors.primary,
                    fontSize: 18,
                    fontWeight: "600",
                  },
                  arrowAnimatedStyle,
                ]}
              >
                ▼
              </Animated.Text>
            </TouchableOpacity>

            {/* Animated Rules Content */}
            <Animated.View
              style={[
                rulesAnimatedStyle,
                {
                  overflow: "hidden",
                  marginTop: rulesExpanded ? contestSizes.sm : 0,
                },
              ]}
            >
              <View style={{ gap: contestSizes.xs }}>
                <Text
                  style={[
                    contestStyles.userStats,
                    { fontSize: contestSizes.textSm },
                  ]}
                >
                  • Check in at the gym to earn points
                </Text>
                <Text
                  style={[
                    contestStyles.userStats,
                    { fontSize: contestSizes.textSm },
                  ]}
                >
                  • Maintain your streak for bonus points
                </Text>
                <Text
                  style={[
                    contestStyles.userStats,
                    { fontSize: contestSizes.textSm },
                  ]}
                >
                  • Contest resets{" "}
                  {activeContest?.type === "weekly"
                    ? "every Sunday"
                    : "monthly"}
                </Text>
                <Text
                  style={[
                    contestStyles.userStats,
                    { fontSize: contestSizes.textSm },
                  ]}
                >
                  • Winners receive exclusive rewards and recognition
                </Text>
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

export default CheckInContestModal;

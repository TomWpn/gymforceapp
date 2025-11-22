import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { ContestUser, ContestStats } from "../../types/contest";
import { useContestContext } from "../../context/ContestContext";
import ContestUserCard from "./ContestUserCard";
import {
  contestStyles,
  contestColors,
  contestSizes,
} from "./styles/contestStyles";
import { formatContestDuration } from "../../utils/contestUtils";
import { useCheckInEligibility } from "../../hooks/useCheckInEligibility";

interface ContestLeaderboardProps {
  onCheckIn?: () => void;
  onClose?: () => void;
}

const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({
  onCheckIn,
  onClose,
}) => {
  const {
    activeContest,
    userParticipation,
    leaderboard,
    contestStats,
    isLoading,
    isLoadingLeaderboard,
    refreshLeaderboard,
    updateContestScore,
    getUserRank,
    getUserPoints,
    isUserInContest,
  } = useContestContext();

  const { eligibility, refetchEligibility } = useCheckInEligibility();

  const [animatingUserId, setAnimatingUserId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  const handleCheckIn = useCallback(async () => {
    if (!activeContest) return;

    // Check eligibility first
    if (!eligibility?.canCheckIn) {
      Alert.alert(
        "Cannot Check In",
        eligibility?.reason || "You are not eligible to check in at this time."
      );
      return;
    }

    try {
      // Update contest score (auto-joins if not already participating)
      await updateContestScore();

      // Refresh eligibility after successful check-in
      await refetchEligibility();

      // Show celebration animation
      setAnimatingUserId(userParticipation?.userId || "");
      setShowCelebration(true);

      // Trigger confetti animation
      celebrationScale.value = withSequence(
        withSpring(1.2, { duration: 300 }),
        withSpring(1, { duration: 300 })
      );

      celebrationOpacity.value = withSequence(
        withSpring(1, { duration: 300 }),
        withSpring(0, { duration: 1000 }, () => {
          runOnJS(setShowCelebration)(false);
          runOnJS(setAnimatingUserId)(null);
        })
      );

      // Call external check-in handler
      onCheckIn?.();
    } catch (error) {
      console.error("Error during check-in:", error);

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
      } else {
        Alert.alert("Error", "Failed to check in. Please try again.");
      }
    }
  }, [
    activeContest,
    eligibility,
    updateContestScore,
    refetchEligibility,
    userParticipation,
    celebrationScale,
    celebrationOpacity,
    onCheckIn,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshLeaderboard();
      await refetchEligibility();
    } finally {
      setRefreshing(false);
    }
  }, [refreshLeaderboard, refetchEligibility]);

  const getPointsBreakdown = useCallback(() => {
    if (!userParticipation) return [];

    const breakdown = [
      {
        label: `${userParticipation.checkIns} check-ins × 10 points each`,
        points: userParticipation.checkIns * 10,
        type: "checkins",
      },
    ];

    // Future: Add streak bonuses, perfect week bonuses, etc.
    // if (userParticipation.streak >= 7) {
    //   breakdown.push({
    //     label: `Weekly streak bonus`,
    //     points: Math.floor(userParticipation.streak / 7) * 20,
    //     type: 'streak'
    //   });
    // }

    return breakdown;
  }, [userParticipation]);

  const celebrationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: celebrationScale.value }],
      opacity: celebrationOpacity.value,
    };
  });

  const renderUserCard = ({
    item,
    index,
  }: {
    item: ContestUser;
    index: number;
  }) => (
    <ContestUserCard
      user={item}
      isAnimating={animatingUserId === item.userId}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Contest Header */}
      <View style={contestStyles.header}>
        <Text style={contestStyles.headerTitle}>
          {activeContest?.title || "Check-In Contest"}
        </Text>
        <Text style={contestStyles.headerSubtitle}>
          {activeContest
            ? formatContestDuration(activeContest.endDate)
            : "Contest ending soon"}
        </Text>
      </View>

      {/* Contest Content */}
      <View style={contestStyles.contentContainer}>
        {/* User Stats Card */}
        {isUserInContest() && userParticipation && (
          <View
            style={[
              contestStyles.card,
              { backgroundColor: contestColors.gray100 },
            ]}
          >
            {/* Position and Points */}
            <View
              style={[
                contestStyles.progressContainer,
                { marginBottom: contestSizes.md },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={contestStyles.headerSubtitle}>Your Position</Text>
                <Text
                  style={[
                    contestStyles.userPoints,
                    { fontSize: contestSizes.text3xl },
                  ]}
                >
                  #{getUserRank()}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={contestStyles.headerSubtitle}>Total Points</Text>
                <Text
                  style={[
                    contestStyles.userPoints,
                    { fontSize: contestSizes.text3xl },
                  ]}
                >
                  {getUserPoints()}
                </Text>
              </View>
            </View>

            {/* Points Breakdown */}
            <View
              style={[
                contestStyles.card,
                {
                  backgroundColor: contestColors.white,
                  marginBottom: contestSizes.md,
                },
              ]}
            >
              <Text
                style={[
                  contestStyles.headerSubtitle,
                  { marginBottom: contestSizes.sm },
                ]}
              >
                Points Breakdown
              </Text>
              {getPointsBreakdown().map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom:
                      index < getPointsBreakdown().length - 1
                        ? contestSizes.xs
                        : 0,
                  }}
                >
                  <Text style={contestStyles.userStats}>{item.label}</Text>
                  <Text
                    style={[
                      contestStyles.userPoints,
                      { fontSize: contestSizes.textLg },
                    ]}
                  >
                    {item.points} pts
                  </Text>
                </View>
              ))}

              {/* Show current streak info */}
              {userParticipation.streak > 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: contestSizes.sm,
                    paddingTop: contestSizes.sm,
                    borderTopWidth: 1,
                    borderTopColor: contestColors.gray200,
                  }}
                >
                  <Text
                    style={[
                      contestStyles.userStats,
                      { color: contestColors.warning },
                    ]}
                  >
                    🔥 {userParticipation.streak} day streak
                  </Text>
                  <Text
                    style={[
                      contestStyles.userStats,
                      { fontWeight: "600", fontSize: 12 },
                    ]}
                  >
                    Streak bonuses coming soon!
                  </Text>
                </View>
              )}

              {/* Total line */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: contestSizes.sm,
                  paddingTop: contestSizes.sm,
                  borderTopWidth: 2,
                  borderTopColor: contestColors.primary,
                }}
              >
                <Text
                  style={[
                    contestStyles.userStats,
                    { fontWeight: "600", fontSize: contestSizes.textBase },
                  ]}
                >
                  Total Points
                </Text>
                <Text
                  style={[
                    contestStyles.userPoints,
                    { fontSize: contestSizes.textXl, fontWeight: "bold" },
                  ]}
                >
                  {getUserPoints()} pts
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Info for new users */}
        {!isUserInContest() && (
          <View style={contestStyles.card}>
            <Text style={contestStyles.headerSubtitle}>
              Check in at the gym to automatically join the contest and start
              earning points!
            </Text>
          </View>
        )}

        {/* Leaderboard Header */}
        <Text
          style={[
            contestStyles.headerTitle,
            { fontSize: contestSizes.textXl, marginTop: contestSizes.lg },
          ]}
        >
          Leaderboard
        </Text>

        {/* Contest Stats */}
        <View
          style={[
            contestStyles.statsContainer,
            { marginTop: contestSizes.md, marginBottom: contestSizes.md },
          ]}
        >
          <View style={contestStyles.statItem}>
            <Text style={contestStyles.statValue}>
              {contestStats.totalParticipants}
            </Text>
            <Text style={contestStyles.statLabel}>Participants</Text>
          </View>
          <View style={contestStyles.statItem}>
            <Text style={contestStyles.statValue}>
              {contestStats.totalCheckIns}
            </Text>
            <Text style={contestStyles.statLabel}>Total Check-ins</Text>
          </View>
          <View style={contestStyles.statItem}>
            <Text style={contestStyles.statValue}>
              {contestStats.averageCheckIns}
            </Text>
            <Text style={contestStyles.statLabel}>Avg per Person</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ paddingBottom: contestSizes.xl }}>
      {/* Footer content if needed */}
    </View>
  );

  const renderEmptyState = () => (
    <View style={contestStyles.emptyContainer}>
      <Text style={contestStyles.emptyText}>
        No participants yet. Be the first to join the contest!
      </Text>
    </View>
  );

  if (!activeContest) {
    return (
      <View style={contestStyles.emptyContainer}>
        <Text style={contestStyles.emptyText}>
          No active contest at the moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={contestStyles.container}>
      <FlatList
        data={leaderboard}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingBottom: contestSizes.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={contestColors.primary}
            colors={[contestColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Loading Overlay */}
      {isLoadingLeaderboard && (
        <View
          style={[
            contestStyles.loadingContainer,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: contestColors.white + "80",
            },
          ]}
        >
          <ActivityIndicator size="large" color={contestColors.primary} />
          <Text style={contestStyles.loadingText}>Loading leaderboard...</Text>
        </View>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
            },
            celebrationStyle,
          ]}
        >
          <View
            style={{
              backgroundColor: contestColors.success,
              borderRadius: 50,
              width: 100,
              height: 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>🎉</Text>
            <Text style={{ color: contestColors.white, fontWeight: "bold" }}>
              +10
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default ContestLeaderboard;

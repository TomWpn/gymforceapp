import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { ContestUser } from "../../types/contest";
import {
  contestStyles,
  contestColors,
  contestSizes,
} from "./styles/contestStyles";

interface ContestUserCardProps {
  user: ContestUser;
  onPress?: () => void;
  isAnimating?: boolean;
}

const ContestUserCard: React.FC<ContestUserCardProps> = ({
  user,
  onPress,
  isAnimating = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankStyles = (rank: number) => {
    if (rank === 1) {
      return {
        container: contestStyles.rankContainerGold,
        text: contestStyles.rankTextGold,
      };
    }
    if (rank === 2) {
      return {
        container: contestStyles.rankContainerSilver,
        text: contestStyles.rankTextSilver,
      };
    }
    if (rank === 3) {
      return {
        container: contestStyles.rankContainerBronze,
        text: contestStyles.rankTextBronze,
      };
    }
    return {
      container: contestStyles.rankContainerDefault,
      text: contestStyles.rankTextDefault,
    };
  };

  const getLastCheckInText = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const rankStyles = getRankStyles(user.rank);

  // Animation effect for when user gets points
  React.useEffect(() => {
    if (isAnimating) {
      scale.value = withSequence(
        withSpring(1.05, { duration: 300 }),
        withSpring(1, { duration: 300 })
      );

      opacity.value = withSequence(
        withSpring(0.8, { duration: 150 }),
        withSpring(1, { duration: 150 })
      );
    }
  }, [isAnimating, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const cardStyle = [
    contestStyles.userCard,
    user.isCurrentUser
      ? contestStyles.userCardCurrent
      : contestStyles.userCardDefault,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {/* Rank Indicator */}
        <View style={[contestStyles.rankContainer, rankStyles.container]}>
          <Text style={[contestStyles.rankText, rankStyles.text]}>
            {getRankIcon(user.rank)}
          </Text>
        </View>

        {/* User Avatar */}
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={contestStyles.avatar} />
        ) : (
          <View style={contestStyles.avatarPlaceholder}>
            <Text style={contestStyles.rankTextDefault}>
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* User Info */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Text
              style={[contestStyles.userName, { flex: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.displayName}
            </Text>
            {user.isCurrentUser && (
              <View
                style={[
                  contestStyles.badge,
                  contestStyles.badgePrimary,
                  { marginLeft: 6 },
                ]}
              >
                <Text style={contestStyles.badgeText}>You</Text>
              </View>
            )}
          </View>

          {/* Compact stats layout */}
          <Text
            style={[contestStyles.userStats, { marginTop: 1 }]}
            numberOfLines={1}
          >
            {user.checkIns} check-ins • 🔥 {user.streak} streak
          </Text>

          <Text
            style={[contestStyles.userStats, { marginTop: 1, fontSize: 12 }]}
            numberOfLines={1}
          >
            Last: {getLastCheckInText(user.lastCheckIn)}
          </Text>
        </View>

        {/* Points */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={contestStyles.userPoints}>{user.points}</Text>
          <Text style={[contestStyles.userStats, { marginTop: 2 }]}>
            points
          </Text>
        </View>

        {/* Animation indicator */}
        {isAnimating && (
          <View
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              backgroundColor: contestColors.success,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: contestColors.white,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              +
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ContestUserCard;

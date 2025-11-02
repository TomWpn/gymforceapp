import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { ContestPeriod } from "../../types/contest";
import { contestStyles, contestColors } from "./styles/contestStyles";

interface ContestPeriodToggleProps {
  period: ContestPeriod;
  onPeriodChange: (type: "weekly" | "monthly") => void;
  disabled?: boolean;
}

const ContestPeriodToggle: React.FC<ContestPeriodToggleProps> = ({
  period,
  onPeriodChange,
  disabled = false,
}) => {
  const animatedValue = useSharedValue(period.type === "weekly" ? 0 : 1);

  React.useEffect(() => {
    animatedValue.value = withSpring(period.type === "weekly" ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [period.type, animatedValue]);

  const weeklyButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [contestColors.primary, "transparent"]
    );

    return {
      backgroundColor,
    };
  });

  const monthlyButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      ["transparent", contestColors.primary]
    );

    return {
      backgroundColor,
    };
  });

  const weeklyTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animatedValue.value,
      [0, 1],
      [contestColors.white, contestColors.gray600]
    );

    return {
      color,
    };
  });

  const monthlyTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animatedValue.value,
      [0, 1],
      [contestColors.gray600, contestColors.white]
    );

    return {
      color,
    };
  });

  return (
    <View style={contestStyles.toggleContainer}>
      <TouchableOpacity
        style={[contestStyles.toggleButton]}
        onPress={() => onPeriodChange("weekly")}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            contestStyles.toggleButton,
            weeklyButtonStyle,
            { position: "absolute", top: 4, left: 4, right: "50%", bottom: 4 },
          ]}
        />
        <Animated.Text
          style={[{ fontSize: 14, fontWeight: "600" }, weeklyTextStyle]}
        >
          Weekly
        </Animated.Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[contestStyles.toggleButton]}
        onPress={() => onPeriodChange("monthly")}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            contestStyles.toggleButton,
            monthlyButtonStyle,
            { position: "absolute", top: 4, left: "50%", right: 4, bottom: 4 },
          ]}
        />
        <Animated.Text
          style={[{ fontSize: 14, fontWeight: "600" }, monthlyTextStyle]}
        >
          Monthly
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContestPeriodToggle;

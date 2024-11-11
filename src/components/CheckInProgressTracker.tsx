import React from "react";
import { View, StyleSheet } from "react-native";
import ProgressBar from "react-native-progress/Bar"; // Assuming you have `react-native-progress` installed
import GymForceText from "./GymForceText";
import { useCheckInContext } from "../context/CheckInContext";

const CheckInProgressTracker: React.FC = () => {
  const { totalCheckInCount } = useCheckInContext();

  // Assuming a milestone goal; can be adjusted based on app requirements
  const milestoneGoal = 30;
  const progress = Math.min(totalCheckInCount / milestoneGoal, 1); // Progress as a fraction

  // Determine progress state
  const progressState =
    totalCheckInCount === 0
      ? "Not Started"
      : totalCheckInCount >= milestoneGoal
      ? "Complete"
      : "In Progress";

  // Display message based on progress state
  let message = "";
  if (progressState === "Not Started") {
    message = "Start checking in to reach your milestone!";
  } else if (progressState === "In Progress") {
    message = `Only ${
      milestoneGoal - totalCheckInCount
    } check-ins left to complete your goal!`;
  } else if (progressState === "Complete") {
    message = "Congratulations! You've reached your check-in milestone!";
  }

  return (
    <View style={styles.container}>
      <GymForceText style={styles.title}>Check-In Progress</GymForceText>
      <ProgressBar
        progress={progress}
        width={null} // Full width
        height={10}
        color="#4CAF50"
        unfilledColor="#ddd"
        borderWidth={0}
        style={styles.progressBar}
      />
      <GymForceText
        style={styles.progressText}
      >{`${totalCheckInCount} / ${milestoneGoal} Check-Ins`}</GymForceText>
      <GymForceText style={styles.message}>{message}</GymForceText>
    </View>
  );
};

export default CheckInProgressTracker;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a265a",
    marginBottom: 10,
    textAlign: "center",
  },
  progressBar: {
    marginVertical: 10,
  },
  progressText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    fontStyle: "italic",
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import ProgressBar from "react-native-progress/Bar"; // Assuming `react-native-progress` is installed
import GymForceText from "./GymForceText";
import { useUserProfileContext } from "../context/UserProfileContext";

const WelcomeBonusTracker: React.FC = () => {
  const { userProfile } = useUserProfileContext();

  // Assume these fields exist in the user profile data
  const signupDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt)
    : null; // Date when the user signed up
  const daysOnPlatform = signupDate
    ? Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const maxDays = 90; // Milestone at 90 days

  const progress = Math.min(daysOnPlatform / maxDays, 1); // Progress as a fraction

  // Define milestones
  const milestones = [
    { label: "Sign-Up Bonus", amount: "$250", daysRequired: 0 },
    { label: "90 Days Bonus", amount: "$250", daysRequired: 90 },
  ];

  return (
    <View style={styles.container}>
      <GymForceText style={styles.title}>Welcome Bonus Tracker</GymForceText>
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
      >{`${daysOnPlatform} / ${maxDays} Days`}</GymForceText>

      {/* <View style={styles.milestonesContainer}>
        <GymForceText style={styles.milestonesTitle}>Payouts</GymForceText>
        {milestones.map((milestone, index) => (
          <View key={index} style={styles.milestoneRow}>
            <GymForceText style={styles.milestoneLabel}>
              {milestone.label}
            </GymForceText>
            <GymForceText
              style={[
                styles.milestoneStatus,
                daysOnPlatform >= milestone.daysRequired
                  ? styles.completed
                  : styles.pending,
              ]}
            >
              {daysOnPlatform >= milestone.daysRequired
                ? `Paid: ${milestone.amount}`
                : `Pending: ${milestone.amount}`}
            </GymForceText>
          </View>
        ))}
      </View> */}
    </View>
  );
};

export default WelcomeBonusTracker;

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
    marginBottom: 10,
  },
  milestonesContainer: {
    marginTop: 15,
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a265a",
    marginBottom: 5,
    textAlign: "center",
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  milestoneLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  milestoneStatus: {
    fontSize: 14,
    textAlign: "right",
  },
  completed: {
    color: "#4CAF50",
  },
  pending: {
    color: "#FF9800",
  },
});

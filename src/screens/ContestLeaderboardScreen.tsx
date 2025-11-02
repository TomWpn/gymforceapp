import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ContestLeaderboard } from "../components/CheckInContest";
import GymForceText from "../components/GymForceText";
import GymForceButton from "../components/GymForceButton";

const ContestLeaderboardScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GymForceButton
          title="← Back"
          variant="tertiary"
          size="small"
          onPress={handleBack}
        />
        <GymForceText type="Title" color="primary" style={styles.title}>
          Contest Leaderboard
        </GymForceText>
      </View>

      <View style={styles.content}>
        <ContestLeaderboard />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginRight: 60, // Offset for back button
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default ContestLeaderboardScreen;

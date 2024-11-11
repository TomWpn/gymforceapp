import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import NoMarginView from "./NoMarginView";
import GymForceText from "./GymForceText";
import Padding from "./Padding";
import { useCheckInContext } from "../context/CheckInContext";

const CheckInHistoryCard: React.FC = () => {
  const { groupedCheckInHistory, fetchCheckInHistory } = useCheckInContext();

  useEffect(() => {
    fetchCheckInHistory();
  }, []);

  return (
    <NoMarginView style={styles.card}>
      {groupedCheckInHistory.length > 0 ? (
        groupedCheckInHistory.map((gym, index) => (
          <View key={index} style={styles.historyItem}>
            <GymForceText color="#000" type="Subtitle">
              {gym.gymName}
            </GymForceText>
            <GymForceText color="#a9a9a9" type="Note">
              Last Check-In: {gym.lastCheckInDate}
            </GymForceText>
            <Padding vertical size={8}>
              <GymForceText color="#000">
                Total Check-Ins: {gym.checkInCount}
              </GymForceText>
            </Padding>
          </View>
        ))
      ) : (
        <GymForceText style={styles.noHistory}>No check-ins yet.</GymForceText>
      )}
    </NoMarginView>
  );
};

export default CheckInHistoryCard;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a265a",
    marginBottom: 12,
  },
  historyItem: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
  },
  gymName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noHistory: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
});

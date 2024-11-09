// src/components/CheckInHistoryCard.tsx
import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import { auth } from "../services/firebaseConfig";
import { getCheckInHistory, CheckInRecord } from "../services/checkInService";
import { format } from "date-fns";
import NoMarginView from "./NoMarginView";

interface GroupedCheckIn {
  gymName: string;
  lastCheckInDate: string;
  checkInCount: number;
}

const CheckInHistoryCard: React.FC = () => {
  const [groupedCheckInHistory, setGroupedCheckInHistory] = useState<
    GroupedCheckIn[]
  >([]);

  useEffect(() => {
    const fetchCheckInHistory = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const history = await getCheckInHistory(uid);

        // Group check-ins by gym
        const groupedHistory = history.reduce(
          (acc: Record<string, GroupedCheckIn>, checkIn) => {
            const gymId = checkIn.gymId;
            const gymName = checkIn.gymName; // Assuming checkIn has gymName

            const checkInDate = format(
              new Date(checkIn.timestamp.seconds * 1000),
              "MMMM d, yyyy, h:mm a"
            );

            if (!acc[gymId]) {
              acc[gymId] = {
                gymName,
                lastCheckInDate: checkInDate,
                checkInCount: 1,
              };
            } else {
              acc[gymId].lastCheckInDate = checkInDate; // Update to the latest check-in date
              acc[gymId].checkInCount += 1;
            }

            return acc;
          },
          {}
        );

        setGroupedCheckInHistory(Object.values(groupedHistory));
      } catch (error) {
        console.error("Error fetching check-in history:", error);
      }
    };

    fetchCheckInHistory();
  }, []);

  return (
    <NoMarginView style={styles.card}>
      <Text style={styles.title}>Check-In History</Text>

      {groupedCheckInHistory.length > 0 ? (
        groupedCheckInHistory.map((gym, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.gymName}>{gym.gymName}</Text>
            <Text>Last Check-In: {gym.lastCheckInDate}</Text>
            <Text>Total Check-Ins: {gym.checkInCount}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noHistory}>No check-ins yet.</Text>
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

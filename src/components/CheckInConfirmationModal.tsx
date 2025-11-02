import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Modal,
  Share,
  TouchableOpacity,
} from "react-native";
import GymForceText from "./GymForceText";
import GymForceButton from "./GymForceButton";
import FlexibleSpacer from "./FlexibleSpacer";
import Row from "./Row";
import { useContestContext } from "../context/ContestContext";
import { ContestLeaderboard } from "./CheckInContest";

interface CheckInConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  gymName: string;
}

const CheckInConfirmationModal: React.FC<CheckInConfirmationModalProps> = ({
  isVisible,
  onClose,
  gymName,
}) => {
  const { isContestEnabled, activeContest } = useContestContext();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Reset leaderboard state when modal visibility changes
  useEffect(() => {
    if (!isVisible) {
      setShowLeaderboard(false);
    }
  }, [isVisible]);
  const shareCheckIn = async () => {
    try {
      const result = await Share.share({
        message: `I just checked in at ${gymName}! 💪🏽 #GymForce`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          // console.log("Content shared successfully!");
        }
      } else if (result.action === Share.dismissedAction) {
        // console.log("Sharing dismissed");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // If contest is active and user wants to see leaderboard
  if (showLeaderboard && isContestEnabled && activeContest) {
    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { height: "80%", maxHeight: 600 }]}
          >
            {/* Header */}
            <View style={styles.leaderboardHeader}>
              <TouchableOpacity
                onPress={() => setShowLeaderboard(false)}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <GymForceText
                style={{ fontSize: 20, flex: 1, textAlign: "center" }}
                color="#1a265a"
              >
                Contest Leaderboard
              </GymForceText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Leaderboard */}
            <View style={{ flex: 1 }}>
              <ContestLeaderboard onClose={onClose} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <GymForceText style={{ fontSize: 24 }} color="#1a265a">
            Check-In Successful! 🎉
          </GymForceText>
          <GymForceText style={styles.modalText}>
            You checked in at {gymName}.
          </GymForceText>

          {/* Contest Status */}
          {isContestEnabled && activeContest && (
            <View style={styles.contestSection}>
              <GymForceText style={styles.contestText} color="#1a265a">
                🏆 Contest points earned!
              </GymForceText>
            </View>
          )}

          {/* Contest Leaderboard Button */}
          {isContestEnabled && activeContest && (
            <View>
              <GymForceButton
                size="large"
                title="View Leaderboard"
                fullWidth
                onPress={() => setShowLeaderboard(true)}
                variant="secondary"
              />
              <FlexibleSpacer size={2} top />
            </View>
          )}

          {/* Share Button */}
          <GymForceButton
            size="large"
            title="Share Your Check-In"
            fullWidth
            onPress={shareCheckIn}
          />
          <FlexibleSpacer size={4} top />
          {/* Close Button */}
          <GymForceButton
            fullWidth
            title="Close"
            onPress={onClose}
            variant="tertiary"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
  },
  leaderboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#1a265a",
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  contestSection: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  contestText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
});

export default CheckInConfirmationModal;

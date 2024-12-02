import React from "react";
import { View, Text, Button, StyleSheet, Modal, Share } from "react-native";
import GymForceText from "./GymForceText";
import GymForceButton from "./GymForceButton";
import FlexibleSpacer from "./FlexibleSpacer";
import Row from "./Row";

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
  const shareCheckIn = async () => {
    try {
      const result = await Share.share({
        message: `I just checked in at ${gymName}! 💪🏽 #GymForce`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          console.log("Content shared successfully!");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Sharing dismissed");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

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
});

export default CheckInConfirmationModal;

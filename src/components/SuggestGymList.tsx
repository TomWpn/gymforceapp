import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import GymForceText from "./GymForceText";
import { Gym } from "../types";
import GymForceButton from "./GymForceButton";
import FlexibleSpacer from "./FlexibleSpacer";

const SuggestGymList = ({
  gyms,
  onSuggestGym,
}: {
  gyms: Gym[];
  onSuggestGym: (gym: Gym) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  const openModal = (gym: Gym) => {
    setSelectedGym(gym);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedGym(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={gyms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.gymCard, styles.greyedOutGymCard]}
            onPress={() => openModal(item)}
          >
            <GymForceText type="Subtitle" color="#1a265a">
              {item.properties.name}
            </GymForceText>
            <GymForceText type="Note" color="#666666">
              {item.distance.toFixed(2)} miles from your selected location
            </GymForceText>
            <GymForceText type="Note" color="#f1600d">
              Not on Gym Force network
            </GymForceText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal for suggesting gym */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GymForceText type="Subtitle" color="#1a265a">
              Suggest Gym
            </GymForceText>
            {selectedGym && (
              <GymForceText type="Note" color="#666666">
                Would you like to suggest {selectedGym.properties.name}?
              </GymForceText>
            )}
            <View style={styles.buttonRow}>
              <GymForceButton
                title="Suggest"
                onPress={() => {
                  if (selectedGym) onSuggestGym(selectedGym);
                  closeModal();
                }}
                fullWidth
              />
              <FlexibleSpacer top size={4} />
              <GymForceButton
                title="Cancel"
                onPress={closeModal}
                variant="tertiary"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SuggestGymList;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  gymCard: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  greyedOutGymCard: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  listContainer: {
    paddingVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

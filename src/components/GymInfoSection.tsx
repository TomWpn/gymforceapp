import React from "react";
import { View, StyleSheet, Linking, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useUserProfileContext } from "../context/UserProfileContext";
import { handleOpenMap } from "../services/gymService";
import GymForceText from "./GymForceText";

const GymInfoSection: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  const gym = userProfile?.gym;

  if (!gym) {
    return <GymForceText style={styles.noData}>No gym selected.</GymForceText>;
  }

  const { properties } = gym;

  const handleOpenDomain = () => {
    if (properties.domain) {
      Linking.openURL(`https://${properties.domain}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <GymForceText style={styles.gymName}>{properties.name}</GymForceText>

      {/* Location Section */}
      <TouchableOpacity onPress={() => handleOpenMap(gym!)} style={styles.row}>
        <Icon name="map-marker" size={20} color="#1a265a" />
        <GymForceText style={styles.location}>
          {properties.address}, {properties.city}, {properties.state}
        </GymForceText>
      </TouchableOpacity>

      {/* Domain Section */}
      {properties.domain && (
        <TouchableOpacity onPress={handleOpenDomain} style={styles.row}>
          <Icon name="web" size={20} color="#1a265a" />
          <GymForceText style={styles.domainLink}>
            {properties.domain}
          </GymForceText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GymInfoSection;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  gymName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a265a",
  },
  industry: {
    fontSize: 16,
    color: "#888",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  location: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  domainLink: {
    fontSize: 16,
    color: "#1a265a",
    textDecorationLine: "underline",
    marginLeft: 8,
  },
  additionalInfo: {
    marginTop: 20,
  },
  additionalInfoItem: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  label: {
    fontWeight: "600",
    color: "#1a265a",
  },
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
});

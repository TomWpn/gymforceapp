import React from "react";
import { View, StyleSheet, Linking, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useUserProfileContext } from "../context/UserProfileContext";
import { format } from "date-fns";
import { handleOpenMap } from "../services/gymService";
import GymForceText from "./GymForceText";
import Padding from "./Padding";

const EmployerInfoSection: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  const employer = userProfile?.employer;

  if (!employer) {
    return (
      <GymForceText style={styles.noData}>No employer selected.</GymForceText>
    );
  }

  const { properties } = employer;

  const handleOpenDomain = () => {
    if (properties.domain) {
      Linking.openURL(`https://${properties.domain}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <GymForceText color="#1a265a" type="Title">
        {properties.name}
      </GymForceText>

      {/* Location Section */}
      <TouchableOpacity
        onPress={() => handleOpenMap(employer!)}
        style={styles.row}
      >
        <Icon name="map-marker" size={20} color="#1a265a" />
        <Padding horizontal size={4}>
          <GymForceText color="#1a265a" textAlign="left" type="Note">
            {properties.address}, {properties.city}, {properties.state}
          </GymForceText>
        </Padding>
      </TouchableOpacity>

      {/* Domain Section */}
      {properties.domain && (
        <TouchableOpacity onPress={handleOpenDomain} style={styles.row}>
          <Icon name="web" size={20} color="#1a265a" />
          <Padding horizontal size={4}>
            <GymForceText color="#1a265a" type="Note">
              {properties.domain}
            </GymForceText>
          </Padding>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmployerInfoSection;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  employerName: {
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

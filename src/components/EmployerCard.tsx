// src/components/EmployerCard.tsx
import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Company } from "../types";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "./GymForceButton";
import NoMarginView from "./NoMarginView";
import Spacer from "./Spacer";

type EmployerCardProps = {
  employer: Company | undefined;
};

type EmployerSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "EmployerSelection"
>;

const EmployerCard: React.FC<EmployerCardProps> = ({ employer }) => {
  const navigation = useNavigation<EmployerSelectionNavigationProp>();

  const handleEditEmployer = () => {
    navigation.navigate("EmployerSelection", { mode: "edit" });
  };

  return (
    <NoMarginView style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {employer?.properties.name || "No Employer Selected"}
        </Text>
      </View>

      <View style={styles.details}>
        {/* Address in one line with grayed-out and italic styling */}
        <Text style={styles.address}>
          {employer?.properties.address || "Address Unavailable"}
          {employer?.properties.city ? `, ${employer.properties.city}` : ""}
        </Text>
      </View>

      <Spacer size={16} />

      {/* Action Button */}
      <GymForceButton
        title="Edit Employer"
        onPress={handleEditEmployer}
        fullWidth={true}
        variant="primary"
        size="large"
      />
    </NoMarginView>
  );
};

export default EmployerCard;

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
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a265a",
    textAlign: "center",
  },
  details: {
    marginVertical: 10,
    alignItems: "center",
  },
  address: {
    fontSize: 16,
    color: "#888", // Light gray color for address
    fontStyle: "italic",
    textAlign: "center",
  },
});

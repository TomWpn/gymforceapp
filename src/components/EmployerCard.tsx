import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "../components/GymForceButton";
import CardWithIconBackground from "../components/CardWithIconBackground";
import Spacer from "../components/Spacer";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { useUserProfileContext } from "../context/UserProfileContext";
import GymForceText from "./GymForceText";
import FlexibleSpacer from "./FlexibleSpacer";

type EmployerSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "EmployerSelection"
>;

const EmployerCard: React.FC = () => {
  const navigation = useNavigation<EmployerSelectionNavigationProp>();
  const { userProfile } = useUserProfileContext();
  const employer = userProfile?.employer;

  const handleEditEmployer = () => {
    navigation.navigate("EmployerSelection", { mode: "edit" });
  };

  return (
    <CardWithIconBackground iconLibrary="Ionicons" iconName="business-outline">
      <View style={styles.header}>
        <GymForceText type="Title" color="primary">
          {employer?.properties.name || "No Employer Selected"}
        </GymForceText>
        {employer && (
          <>
            <GymForceText type="Note" color="#666666">
              {employer.properties.address}, {employer.properties.city},
              {employer.properties.state}
            </GymForceText>
            <FlexibleSpacer size={8} bottom />
          </>
        )}
      </View>

      <FlexibleSpacer top size={8} />

      {/* Action Button */}
      <GymForceButton
        title={employer ? "Change Employer" : "Select Employer"}
        onPress={handleEditEmployer}
        variant="primary"
        size="small"
      />
    </CardWithIconBackground>
  );
};

export default EmployerCard;

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
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

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
        <GymForceText style={styles.title}>
          {employer?.properties.name || "No Employer Selected"}
        </GymForceText>
      </View>

      <FlexibleSpacer top size={8} />

      {/* Action Button */}
      <GymForceButton
        title="Edit Employer"
        onPress={handleEditEmployer}
        variant="primary"
        size="small"
        width={"50%"}
      />
    </CardWithIconBackground>
  );
};

export default EmployerCard;

const styles = StyleSheet.create({
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

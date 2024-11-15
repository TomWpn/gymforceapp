import React, { useState } from "react";
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  ImageBackground,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { fetchEmployers } from "../services/employerService"; // Call to backend API
import { updateUserProfileWithCompany } from "../services/userProfileService"; // Firestore update function
import { Company } from "../types"; // Import Company interface
import { auth } from "../services/firebaseConfig";
import { AppStackParamList } from "../navigation/AppStackParamList";
import GymForceButton from "../components/GymForceButton";
import NoMarginView from "../components/NoMarginView";
import GymForceText from "../components/GymForceText";
import Padding from "../components/Padding";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useUserProfileContext } from "../context/UserProfileContext";

type EmployerSelectionScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "EmployerSelection"
>;

type EmployerSelectionScreenRouteProp = RouteProp<
  AppStackParamList,
  "EmployerSelection"
>;

const EmployerSelectionScreen = () => {
  const navigation = useNavigation<EmployerSelectionScreenNavigationProp>();
  const route = useRoute<EmployerSelectionScreenRouteProp>();
  const { refreshUserProfile } = useUserProfileContext();
  const { mode } = route.params || {}; // mode can be "signup" or "edit"

  const [query, setQuery] = useState("");
  const [employers, setEmployers] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: mode !== "signup",
    });
  }, [navigation, mode]);

  const handleSearch = async () => {
    if (query.trim()) {
      Keyboard.dismiss();
      setLoading(true);
      try {
        const results = await fetchEmployers(query);
        setEmployers(results || []);
      } catch (error) {
        console.error("Error searching for employers:", error);
        Alert.alert("Error", "Unable to search for employers at this time.");
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }
  };

  const handleSelectEmployer = async (employer: Company) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      await updateUserProfileWithCompany(uid, employer, "employer");
      await refreshUserProfile(); // Function to refresh user profile data
      Alert.alert("Success", `Selected employer: ${employer.properties.name}`);

      if (mode === "signup") {
        navigation.navigate("GymSelection", { mode: "signup" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving selected employer:", error);
      Alert.alert("Error", "Unable to save employer at this time.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={{ uri: "https://gymforce.app/assets/images/kettlebell.jpeg" }}
        style={styles.background}
      >
        <View style={styles.overlay} />
        {mode === "signup" && <FlexibleSpacer top size={32} />}
        <NoMarginView style={styles.container}>
          <GymForceText color="#1a265a" type="Title">
            Search for Your Employer
          </GymForceText>
          <FlexibleSpacer top size={8} />
          <TextInput
            style={styles.input}
            placeholder="Employer Name"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
          <GymForceButton
            title="Search"
            onPress={handleSearch}
            disabled={loading}
          />
          {loading ? (
            <Padding size={16}>
              <GymForceText color="#1a265a" type="Subtitle">
                Loading...
              </GymForceText>
            </Padding>
          ) : !loading && employers.length > 0 ? (
            <Padding vertical size={32}>
              <GymForceText color="#1a265a">
                Select an employer below
              </GymForceText>
              <FlatList
                data={employers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.employerCard}
                    onPress={() => handleSelectEmployer(item)}
                  >
                    <GymForceText type="Subtitle" style={styles.employerName}>
                      {item.properties.name}
                    </GymForceText>
                    <GymForceText style={styles.employerDetails}>
                      {item.properties.address}, {item.properties.city},{" "}
                      {item.properties.state}
                    </GymForceText>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.flatListContainer}
                keyboardShouldPersistTaps="handled"
              />
            </Padding>
          ) : (
            searched &&
            employers.length === 0 && (
              <Padding vertical size={32}>
                <GymForceText color="#1a265a">
                  No employers found. Please try again later.
                </GymForceText>
              </Padding>
            )
          )}
        </NoMarginView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default EmployerSelectionScreen;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#ffffff",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  flatListContainer: {
    paddingVertical: 10,
  },
  employerCard: {
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
  employerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a265a",
    marginBottom: 4,
  },
  employerDetails: {
    fontSize: 14,
    color: "#666",
  },
});

// src/screens/EmployerSelectionScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
  const { mode } = route.params || {}; // mode can be "signup" or "edit"

  const [query, setQuery] = useState("");
  const [employers, setEmployers] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  React.useLayoutEffect(() => {
    // Hide back button in signup mode
    navigation.setOptions({
      headerLeft: mode === "signup" ? () => null : undefined,
    });
  }, [navigation, mode]);

  // Function to handle searching employers
  const handleSearch = async () => {
    if (query.trim()) {
      setLoading(true);
      try {
        const results = await fetchEmployers(query); // Fetch filtered employers
        setEmployers(results || []);
      } catch (error) {
        console.error("Error searching for employers:", error);
        Alert.alert("Error", "Unable to search for employers at this time.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to handle selecting an employer and updating Firestore
  const handleSelectEmployer = async (employer: Company) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      await updateUserProfileWithCompany(uid, employer, "employer"); // Update employer in Firestore
      Alert.alert("Success", `Selected employer: ${employer.properties.name}`);

      // Navigate based on mode: continue signup flow or return to Dashboard
      if (mode === "signup") {
        navigation.navigate("GymSelection", { mode: "signup" });
      } else {
        navigation.goBack(); // Go back to Dashboard in edit mode
      }
    } catch (error) {
      console.error("Error saving selected employer:", error);
      Alert.alert("Error", "Unable to save employer at this time.");
    }
  };

  return (
    <NoMarginView style={styles.container}>
      <Text style={styles.title}>Select Your Employer</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for your employer"
        value={query}
        onChangeText={setQuery}
      />
      <GymForceButton
        title="Search"
        onPress={handleSearch}
        disabled={loading}
      />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={employers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectEmployer(item)}>
              <Text style={styles.employerItem}>{item.properties.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </NoMarginView>
  );
};

export default EmployerSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  employerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
});

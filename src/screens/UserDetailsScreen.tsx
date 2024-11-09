// src/screens/UserDetailsScreen.tsx
import React, { useState } from "react";
import { Text, TextInput, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { updateUserProfileField } from "../services/userProfileService";
import { auth } from "../services/firebaseConfig";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "../components/GymForceButton";
import NoMarginView from "../components/NoMarginView";

type UserDetailsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "EmployerSelection"
>;

type UserDetailsScreenRouteProp = RouteProp<AppStackParamList, "UserDetails">;

const UserDetailsScreen = () => {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>();
  const route = useRoute<UserDetailsScreenRouteProp>();
  const { mode } = route.params || {}; // "signup" or "edit"

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetails, setAddressDetails] = useState<{
    formatted_address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  } | null>(null);

  React.useLayoutEffect(() => {
    // Conditionally hide the back button in "signup" mode
    navigation.setOptions({
      headerLeft: mode === "signup" ? () => null : undefined,
    });
  }, [navigation, mode]);

  const handleSaveDetails = async () => {
    if (!name || !phone || !addressDetails) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      await updateUserProfileField(uid, {
        name,
        phone,
        address: addressDetails,
      });
      Alert.alert("Success", "User details saved successfully.");

      // Navigate based on mode: proceed in signup or return to Dashboard
      if (mode === "signup") {
        navigation.navigate("EmployerSelection", { mode: "signup" });
      } else {
        navigation.goBack(); // Go back to Dashboard or previous screen in edit mode
      }
    } catch (error) {
      console.error("Error saving user details:", error);
      Alert.alert("Error", "Could not save user details.");
    }
  };

  return (
    <NoMarginView style={styles.container}>
      <Text style={styles.title}>Enter Your Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <GooglePlacesAutocomplete
        placeholder="Enter your address"
        fetchDetails={true}
        onPress={(data, details = null) => {
          setAddressDetails({
            formatted_address: details?.formatted_address!,
            coordinates: details?.geometry.location!,
          });
        }}
        query={{
          key: process.env.GOOGLE_MAPS_API_KEY,
          language: "en",
          components: "country:us",
        }}
        styles={{
          textInputContainer: styles.autocompleteContainer,
          textInput: styles.input,
        }}
        requestUrl={{
          useOnPlatform: "web",
          url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
        }}
      />
      <GymForceButton title="Save Details" onPress={handleSaveDetails} />
    </NoMarginView>
  );
};

export default UserDetailsScreen;

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
  autocompleteContainer: {
    flex: 0,
    width: "100%",
  },
});

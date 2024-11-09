// src/screens/GymSelectionScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { fetchGyms } from "../services/gymService";
import {
  getUserProfile,
  updateUserProfileWithCompany,
} from "../services/userProfileService";
import { auth } from "../services/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { Address, GroupedCompanies, Company } from "../types";
import GymForceButton from "../components/GymForceButton";
import NoMarginView from "../components/NoMarginView";

type GymSelectionRouteProp = RouteProp<AppStackParamList, "GymSelection">;
type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

const GymSelectionScreen = () => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const route = useRoute<GymSelectionRouteProp>();
  const { mode } = route.params || { mode: "signup" };

  const [sourceLocation, setSourceLocation] = useState<
    "employer" | "home" | "current"
  >("home");
  const [range, setRange] = useState(10); // Default range in miles
  const [groupedCompanies, setGroupedCompanies] = useState<GroupedCompanies>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const [employerCoordinates, setEmployerCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [homeAddress, setHomeAddress] = useState<Address | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: mode === "signup" ? () => null : undefined,
    });
  }, [navigation, mode]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const userProfile = await getUserProfile(uid);
      if (userProfile) {
        const lat = parseFloat(userProfile.employer?.properties?.lat || "0");
        const lng = parseFloat(userProfile.employer?.properties?.lng || "0");
        setEmployerCoordinates(lat && lng ? { lat, lng } : null);
        setHomeAddress(userProfile.address || null);
      }
    };

    fetchUserProfile();
  }, []);

  const getCurrentLocation = async (): Promise<Address | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Unable to access current location.");
      return null;
    }
    const location = await Location.getCurrentPositionAsync({});
    return {
      coordinates: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
      formatted_address: "Current Location",
    };
  };

  const fetchNearbyGyms = async () => {
    setLoading(true);
    let location: { lat: number; lng: number } | null = null;

    if (sourceLocation === "employer" && employerCoordinates) {
      location = employerCoordinates;
    } else if (sourceLocation === "home" && homeAddress) {
      location = homeAddress.coordinates;
    } else if (sourceLocation === "current") {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) location = currentLocation.coordinates;
    }

    if (!location) {
      Alert.alert("Error", "Unable to determine source location.");
      setLoading(false);
      return;
    }
    console.log("Location:", location, "Range:", range);
    try {
      const facilities = await fetchGyms(location.lat, location.lng, range);
      console.log("Facilities:", facilities);
      setGroupedCompanies(facilities);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      Alert.alert("Error", "Could not fetch gyms at this time.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchNearbyGyms();
  // }, [sourceLocation, range]);

  const handleSelectGym = async (gym: Company) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      // Update the user profile in Firestore with the selected gym
      await updateUserProfileWithCompany(uid, gym, "gym");
      Alert.alert("Success", `Gym selected: ${gym.properties.name}`);

      if (mode === "signup") {
        // Navigate to the next step in the signup flow
        navigation.navigate("Dashboard");
      } else {
        // Navigate back to the dashboard if updating the profile
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      console.error("Error saving selected gym:", error);
      Alert.alert("Error", "Unable to save gym selection at this time.");
    }
  };
  console.log("Employer Coordinates:", employerCoordinates);
  console.log("Home Address:", homeAddress);
  console.log("Grouped Companies:", groupedCompanies);
  return (
    <NoMarginView style={styles.container}>
      <Text style={styles.title}>Select Your Gym</Text>

      <Text>Choose a Source Location:</Text>
      <Picker
        selectedValue={sourceLocation}
        onValueChange={(itemValue) => setSourceLocation(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Employer Address" value="employer" />
        <Picker.Item label="Home Address" value="home" />
        <Picker.Item label="Current Location" value="current" />
      </Picker>

      <Text>Range (miles): {range}</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={50}
        step={1}
        value={range}
        onValueChange={(value) => setRange(value)}
      />
      {loading && <Text>Loading gyms...</Text>}

      {!loading && groupedCompanies && (
        <NoMarginView>
          <Text>Select a Gym:</Text>
          <FlatList
            data={groupedCompanies[Object.keys(groupedCompanies)[0]]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectGym(item)}>
                <Text style={styles.gymItem}>{item.properties.name}</Text>
                <Text style={styles.distance}>
                  {item.distance.toFixed(2)} miles away
                </Text>
              </TouchableOpacity>
            )}
          />
        </NoMarginView>
      )}

      <GymForceButton title="Refresh List" onPress={fetchNearbyGyms} />
    </NoMarginView>
  );
};

export default GymSelectionScreen;

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
  picker: {
    height: 50,
    width: "100%",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  industryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  gymItem: {
    fontSize: 16,
    paddingVertical: 10,
  },
  distance: {
    fontSize: 14,
    color: "#666",
  },
});

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  ImageBackground,
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
import Slider from "@react-native-community/slider";
import { Address, GroupedCompanies, Company } from "../types";
import GymForceButton from "../components/GymForceButton";
import NoMarginView from "../components/NoMarginView";
import GymForceText from "../components/GymForceText";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useUserProfileContext } from "../context/UserProfileContext";

type GymSelectionRouteProp = RouteProp<AppStackParamList, "GymSelection">;
type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

const GymSelectionScreen = () => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const route = useRoute<GymSelectionRouteProp>();
  const { mode } = route.params || { mode: "signup" };
  const { refreshUserProfile } = useUserProfileContext();

  const [sourceLocation, setSourceLocation] = useState<
    "employer" | "home" | "current"
  >("home");
  const [range, setRange] = useState(10);
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
      headerShown: mode !== "signup",
    });
  }, [navigation, mode]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        // Alert.alert("Error", "User not authenticated");
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
      // Alert.alert("Permission denied", "Unable to access current location.");
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
      // Alert.alert("Error", "Unable to determine source location.");
      setLoading(false);
      return;
    }
    try {
      const facilities = await fetchGyms(location.lat, location.lng, range);
      setGroupedCompanies(facilities);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      // Alert.alert("Error", "Could not fetch gyms at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGym = async (gym: Company) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      // Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      await updateUserProfileWithCompany(uid, gym, "gym");
      await refreshUserProfile();
      // Alert.alert("Success", `Gym selected: ${gym.properties.name}`);
      if (mode === "signup") {
        navigation.navigate("BottomTabs", { screen: "Dashboard" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving selected gym:", error);
      // Alert.alert("Error", "Unable to save gym selection at this time.");
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <NoMarginView style={styles.container}>
            <GymForceText type="Title" color="#1a265a">
              Find Your Perfect Gym
            </GymForceText>

            <GymForceText
              type="Subtitle"
              color="#1a265a"
              style={styles.subText}
            >
              Choose the location you'd like to search from:
            </GymForceText>

            <View style={styles.pillContainer}>
              {["employer", "home", "current"].map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.pill,
                    sourceLocation === loc && styles.selectedPill,
                  ]}
                  onPress={() =>
                    setSourceLocation(loc as typeof sourceLocation)
                  }
                >
                  <GymForceText
                    type="Note"
                    color={sourceLocation === loc ? "#ffffff" : "#1a265a"}
                  >
                    {loc === "employer"
                      ? "Employer"
                      : loc === "home"
                      ? "Home"
                      : "Current Location"}
                  </GymForceText>
                </TouchableOpacity>
              ))}
            </View>

            <GymForceText type="Subtitle" color="#1a265a">
              Adjust Your Search Range: {range} miles
            </GymForceText>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={range}
              onValueChange={(value) => setRange(value)}
            />
            <GymForceButton title="Search Gyms" onPress={fetchNearbyGyms} />

            <FlexibleSpacer bottom size={16} />
            {loading && (
              <GymForceText color="#1a265a">
                Finding nearby gyms...
              </GymForceText>
            )}

            {!loading && Object.keys(groupedCompanies).length > 0 && (
              <NoMarginView>
                <GymForceText
                  type="Tagline"
                  color="#1a265a"
                  style={styles.sectionTitle}
                >
                  Select a Gym Near You
                </GymForceText>
                {Object.keys(groupedCompanies).map((categoryKey) => (
                  <View key={categoryKey} style={styles.groupContainer}>
                    <GymForceText type="Subtitle" color="#f1600d">
                      {categoryKey === "Functional Fitness"
                        ? "Functional Fitness Gyms"
                        : categoryKey === "HEALTH_WELLNESS_AND_FITNESS"
                        ? "Health, Wellness, and Fitness"
                        : categoryKey === "LEISURE_TRAVEL_TOURISM"
                        ? "Leisure, Travel, and Tourism"
                        : categoryKey === "Martial Arts"
                        ? "Martial Arts Centers"
                        : "Other Gyms"}
                    </GymForceText>
                    <FlatList
                      data={groupedCompanies[categoryKey]}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.gymCard}
                          onPress={() => handleSelectGym(item)}
                        >
                          <GymForceText type="Subtitle" color="#1a265a">
                            {item.properties.name}
                          </GymForceText>
                          <GymForceText type="Note" color="#666666">
                            {item.distance.toFixed(2)} miles from your selected
                            location
                          </GymForceText>
                        </TouchableOpacity>
                      )}
                      scrollEnabled={false} // Disable scrolling within each FlatList to avoid nested scroll conflicts
                      contentContainerStyle={styles.flatListContainer}
                    />
                  </View>
                ))}
              </NoMarginView>
            )}
          </NoMarginView>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default GymSelectionScreen;

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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
  },
  subText: {
    marginVertical: 10,
  },
  pillContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  pill: {
    flex: 1,
    padding: 4,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderColor: "#1a265a",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPill: {
    backgroundColor: "#1a265a",
  },
  slider: {
    width: "100%",
    height: 40,
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
  sectionTitle: {
    marginVertical: 10,
    textAlign: "center",
  },
  groupContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  flatListContainer: {
    paddingVertical: 10,
  },
});

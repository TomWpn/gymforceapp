import React, { useState, useEffect } from "react";
import {
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
// import Slider from "@react-native-community/slider";
import { Address, GroupedCompanies, Company, Gym } from "../types";
import GymForceButton from "../components/GymForceButton";
import GymForceText from "../components/GymForceText";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useUserProfileContext } from "../context/UserProfileContext";
import NoMarginView from "../components/NoMarginView";
import Padding from "../components/Padding";

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
  const [range, setRange] = useState(20);
  const [groupedCompanies, setGroupedCompanies] = useState<GroupedCompanies>(
    {}
  );
  const [nonNetworkGyms, setNonNetworkGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [employerCoordinates, setEmployerCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [homeAddress, setHomeAddress] = useState<Address | null>(null);

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

    try {
      const facilities = await fetchGyms(location.lat, location.lng, range);
      await fetchNonNetworkGyms();
      setGroupedCompanies(facilities);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      Alert.alert("Error", "Could not fetch gyms at this time.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNonNetworkGyms = async () => {
    const offNetworkGyms = [
      {
        id: "off-1",
        properties: { name: "Example Gym" },
        distance: 5.0,
      },
      {
        id: "off-2",
        properties: { name: "Another Gym" },
        distance: 8.5,
      },
    ] as unknown as Gym[];

    setNonNetworkGyms(offNetworkGyms);
  };

  const handleSelectGym = async (gym: Company) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      await updateUserProfileWithCompany(uid, gym, "gym");
      await refreshUserProfile();
      Alert.alert("Success", `Gym selected: ${gym.properties.name}`);
      if (mode === "signup") {
        navigation.navigate("BottomTabs", { screen: "Dashboard" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving selected gym:", error);
      Alert.alert("Error", "Unable to save gym selection at this time.");
    }
  };

  const sections = [
    // Create a section for each group in groupedCompanies
    ...Object.keys(groupedCompanies).map((key) => ({
      title: key, // Use the key as the section title
      data: groupedCompanies[key], // Data is the array of gyms in this group
      isOnNetwork: true, // Set this to true for gyms in the network
    })),
    {
      title: "Non - Network Gyms",
      subtitle:
        "If you'd like to join a gym that is not in the network, please select it here. You will not be able to earn rewards at these gyms.",
      data: nonNetworkGyms, // Add suggested gyms as a separate section
      isOnNetwork: false, // Set this to false for gyms not in the network
    },
  ];

  const renderSectionHeader = ({
    section: { title, isOnNetwork, subtitle },
  }: any) =>
    !loading && Object.keys(groupedCompanies).length > 0 ? (
      <>
        {!isOnNetwork && <FlexibleSpacer size={32} top />}
        <GymForceText type="Title" color={isOnNetwork ? "#f1600d" : "#1a265a"}>
          {title}
        </GymForceText>
        {}
      </>
    ) : null;

  const renderGymItem = ({ item }: { item: Company | Gym }) =>
    !loading ? (
      <TouchableOpacity
        style={styles.gymCard}
        onPress={() => handleSelectGym(item as Company)}
      >
        <ImageBackground
          source={require("../../assets/badge.png")}
          style={styles.background}
        >
          <GymForceText type="Subtitle" color="#1a265a">
            {item.properties.name}
          </GymForceText>
          <GymForceText type="Note" color="#666666">
            {item.distance.toFixed(2)} miles from your selected location
          </GymForceText>
        </ImageBackground>
      </TouchableOpacity>
    ) : null;

  return (
    <NoMarginView style={styles.container}>
      <ImageBackground
        source={{ uri: "https://gymforce.app/assets/images/kettlebell.jpeg" }}
        style={styles.background}
      >
        <View style={styles.overlay} />

        <NoMarginView>
          <Padding size={20}>
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
            {/* <GymForceText type="Subtitle" color="#1a265a">
              Adjust Your Search Range: {range} miles
            </GymForceText>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={range}
              onValueChange={(value) => setRange(value)}
            /> */}
            <FlexibleSpacer bottom size={16} />
            <GymForceButton
              fullWidth
              title="Search Gyms"
              onPress={fetchNearbyGyms}
            />
            <FlexibleSpacer bottom size={16} />
            {loading && (
              <GymForceText color="#1a265a">
                Finding nearby gyms...
              </GymForceText>
            )}
          </Padding>
        </NoMarginView>
        <SectionList
          sections={sections}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderGymItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.sectionListContainer}
        />
      </ImageBackground>
    </NoMarginView>
  );
};

export default GymSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
  sectionListContainer: {
    paddingVertical: 10,
    paddingBottom: 100,
  },
});

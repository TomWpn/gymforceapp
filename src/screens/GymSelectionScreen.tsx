import React, { useState, useEffect } from "react";
import {
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { fetchGyms, fetchNonNetworkGyms } from "../services/gymService";
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
import { createCompanyInHubSpot } from "../services/hubspotHelper";

type GymSelectionRouteProp = RouteProp<AppStackParamList, "GymSelection">;
type GymSelectionNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymSelection"
>;

const METER_CONVERSION_FACTOR = 1604;

const GymSelectionScreen = () => {
  const navigation = useNavigation<GymSelectionNavigationProp>();
  const route = useRoute<GymSelectionRouteProp>();
  const { mode } = route.params || { mode: "signup" };
  const { refreshUserProfile } = useUserProfileContext();

  const [sourceLocation, setSourceLocation] = useState<
    "employer" | "home" | "current" | null
  >(null);
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

  const fetchNearbyGyms = async (source?: "employer" | "home" | "current") => {
    setLoading(true);
    let location: { lat: number; lng: number } | null = null;

    const effectiveSource = source || sourceLocation; // Use passed source or fallback to state

    if (effectiveSource === "employer" && employerCoordinates) {
      location = employerCoordinates;
    } else if (effectiveSource === "home" && homeAddress) {
      location = homeAddress.coordinates;
    } else if (effectiveSource === "current") {
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
      await handleFetchNonNetworkGyms(
        location.lat,
        location.lng,
        range * METER_CONVERSION_FACTOR
      );
      setGroupedCompanies(facilities);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      // Alert.alert("Error", "Could not fetch gyms at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNonNetworkGyms = async (lat: any, lng: any, range: any) => {
    const offNetworkGyms = await fetchNonNetworkGyms(lat, lng, range);
    setNonNetworkGyms(offNetworkGyms);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchNearbyGyms();
    };
    fetchData();
  }, [sourceLocation]);

  const handleSourceChange = async (
    source: "employer" | "home" | "current"
  ) => {
    setSourceLocation(source);
    setGroupedCompanies({});
    setNonNetworkGyms([]);
  };

  const handleSelectGym = async (gym: Gym) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      // Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      if (!gym.isOnNetwork) {
        // add to hubspot
        gym = await createCompanyInHubSpot(gym);
      }
      await updateUserProfileWithCompany(uid, gym, "gym");
      await refreshUserProfile();
      // Alert.alert("Success", `Gym selected: ${gym.properties.name}`);
      if (mode === "signup") {
        navigation.navigate("Home", { screen: "Gyms" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving selected gym:", error);
      // Alert.alert("Error", "Unable to save gym selection at this time.");
    }
  };

  const sections = [
    ...Object.keys(groupedCompanies).map((key) => ({
      title: key,
      data: groupedCompanies[key],
      isOnNetwork: true,
    })),
    ...(Object.keys(groupedCompanies).length === 0 && nonNetworkGyms.length > 0
      ? [
          {
            title: "Non - Network Gyms",
            subtitle:
              "If you'd like to join a gym that is not in the network, please select it here. You will not be able to earn rewards at these gyms.",
            data: nonNetworkGyms,
            isOnNetwork: false,
          },
        ]
      : []),
  ];

  const renderSectionHeader = ({
    section: { title, isOnNetwork, subtitle },
  }: any) =>
    !loading ? (
      <>
        <GymForceText type="Title" color={isOnNetwork ? "#f1600d" : "#1a265a"}>
          {title}
        </GymForceText>
        {subtitle && (
          <GymForceText type="Subtitle" color="#666666">
            {subtitle}
          </GymForceText>
        )}
      </>
    ) : null;

  const renderGymItem = ({
    item,
    section,
  }: {
    item: Company | Gym;
    section: { isOnNetwork: boolean };
  }) =>
    !loading ? (
      <TouchableOpacity
        style={styles.gymCard}
        onPress={() => handleSelectGym(item as Gym)}
      >
        <NoMarginView>
          <GymForceText type="Subtitle" color="#1a265a">
            {item.properties.name}
          </GymForceText>
          <GymForceText type="Note" color="#666666">
            {item.properties.address}
            {item.properties.city}, {item.properties.state}
          </GymForceText>
          <GymForceText type="Note" color="#666666">
            {item.distance.toFixed(2)} miles{" "}
            {sourceLocation === "current"
              ? "away"
              : `from your ${sourceLocation}`}
          </GymForceText>
        </NoMarginView>
        {/* Conditionally add logo for network gyms */}
        {section.isOnNetwork && (
          <NoMarginView>
            <Image
              source={require("../../assets/badge.png")} // Replace with your logo path
              style={styles.logo}
            />
          </NoMarginView>
        )}
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
                    handleSourceChange(loc as "employer" | "home" | "current")
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
          renderItem={({ item, section }) => renderGymItem({ item, section })} // Pass section
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
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  sectionListContainer: {
    paddingVertical: 10,
    paddingBottom: 100,
    paddingHorizontal: 32,
  },
  itemBackground: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});

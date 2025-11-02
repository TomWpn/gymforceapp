import React, { useState, useEffect } from "react";
import {
  SectionList,
  TouchableOpacity,
  StyleSheet,
  View,
  ImageBackground,
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
import { Address, GroupedCompanies, Company, Gym } from "../types";
import GymForceText from "../components/GymForceText";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useUserProfileContext } from "../context/UserProfileContext";
import NoMarginView from "../components/NoMarginView";
import Padding from "../components/Padding";
import { createCompanyInHubSpot } from "../services/hubspotHelper";
import { useProfileCompletionCheck } from "../hooks/useProfileCompletionCheck";

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
  const [range, setRange] = useState(25);
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
      if (!uid) return;

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
    if (status !== "granted") return null;
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
      setLoading(false);
      return;
    }

    try {
      const [facilities] = await Promise.all([
        fetchGyms(location.lat, location.lng, range),
        handleFetchNonNetworkGyms(
          location.lat,
          location.lng,
          range * METER_CONVERSION_FACTOR
        ),
      ]);
      setGroupedCompanies(facilities);
    } catch (error) {
      console.error("Error fetching gyms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNonNetworkGyms = async (
    lat: number,
    lng: number,
    range: number
  ) => {
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

  const checkProfileAndNavigate = useProfileCompletionCheck(mode);

  const handleSelectGym = async (gym: Gym) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const updatedGym = !gym.isOnNetwork
        ? await createCompanyInHubSpot(gym)
        : gym;

      await updateUserProfileWithCompany(uid, updatedGym, "gym");
      await refreshUserProfile();

      // For non-network gyms, we still need to verify profile completion
      if (!gym.isOnNetwork) {
        if (mode === "signup") {
          // Check if profile is complete and navigate accordingly
          const isComplete = await checkProfileAndNavigate();
          if (isComplete) {
            // All fields are complete, navigate to Home
            navigation.navigate("Home", { screen: "Gyms" });
          }
        } else {
          // Navigate to Gyms tab and refresh the page
          navigation.navigate("Home", { screen: "Gyms" });
        }
        return;
      }

      // Navigate to GymScreen for network gyms to handle attestation
      navigation.navigate("GymScreen", {
        gymId: gym.id,
        showMembershipInterest: true,
        returnToGymTab: mode === "edit",
      });
    } catch (error) {
      console.error("Error saving selected gym:", error);
    }
  };

  const sections = [
    ...Object.keys(groupedCompanies).map((key) => ({
      title: key,
      data: [...groupedCompanies[key]].sort((a, b) => a.distance - b.distance),
      isOnNetwork: true,
    })),
    ...(Object.keys(groupedCompanies).length === 0 && nonNetworkGyms.length > 0
      ? [
          {
            title: "Non - Network Gyms",
            subtitle:
              "If you'd like to join a gym that is not in the network, please select it here. You will not be able to earn rewards at these gyms.",
            data: [...nonNetworkGyms].sort((a, b) => a.distance - b.distance),
            isOnNetwork: false,
          },
        ]
      : []),
  ];

  interface SectionHeader {
    section: {
      title: string;
      isOnNetwork: boolean;
      subtitle?: string;
    };
  }

  const renderSectionHeader = ({
    section: { title, isOnNetwork, subtitle },
  }: SectionHeader) =>
    !loading ? (
      <>
        <GymForceText
          style={styles.sectionListHeader}
          type="Title"
          color={isOnNetwork ? "#f1600d" : "#1a265a"}
        >
          {title}
        </GymForceText>
        {subtitle && (
          <GymForceText
            style={styles.sectionListHeaderSubtitle}
            type="Subtitle"
            color="#666666"
          >
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
      <Padding horizontal size={30}>
        <TouchableOpacity
          style={styles.gymCard}
          onPress={() => handleSelectGym(item as Gym)}
        >
          <ImageBackground
            source={
              section.isOnNetwork
                ? require("../../assets/badge.png")
                : undefined
            }
            imageStyle={styles.itemBackgroundImage}
          >
            <NoMarginView style={styles.gymItemContentContainer}>
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
          </ImageBackground>
        </TouchableOpacity>
      </Padding>
    ) : null;

  return (
    <NoMarginView style={styles.container}>
      <NoMarginView>
        <Padding size={20}>
          <GymForceText type="Title" color="#1a265a">
            Find Your Perfect Gym
          </GymForceText>
          <GymForceText type="Subtitle" color="#1a265a" style={styles.subText}>
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
            <GymForceText color="#1a265a">Finding nearby gyms...</GymForceText>
          )}
        </Padding>
      </NoMarginView>

      {/* Scrollable Content */}
      <NoMarginView style={styles.listContainer}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, section }) => renderGymItem({ item, section })}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.sectionListContainer}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          SectionSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </NoMarginView>
    </NoMarginView>
  );
};

export default GymSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContainer: {
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
  sectionListContainer: {
    paddingBottom: 200,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  gymCard: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1a265a",
    overflow: "hidden",
  },
  sectionListHeader: {
    backgroundColor: "#ffffff",
    paddingBottom: 8,
    borderColor: "#1a265a",
    borderBottomWidth: 1,
  },
  sectionListHeaderSubtitle: {
    backgroundColor: "#ffffff",
    padding: 8,
    paddingHorizontal: 16,
  },
  gymItemContentContainer: {
    padding: 16,
  },
  itemBackgroundImage: {
    opacity: 1,
    position: "absolute",
    marginLeft: "85%",
    marginBottom: "15%",
    width: "15%",
  },
});

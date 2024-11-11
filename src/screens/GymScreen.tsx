import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useUserProfileContext } from "../context/UserProfileContext";
import { fetchGymById } from "../services/gymService"; // Import the service function
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Company } from "../types";
import GymForceText from "../components/GymForceText";
import FlexibleSpacer from "../components/FlexibleSpacer";
import badgeIcon from "../../assets/badge.png";

// Mock data for deals, events, and owner message
const mockDeals = [
  {
    id: 1,
    title: "50% off First Month",
    description: "Join now and save 50% on your first month!",
  },
  {
    id: 2,
    title: "Referral Bonus",
    description: "Refer a friend and get 20% off your next month!",
  },
];

const mockEvents = [
  {
    id: 1,
    title: "Yoga Workshop",
    date: "November 20, 2024",
    description: "Learn advanced yoga techniques with our expert instructors.",
  },
  {
    id: 2,
    title: "Strength Training Basics",
    date: "December 5, 2024",
    description: "Intro to strength training with our certified trainers.",
  },
];

const GymScreen: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  const [gymData, setGymData] = useState<Company>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestGymData = async () => {
      if (userProfile?.gym?.id) {
        try {
          const data = await fetchGymById(userProfile.gym.id); // Fetch latest data
          setGymData(data);
        } catch (err) {
          setError("Failed to load gym information.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("No gym selected.");
      }
    };

    fetchLatestGymData();
  }, [userProfile?.gym?.id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f1600d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <GymForceText style={styles.noData}>{error}</GymForceText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {gymData ? (
        <View>
          {/* Header with Gym Background */}
          <ImageBackground
            source={{
              uri:
                gymData.properties.app_background_image_url ||
                "https://gymforce.app/assets/images/badge.png", // Fallback URL
            }}
            style={styles.headerBackground}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.gymNameSection}>
              <GymForceText type="Title" color="#1a265a" fontFamily="Gymforce">
                {gymData.properties.name}
              </GymForceText>
            </View>
          </ImageBackground>

          {/* Owner Message Section */}
          {gymData.properties.owner_blurb && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="account" size={24} color="#ff7f50" />
                <GymForceText style={styles.sectionTitle}>
                  Message from the Owner
                </GymForceText>
              </View>
              <GymForceText style={styles.sectionContent}>
                {gymData.properties.owner_blurb}
              </GymForceText>
            </View>
          )}

          {/* Upcoming Deals Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="tag-heart" size={24} color="#ff7f50" />
              <GymForceText style={styles.sectionTitle}>
                Exclusive Deals
              </GymForceText>
            </View>
            {mockDeals.map((deal) => (
              <View key={deal.id} style={styles.dealItem}>
                <GymForceText style={styles.itemTitle}>
                  {deal.title}
                </GymForceText>
                <GymForceText style={styles.itemDescription}>
                  {deal.description}
                </GymForceText>
              </View>
            ))}
          </View>

          <FlexibleSpacer top size={8} />
          {/* Upcoming Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar-star" size={24} color="#ff7f50" />
              <GymForceText style={styles.sectionTitle}>
                Upcoming Events
              </GymForceText>
            </View>
            {mockEvents.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <GymForceText style={styles.itemTitle}>
                  {event.title}
                </GymForceText>
                <GymForceText style={styles.itemDate}>
                  {event.date}
                </GymForceText>
                <GymForceText style={styles.itemDescription}>
                  {event.description}
                </GymForceText>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <GymForceText style={styles.noData}>
          No gym information available.
        </GymForceText>
      )}
    </ScrollView>
  );
};

export default GymScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBackground: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  gymName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  gymNameSection: {
    marginHorizontal: 20,
    padding: 35,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  section: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: "#444",
  },
  dealItem: {
    padding: 12,
    backgroundColor: "#ffe5e0",
    borderRadius: 8,
    marginBottom: 10,
  },
  eventItem: {
    padding: 12,
    backgroundColor: "#e0f4ff",
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff7f50",
  },
  itemDate: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  itemDescription: {
    fontSize: 14,
    color: "#333",
  },
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useUserProfileContext } from "../context/UserProfileContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import GymForceText from "../components/GymForceText";
import FlexibleSpacer from "../components/FlexibleSpacer";
import ExpandableText from "../components/ExpandableText";
import GymHeader from "../components/GymHeader";
import GymReviewForm from "../components/GymReviewForm";
import GymForceButton from "../components/GymForceButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { useGymData } from "../hooks/useGymData";

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

type GymScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymReviews"
>;

const GymScreen: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  const [isModalVisible, setModalVisible] = useState(false);

  const gymId = userProfile?.gym?.id ?? null;

  const { gymData, loading, error, fetchGymData } = useGymData(gymId);

  const navigation = useNavigation<GymScreenNavigationProp>(); // Hook for navigation

  const handleViewReviews = () => {
    if (gymData?.id) {
      navigation.navigate("GymReviews", { gymId: gymData.id }); // Navigate to GymReviewsScreen with gymId
    }
  };

  const handleRatePress = () => {
    setModalVisible(true); // Open the modal
  };

  const closeModal = () => {
    setModalVisible(false); // Close the modal
  };

  useEffect(() => {
    fetchGymData();
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
          <GymHeader
            name={gymData.properties?.name!}
            backgroundImageUrl={gymData.properties.app_background_image_url!}
            rating={gymData.averageRating || 0}
            totalReviews={gymData.totalReviews || 0}
            onRatePress={handleRatePress}
          />

          <FlexibleSpacer top size={16} />
          {/* Owner Message Section */}
          {gymData.properties.owner_blurb && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="account" size={24} color="#ff7f50" />
                <GymForceText style={styles.sectionTitle}>
                  About the Owner
                </GymForceText>
              </View>
              <ExpandableText
                htmlContent={gymData.properties.owner_blurb}
                style={styles.sectionTitle}
              />
            </View>
          )}

          <FlexibleSpacer top size={8} />
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

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GymReviewForm gymId={gymData?.id!} onSuccess={closeModal} />
            <FlexibleSpacer top size={8} />
            <GymForceButton
              variant="tertiary"
              title="Close"
              onPress={closeModal}
              size="small"
            />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

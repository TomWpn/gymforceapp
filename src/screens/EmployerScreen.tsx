import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useUserProfileContext } from "../context/UserProfileContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import EmployerInfoSection from "../components/EmployerInfoSection";
import CheckInProgressTracker from "../components/CheckInProgressTracker";
import GymForceText from "../components/GymForceText";
import { fetchEmployerById } from "../services/employerService"; // Import the HubSpot fetching function
import { useCheckInContext } from "../context/CheckInContext";

const mockWellnessBenefits = [
  {
    id: 1,
    title: "Gym Membership Discount",
    description: "Receive a 50% discount on memberships at all partner gyms.",
  },
  {
    id: 2,
    title: "Free Monthly Fitness Assessment",
    description:
      "Get a free fitness assessment every month to track your progress.",
  },
  {
    id: 3,
    title: "Personal Training Sessions",
    description:
      "Access one free personal training session each month at selected gyms.",
  },
];

const mockProgramAnnouncements = [
  {
    id: 1,
    title: "New Gym Partner Added",
    date: "November 25, 2024",
    description:
      "Now partnered with XYZ Gym - check it out for your wellness benefits!",
  },
  {
    id: 2,
    title: "Enrollment Open for Wellness Challenge",
    date: "December 1, 2024",
    description:
      "Join the upcoming Wellness Challenge to earn rewards for fitness milestones.",
  },
];
const EmployerSelectionScreen: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  const [employerDetails, setEmployerDetails] = useState(userProfile?.employer);

  // Function to fetch employer details from HubSpot
  const fetchEmployerDetails = async (employerId: string) => {
    try {
      const employerData = await fetchEmployerById(employerId);
      setEmployerDetails(employerData);
    } catch (error) {
      console.error("Error fetching employer details:", error);
      Alert.alert("Error", "Could not fetch employer details.");
    }
  };

  useEffect(() => {
    // Fetch latest employer details on component load or when employer changes
    if (userProfile?.employer?.id) {
      fetchEmployerDetails(userProfile.employer.id);
    }
  }, [userProfile?.employer?.id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Employer Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="office-building" size={24} color="#f1600d" />
          <GymForceText style={styles.sectionTitle}>Your Employer</GymForceText>
        </View>
        {employerDetails ? (
          <EmployerInfoSection />
        ) : (
          <GymForceText style={styles.noData}>
            No employer selected.
          </GymForceText>
        )}
      </View>

      {/* Wellness Program Benefits Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="heart-circle" size={24} color="#f1600d" />
          <GymForceText style={styles.sectionTitle}>
            Wellness Program Benefits
          </GymForceText>
        </View>
        {mockWellnessBenefits.map((benefit) => (
          <View key={benefit.id} style={styles.item}>
            <GymForceText style={styles.itemTitle}>
              {benefit.title}
            </GymForceText>
            <GymForceText style={styles.itemDescription}>
              {benefit.description}
            </GymForceText>
          </View>
        ))}
      </View>

      {/* Program Announcements Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="bullhorn-outline" size={24} color="#f1600d" />
          <GymForceText style={styles.sectionTitle}>
            Program Announcements
          </GymForceText>
        </View>
        {mockProgramAnnouncements.map((announcement) => (
          <View key={announcement.id} style={styles.item}>
            <GymForceText style={styles.itemTitle}>
              {announcement.title}
            </GymForceText>
            <GymForceText style={styles.itemDate}>
              {announcement.date}
            </GymForceText>
            <GymForceText style={styles.itemDescription}>
              {announcement.description}
            </GymForceText>
          </View>
        ))}
      </View>

      {/* Wellness Milestones Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="medal" size={24} color="#f1600d" />
          <GymForceText style={styles.sectionTitle}>
            Your Wellness Milestones
          </GymForceText>
        </View>
        <CheckInProgressTracker />
      </View>
    </ScrollView>
  );
};

export default EmployerSelectionScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a265a",
    marginLeft: 8,
  },
  item: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1600d",
  },
  itemDate: {
    fontSize: 14,
    color: "#666",
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
  },
});

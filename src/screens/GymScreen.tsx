import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceText from "../components/GymForceText";
import GymHeader from "../components/GymHeader";
import CheckInHistoryCard from "../components/CheckInHistoryCard";
import ExpandableText from "../components/ExpandableText";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useUserProfileContext } from "../context/UserProfileContext";
import { useGymData } from "../hooks/useGymData";
import { auth } from "../services/firebaseConfig";
import FlexibleSpacer from "../components/FlexibleSpacer";
import Padding from "../components/Padding";
import GymChatModal from "../components/GymChatModal";
import GymCard from "../components/GymCard";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { useProfileCompletionCheck } from "../hooks/useProfileCompletionCheck";

type GymScreenRouteProp = RouteProp<AppStackParamList, "GymScreen">;
type GymScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "GymScreen"
>;

const GymScreen: React.FC = () => {
  const route = useRoute<GymScreenRouteProp>();
  const navigation = useNavigation<GymScreenNavigationProp>();
  const { userProfile, refreshUserProfile } = useUserProfileContext();
  const [isChatVisible, setChatVisible] = React.useState(false);

  const gymId = route.params?.gymId ?? userProfile?.gym?.id ?? null;
  const showMembershipInterest = route.params?.showMembershipInterest ?? false;
  const { gymData, loading, error, fetchGymData } = useGymData(gymId);

  // Get the profile completion check hook
  const checkProfileAndNavigate = useProfileCompletionCheck("signup");

  useEffect(() => {
    fetchGymData();
  }, [userProfile?.gym?.id]);

  // Handle attestation completion
  const handleAttestationComplete = async () => {
    await refreshUserProfile();

    // Check if profile is complete and navigate accordingly
    const isComplete = await checkProfileAndNavigate();
    if (isComplete) {
      // All fields are complete, navigate to Home
      navigation.navigate("Home", { screen: "Dashboard" });
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f1600d" />
        <GymForceText style={styles.loadingText}>
          Loading gym information...
        </GymForceText>
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
    <>
      <FlatList
        data={[
          {
            key: "header",
            render: () => (
              <GymHeader
                name={gymData?.properties?.name!}
                backgroundImageUrl={
                  gymData?.properties?.app_background_image_url!
                }
                rating={gymData?.averageRating || 0}
                totalReviews={gymData?.totalReviews || 0}
              >
                <GymCard
                  requireAttestation={gymData?.isOnNetwork ?? false}
                  gym={gymData}
                  onAttestationComplete={handleAttestationComplete}
                />
              </GymHeader>
            ),
          },
          {
            key: "checkInHistory",
            render: () => (
              <Padding vertical size={16}>
                <GymForceText type="Title" color="primary">
                  Check-In History
                </GymForceText>
                <Padding horizontal size={32}>
                  <CheckInHistoryCard />
                </Padding>
                <FlexibleSpacer bottom size={20} />
              </Padding>
            ),
          },
          {
            key: "ownerBlurb",
            render: () =>
              gymData?.properties?.owner_blurb && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="account" size={24} color="#ff7f50" />
                    <GymForceText style={styles.sectionTitle}>
                      About the Owner
                    </GymForceText>
                  </View>
                  <ExpandableText
                    htmlContent={gymData?.properties?.owner_blurb}
                    style={styles.sectionTitle}
                  />
                </View>
              ),
          },
        ]}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => item.render() as JSX.Element}
      />
      <GymChatModal
        gymId={gymData?.id!}
        userId={auth.currentUser?.uid!}
        visible={isChatVisible}
        onClose={() => setChatVisible(false)}
      />
    </>
  );
};

export default GymScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#1a265a",
    fontWeight: "500",
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
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import GymForceText from "../components/GymForceText";
import GymHeader from "../components/GymHeader";
import CheckInHistoryCard from "../components/CheckInHistoryCard";
import ExpandableText from "../components/ExpandableText";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import GymForceButton from "../components/GymForceButton";
import { useUserProfileContext } from "../context/UserProfileContext";
import { useGymData } from "../hooks/useGymData";
import { auth } from "../services/firebaseConfig";
import FlexibleSpacer from "../components/FlexibleSpacer";
import Padding from "../components/Padding";
import GymChatModal from "../components/GymChatModal";

const GymScreen: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  const [isChatVisible, setChatVisible] = useState(false);

  const gymId = userProfile?.gym?.id ?? null;
  const { gymData, loading, error, fetchGymData } = useGymData(gymId);

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
              />
            ),
          },
          {
            key: "chatButton",
            render: () => (
              <View style={styles.chatButtonContainer}>
                <FlexibleSpacer bottom size={20} />
                <GymForceButton
                  title="Send Owner a Message"
                  onPress={() => setChatVisible(true)}
                  variant="primary"
                />
                <FlexibleSpacer bottom size={20} />
              </View>
            ),
          },
          {
            key: "checkInHistory",
            render: () => (
              <>
                <GymForceText type="Title" color="primary">
                  Check-In History
                </GymForceText>
                <Padding horizontal size={32}>
                  <CheckInHistoryCard />
                </Padding>
                <FlexibleSpacer bottom size={20} />
              </>
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
  chatButtonContainer: {
    padding: 16,
  },
});

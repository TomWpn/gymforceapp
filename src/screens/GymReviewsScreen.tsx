import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getAllReviewsForGym } from "../services/firebaseHelper"; // Fetch reviews function
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo
import GymForceCard from "../components/GymForceCard"; // Card component
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

const GymReviewsScreen = ({ gymId }: { gymId: string }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<"highest" | "lowest">("highest");
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData, DocumentData>>();
  const [hasMore, setHasMore] = useState(true);

  const [breakdown, setBreakdown] = useState<number[]>([0, 0, 0, 0, 0]); // Stores percentage for 5-star to 1-star

  useEffect(() => {
    loadReviews(true); // Initial load on mount
  }, [sortOption]);

  const loadReviews = async (reset = false) => {
    if (loading || !gymId || (!reset && !hasMore)) return;

    setLoading(true);
    try {
      const result = await getAllReviewsForGym(gymId, {
        lastDoc: reset ? undefined : lastDoc,
        sort: sortOption,
        pageSize: 10,
      });

      if (reset) {
        setReviews(result.reviews);
        setLastDoc(result.lastDoc);
        calculateBreakdown(result.reviews);
      } else {
        setReviews((prev) => [...prev, ...result.reviews]);
        setLastDoc(result.lastDoc);
        calculateBreakdown([...reviews, ...result.reviews]);
      }

      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBreakdown = (allReviews: any[]) => {
    const total = allReviews.length;
    if (total === 0) {
      setBreakdown([0, 0, 0, 0, 0]);
      return;
    }

    const counts = [0, 0, 0, 0, 0];
    allReviews.forEach((review) => {
      const rating = Math.round(review.rating) - 1; // Adjust for 0-indexed array
      if (rating >= 0 && rating < 5) counts[rating]++;
    });

    const percentages = counts.map((count) => (count / total) * 100);
    setBreakdown(percentages);
  };

  const renderReview = ({ item }: { item: any }) => (
    <GymForceCard style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.reviewRating}>{item.rating} / 5</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </GymForceCard>
  );

  const renderBreakdown = () => (
    <GymForceCard style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>Review Breakdown</Text>
      {breakdown.map((percentage, index) => (
        <View key={index} style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{5 - index} Stars</Text>
          <View style={styles.breakdownBarContainer}>
            <View
              style={[
                styles.breakdownBar,
                { width: `${percentage}%`, backgroundColor: "#FFD700" },
              ]}
            />
          </View>
          <Text style={styles.breakdownPercentage}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      ))}
    </GymForceCard>
  );

  return (
    <View style={styles.container}>
      {renderBreakdown()}

      <View style={styles.sortOptions}>
        <TouchableOpacity onPress={() => setSortOption("highest")}>
          <Text
            style={[
              styles.sortOption,
              sortOption === "highest" && styles.sortOptionActive,
            ]}
          >
            Highest Rated
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortOption("lowest")}>
          <Text
            style={[
              styles.sortOption,
              sortOption === "lowest" && styles.sortOptionActive,
            ]}
          >
            Lowest Rated
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        onEndReached={() => loadReviews(false)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#000" /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  breakdownCard: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  breakdownLabel: {
    width: 60,
    fontSize: 14,
  },
  breakdownBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  breakdownBar: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownPercentage: {
    width: 50,
    textAlign: "right",
    fontSize: 14,
  },
  sortOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  sortOption: {
    fontSize: 16,
    color: "#555",
  },
  sortOptionActive: {
    fontWeight: "bold",
    color: "#000",
  },
  reviewCard: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewRating: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
  },
});

export default GymReviewsScreen;

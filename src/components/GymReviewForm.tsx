import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { addGymReview, getUserReview } from "../services/gymService"; // Updated service imports
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo; adjust if needed
import { auth } from "../services/firebaseConfig";
import GymForceButton from "./GymForceButton";

const GymReviewForm = ({
  gymId,
  onSuccess,
}: {
  gymId: string;
  onSuccess: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ownerNote, setOwnerNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing review on mount
    const fetchReview = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        // Alert.alert("Error", "User is not logged in.");
        setLoading(false);
        return;
      }

      try {
        const review = await getUserReview(gymId, userId);
        if (review) {
          setRating(review.rating || 0);
          setComment(review.comment || "");
          setOwnerNote(review.ownerNote || "");
        }
      } catch (error) {
        console.error("Error fetching user review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [gymId]);

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      // Alert.alert("Invalid Rating", "Please provide a rating between 1 and 5.");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      // Alert.alert("Error", "User is not logged in.");
      return;
    }

    const reviewData = {
      gymId,
      userId,
      rating,
      comment,
      ownerNote,
    };

    console.log("Submitting Review:", reviewData);

    try {
      await addGymReview(reviewData);
      // Alert.alert("Review Submitted", "Thank you for your review!");
      onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      // Alert.alert(
      //   "Submission Error",
      //   "Failed to submit your review. Please try again."
      // );
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
        <Ionicons
          name={index < rating ? "star" : "star-outline"}
          size={32}
          color="#FFD700"
        />
      </TouchableOpacity>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your review...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave a Review</Text>

      <Text style={styles.label}>Rate this Gym:</Text>
      <View style={styles.starsContainer}>{renderStars()}</View>

      <Text style={styles.label}>Comment:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={comment}
        onChangeText={setComment}
        placeholder="Write a comment..."
        multiline
      />

      <Text style={styles.label}>Note to Owner (optional):</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={ownerNote}
        onChangeText={setOwnerNote}
        placeholder="Write a note to the gym owner..."
        multiline
      />

      <GymForceButton
        title="Submit Review"
        onPress={handleSubmit}
        size="large"
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    color: "#555",
    fontWeight: "600",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  loadingContainer: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },
});

export default GymReviewForm;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { addGymReview } from "../services/gymService"; // Adjust path to your addGymReview function
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo; adjust if needed
import { useUserProfileContext } from "../context/UserProfileContext";
import GymForceButton from "./GymForceButton";
import { auth } from "../services/firebaseConfig";

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

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert("Invalid Rating", "Please provide a rating between 1 and 5.");
      return;
    }

    const addGymReviewProps = {
      gymId,
      userId: auth.currentUser?.uid!,
      rating,
      comment,
      ownerNote,
    };
    console.log("Review Submission Data:", addGymReviewProps);

    try {
      await addGymReview(addGymReviewProps);
      Alert.alert("Review Submitted", "Thank you for your review!");
      onSuccess();
    } catch (error) {
      console.error("Error adding review: ", error);
      Alert.alert(
        "Submission Error",
        "Failed to submit your review. Please try again."
      );
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave a Review</Text>

      <Text style={styles.label}>Rate this Gym:</Text>
      <View style={styles.starsContainer}>{renderStars()}</View>

      <Text style={styles.label}>Comment:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={comment}
        onChangeText={(value) => setComment(value)}
        placeholder="Write a comment..."
        multiline
      />

      <Text style={styles.label}>Note to Owner (optional):</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={ownerNote}
        onChangeText={(value) => setOwnerNote(value)}
        placeholder="Write a note to the gym owner..."
        multiline
      />

      <GymForceButton
        title="Submit Review"
        onPress={() => handleSubmit()}
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
  submitButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GymReviewForm;

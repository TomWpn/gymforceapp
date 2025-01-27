import React, { useState } from "react";
import { Alert, ActivityIndicator, StyleSheet, View } from "react-native";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, firestore } from "../services/firebaseConfig";
import GymForceButton from "./GymForceButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppStackParamList";

type SettingsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "Settings"
>;

const DeleteAccountButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const user = auth.currentUser;
              if (!user) {
                throw new Error("No user is currently signed in.");
              }

              // Delete user data from Firestore (example assumes a `users` collection)
              const userDocRef = doc(firestore, "users", user.uid);
              await deleteDoc(userDocRef);

              // Delete Firebase Auth user
              await deleteUser(user);

              // Redirect to the Welcome screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });

              Alert.alert(
                "Account Deleted",
                "Your account and data have been successfully deleted."
              );
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting your account. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GymForceButton
        title="Delete Account"
        onPress={handleDeleteAccount}
        fullWidth={true}
        variant="destructive" // Assuming "destructive" styles the button red
        size="small"
        disabled={loading}
      />
      {loading && <ActivityIndicator style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  loader: {
    marginTop: 8,
  },
});

export default DeleteAccountButton;

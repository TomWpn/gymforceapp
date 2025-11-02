import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Keyboard,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import GymForceButton from "../components/GymForceButton";
import GymForceText from "../components/GymForceText";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppStackParamList";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "ForgotPassword"
>;

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to send password reset email to:", email);

      // Use Firebase Auth's built-in password reset
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent successfully");

      Alert.alert(
        "Reset Email Sent",
        `If an account with ${email} exists, you'll receive a password reset email shortly. Please check your inbox and spam folder.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      let errorMessage = "An error occurred. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage =
          "No account found with this email address. Please check the email or create a new account.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many attempts. Please wait a few minutes before trying again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else {
        // Show the actual error for debugging
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Password Reset Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={{ uri: "https://gymforce.app/assets/images/kettlebell.jpeg" }}
        style={styles.background}
      >
        <View style={styles.overlay} />
        <View style={styles.contentContainer}>
          <GymForceText type="Title" style={styles.title}>
            Reset Password
          </GymForceText>
          <GymForceText type="Subtitle" style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password
          </GymForceText>

          <View style={styles.infoBox}>
            <GymForceText type="Note" style={styles.infoText}>
              💡 Email not arriving?
              {"\n"}• Check your spam/junk folder
              {"\n"}• Wait a few minutes for delivery
              {"\n"}• Verify you're using the correct email address
              {"\n"}• The reset link expires in 1 hour
            </GymForceText>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="none"
            autoCorrect={false}
            autoComplete="off"
          />

          <GymForceButton
            title={loading ? "Sending..." : "Send Reset Email"}
            onPress={handlePasswordReset}
            disabled={loading}
            fullWidth
            variant="primary"
            size="large"
          />

          <FlexibleSpacer top size={32} />
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              navigation.navigate("Login");
            }}
          >
            <GymForceText color="#ff7f50">Back to Login</GymForceText>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  contentContainer: {
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    color: "#1a265a",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  infoBox: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  infoText: {
    color: "#333",
    lineHeight: 20,
  },
});

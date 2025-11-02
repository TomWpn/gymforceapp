import React, { useState } from "react";
import {
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import GymForceButton from "../components/GymForceButton";
import GymForceText from "../components/GymForceText";
import NoMarginView from "../components/NoMarginView";
import Icon from "react-native-vector-icons/MaterialIcons";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

type SignUpScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "SignUp"
>;

const SignUpScreen = () => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const handleSignUp = async () => {
    if (!email || !password) {
      // Alert.alert("Error", "Please enter both an email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setUser(user); // Update context
      navigation.navigate("UserDetails", { mode: "signup" });
    } catch (error: any) {
      const errorMessage = error.message.includes("auth/email-already-in-use")
        ? "This email is already in use."
        : "An error occurred during sign up. Please try again.";
      Alert.alert("Signup Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ImageBackground
          source={{ uri: "https://gymforce.app/assets/images/kettlebell.jpeg" }}
          style={styles.background}
        >
          <View style={styles.overlay} />
          <NoMarginView style={styles.container}>
            <GymForceText type="Title" color="#1a265a" style={styles.title}>
              Create Your Account
            </GymForceText>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
                textContentType="none" // Explicitly disable autofill for this field
                autoCorrect={false}
                autoComplete="off"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  textContentType="none" // Explicitly disable suggestions/autofill
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={passwordVisible ? "visibility" : "visibility-off"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              <GymForceButton
                title={loading ? "Signing Up..." : "Sign Up"}
                onPress={handleSignUp}
                disabled={loading}
                fullWidth
                size="large"
              />
            </View>

            {/* Log In Link */}
            <FlexibleSpacer top size={32} />
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                // Small delay to ensure keyboard dismissal completes before navigation
                setTimeout(() => {
                  navigation.navigate("Login");
                }, 100);
              }}
            >
              <GymForceText color="#ff7f50">
                Already have an account? Log In
              </GymForceText>
            </TouchableOpacity>
          </NoMarginView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#ffffff", // Match your app's background
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, .8)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
    height: 50,
    paddingHorizontal: 10,
    width: "100%",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
});

export default SignUpScreen;

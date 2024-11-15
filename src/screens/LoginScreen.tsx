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
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import GymForceButton from "../components/GymForceButton";
import GymForceText from "../components/GymForceText";
import Icon from "react-native-vector-icons/MaterialIcons";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppStackParamList";

type LogInScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation<LogInScreenNavigationProp>();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
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
            Welcome Back!
          </GymForceText>
          <GymForceText type="Subtitle" style={styles.subtitle}>
            Log in to continue
          </GymForceText>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            fullWidth
            variant="primary"
            size="large"
          />
          {/* Log In Link */}
          <FlexibleSpacer top size={32} />
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <GymForceText color="#ff7f50">
              Don't have an account? Sign Up
            </GymForceText>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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

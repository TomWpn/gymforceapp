import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  View,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { updateUserProfileField } from "../services/userProfileService";
import { auth } from "../services/firebaseConfig";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "../components/GymForceButton";
import GymForceText from "../components/GymForceText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUserProfileContext } from "../context/UserProfileContext";
import FlexibleSpacer from "../components/FlexibleSpacer";

type UserDetailsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "EmployerSelection"
>;
type UserDetailsScreenRouteProp = RouteProp<AppStackParamList, "UserDetails">;

const UserDetailsScreen = () => {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>();
  const route = useRoute<UserDetailsScreenRouteProp>();
  const { mode } = route.params || {}; // "signup" or "edit"
  const { userProfile, refreshUserProfile } = useUserProfileContext();

  const initialName = userProfile?.name || "";
  const initialPhone = userProfile?.phone || "";
  const initialAddress = userProfile?.address?.formatted_address || "";

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [addressDetails, setAddressDetails] = useState(
    userProfile?.address || null
  );
  const [isEditingAddress, setIsEditingAddress] = useState(mode === "signup");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: mode !== "signup",
    });
  }, [navigation, mode]);

  const handleSaveDetails = async () => {
    if (!name || !phone || !addressDetails) {
      // Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      const currentDate = new Date().toISOString();

      await updateUserProfileField(uid, {
        name,
        phone,
        address: addressDetails,
        email: auth.currentUser?.email!,
        ...(mode === "signup" || (userProfile && !userProfile.createdAt)
          ? {
              createdAt: new Date(
                auth.currentUser?.metadata.creationTime!
              ).toISOString(),
            }
          : { updatedAt: currentDate }),
      });

      // Refresh user profile in the context
      await refreshUserProfile();

      // Alert.alert("Success", "Your details have been saved.");
      if (mode === "signup") {
        navigation.navigate("EmployerSelection", { mode: "signup" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving user details:", error);
      // Alert.alert("Error", "Could not save user details.");
    }
  };

  const renderFormField: ListRenderItem<string> = ({ item }) => {
    switch (item) {
      case "name":
        return (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#888"
            defaultValue={initialName}
            onChangeText={setName}
          />
        );
      case "phone":
        return (
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            defaultValue={initialPhone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        );
      case "address":
        return isEditingAddress || mode === "signup" ? (
          <GooglePlacesAutocomplete
            placeholder="Search for your address"
            fetchDetails={true}
            onPress={(data, details = null) => {
              setAddressDetails({
                formatted_address: details?.formatted_address!,
                coordinates: details?.geometry.location!,
              });
              setIsEditingAddress(false);
            }}
            query={{
              key: process.env.GOOGLE_MAPS_API_KEY,
              language: "en",
              components: "country:us",
            }}
            textInputProps={{
              defaultValue: initialAddress,
              onChangeText: (text) => {
                if (!text) setAddressDetails(null);
              },
            }}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.input,
              listView: styles.autocompleteList,
              row: styles.autocompleteRow,
              description: styles.autocompleteDescription,
            }}
          />
        ) : (
          <View style={styles.addressContainer}>
            <GymForceText type="Subtitle" style={styles.addressText}>
              {addressDetails?.formatted_address || "Address not set"}
            </GymForceText>
            <TouchableOpacity onPress={() => setIsEditingAddress(true)}>
              <Icon name="edit" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        );
      case "button":
        return (
          <GymForceButton
            title={mode === "signup" ? "Continue" : "Save Changes"}
            onPress={handleSaveDetails}
            fullWidth
            variant="primary"
            size="large"
          />
        );
      default:
        return null;
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
        <View style={styles.overlay}>
          {mode === "signup" && <FlexibleSpacer top size={32} />}
          <GymForceText type="Title" fontFamily="Gymforce" style={styles.title}>
            {mode === "signup" ? "Welcome to Gym Force!" : "Edit Your Details"}
          </GymForceText>

          <GymForceText type="Subtitle" color="#1a265a" style={styles.subTitle}>
            {mode === "signup"
              ? "Please fill in your details."
              : "Update your information below."}
          </GymForceText>

          <FlatList
            data={["name", "phone", "address", "button"]}
            renderItem={renderFormField}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default UserDetailsScreen;

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
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "100%",
    elevation: 5,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    color: "#1a265a",
  },
  subTitle: {
    textAlign: "center",
    marginBottom: 20,
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
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  autocompleteContainer: {
    width: "100%",
    zIndex: 10,
  },
  autocompleteList: {
    borderWidth: 0,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  autocompleteRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  autocompleteDescription: {
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 30,
  },
});

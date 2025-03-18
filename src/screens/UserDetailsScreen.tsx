import React, { useState, useRef, useEffect } from "react";
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
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { updateUserProfileField } from "../services/userProfileService";
import { auth } from "../services/firebaseConfig";
import { AppStackParamList } from "../navigation/AppStackParamList";
import { StackNavigationProp } from "@react-navigation/stack";
import GymForceButton from "../components/GymForceButton";
import GymForceText from "../components/GymForceText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUserProfileContext } from "../context/UserProfileContext";
import FlexibleSpacer from "../components/FlexibleSpacer";
import { GOOGLE_MAPS_API_KEY } from "@env";

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

  // Debug log for initial addressDetails
  useEffect(() => {
    // console.log("Initial addressDetails:", addressDetails);
  }, []);
  const [isEditingAddress, setIsEditingAddress] = useState(mode === "signup");
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  // Set the initial address text only once when the component mounts
  useEffect(() => {
    if (googlePlacesRef.current && initialAddress && isEditingAddress) {
      googlePlacesRef.current.setAddressText(initialAddress);
    }
  }, [initialAddress, isEditingAddress]);

  // Ensure addressDetails is set if user has an address in their profile
  useEffect(() => {
    if (!addressDetails && userProfile?.address) {
      console.log(
        "Setting addressDetails from userProfile:",
        userProfile.address
      );
      setAddressDetails(userProfile.address);
    }
  }, [addressDetails, userProfile]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: mode !== "signup",
    });
  }, [navigation, mode]);

  const handleSaveDetails = async () => {
    // console.log("handleSaveDetails called");
    // console.log("name:", name);
    // console.log("phone:", phone);
    // console.log("addressDetails:", addressDetails);
    // console.log("isEditingAddress:", isEditingAddress);
    console.log(
      "googlePlacesRef text:",
      googlePlacesRef.current?.getAddressText()
    );

    // If we're not editing the address and addressDetails is null but there's text in the input,
    // try to create addressDetails from the text
    if (!addressDetails && !isEditingAddress && initialAddress) {
      console.log(
        "Creating fallback addressDetails from initialAddress:",
        initialAddress
      );
      setAddressDetails({
        formatted_address: initialAddress,
        coordinates: userProfile?.address?.coordinates || { lat: 0, lng: 0 },
      });

      // Show alert but don't return, let it proceed with the fallback address
      Alert.alert(
        "Warning",
        "Using existing address as fallback. Please verify it's correct."
      );
    } else if (!name || !phone || !addressDetails) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      // console.log("Current user UID:", uid);

      if (!uid) throw new Error("User not authenticated");

      const currentDate = new Date().toISOString();

      // console.log("Updating user profile with:", {
      //   name,
      //   phone,
      //   address: addressDetails,
      //   email: auth.currentUser?.email,
      // });

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

      // console.log("Navigation mode:", mode);
      // console.log("User has employer:", !!userProfile?.employer);
      // console.log("User has gym:", !!userProfile?.gym);

      if (mode === "signup") {
        // If user already has both employer and gym, go directly to Home
        if (userProfile?.employer && userProfile?.gym) {
          console.log(
            "User already has employer and gym, going to Home screen"
          );
          navigation.navigate("Home", { screen: "Dashboard" });
        }
        // If user has employer but no gym, go to GymSelection
        else if (userProfile?.employer) {
          // console.log("User already has employer, skipping to GymSelection");
          navigation.navigate("GymSelection", { mode: "signup" });
        }
        // If user has neither employer nor gym, go to EmployerSelection
        else {
          // console.log("User needs to select an employer");
          navigation.navigate("EmployerSelection", { mode: "signup" });
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving user details:", error);
      Alert.alert("Error", "Could not save user details.");
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
            ref={(instance) => {
              // Store the ref for later use in useEffect
              if (instance) {
                googlePlacesRef.current = instance;
              }
            }}
            placeholder="Search for your address"
            fetchDetails={true}
            onPress={(data, details = null) => {
              // console.log("Google Places onPress - data:", data);
              // console.log("Google Places onPress - details:", details);

              // Always log the current text in the input
              const currentText = googlePlacesRef.current?.getAddressText();
              // console.log("Current address text:", currentText);

              if (
                details &&
                details.formatted_address &&
                details.geometry &&
                details.geometry.location
              ) {
                const newAddressDetails = {
                  formatted_address: details.formatted_address,
                  coordinates: details.geometry.location,
                };

                setAddressDetails(newAddressDetails);
                // console.log("Address details set:", newAddressDetails);

                // Double-check that addressDetails was set correctly
                setTimeout(() => {
                  console.log(
                    "Verifying addressDetails was set:",
                    addressDetails
                  );
                }, 100);

                setIsEditingAddress(false);
              } else if (currentText) {
                // Fallback: If we have text but no details, create a basic address object
                console.log(
                  "Using fallback address from text input:",
                  currentText
                );
                const fallbackAddress = {
                  formatted_address: currentText,
                  coordinates: { lat: 0, lng: 0 },
                };
                setAddressDetails(fallbackAddress);
                // console.log("Fallback address details set:", fallbackAddress);
                setIsEditingAddress(false);
              } else {
                console.error("Missing required address details:", details);
                Alert.alert(
                  "Error",
                  "Could not get complete address details. Please try again."
                );
              }
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: "en",
              components: "country:us",
            }}
            textInputProps={{
              onChangeText: (text) => {
                // console.log("Google Places text input changed:", text);
                if (!text) {
                  // console.log("Clearing address details");
                  setAddressDetails(null);
                }
              },
              placeholderTextColor: "#888",
            }}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.input,
              listView: styles.autocompleteList,
              row: styles.autocompleteRow,
              description: styles.autocompleteDescription,
            }}
            enablePoweredByContainer={false}
          />
        ) : (
          <View style={styles.addressContainer}>
            <GymForceText type="Subtitle" style={styles.addressText}>
              {addressDetails?.formatted_address ||
                initialAddress ||
                "Address not set"}
            </GymForceText>
            <TouchableOpacity
              onPress={() => {
                // console.log("Edit address button pressed");
                // console.log("Current addressDetails:", addressDetails);

                // If addressDetails is null but we have initialAddress, set it
                if (!addressDetails && initialAddress) {
                  console.log(
                    "Setting addressDetails from initialAddress before editing"
                  );
                  setAddressDetails({
                    formatted_address: initialAddress,
                    coordinates: userProfile?.address?.coordinates || {
                      lat: 0,
                      lng: 0,
                    },
                  });
                }

                setIsEditingAddress(true);
              }}
            >
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

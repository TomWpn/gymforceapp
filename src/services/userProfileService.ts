// src/services/userProfileService.ts
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import { UserProfile, Company } from "../types";

// Function to create or initialize a user profile in Firestore
export const createUserProfile = async (
  uid: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(firestore, "users", uid);

  try {
    await setDoc(userRef, profileData, { merge: true }); // Allows adding non-existing fields only
    console.log("User profile created/updated successfully");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

// Function to retrieve a user profile
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  const userRef = doc(firestore, "users", uid);

  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      console.log("No user profile found.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return null;
  }
};

// Function to update specific fields in the user profile
export const updateUserProfileField = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(firestore, "users", uid);

  try {
    await setDoc(userRef, data, { merge: true });
    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
};

// Function to update the employer or gym data in the user profile
export const updateUserProfileWithCompany = async (
  uid: string,
  companyData: Company,
  type: "employer" | "gym"
): Promise<void> => {
  const userRef = doc(firestore, "users", uid);

  try {
    await setDoc(userRef, { [type]: companyData }, { merge: true });
    console.log(`${type} updated successfully in Firestore.`);
  } catch (error) {
    console.error(`Error updating ${type} in Firestore:`, error);
  }
};

// Function to delete a user profile
export const deleteUserProfile = async (uid: string): Promise<void> => {
  const userRef = doc(firestore, "users", uid);

  try {
    await deleteDoc(userRef);
    console.log("User profile deleted successfully");
  } catch (error) {
    console.error("Error deleting user profile:", error);
  }
};

// Function to reset specific fields in the user profile
export const resetUserProfileFields = async (
  uid: string,
  fields: (keyof UserProfile)[]
): Promise<void> => {
  const userRef = doc(firestore, "users", uid);
  const resetData = fields.reduce((acc, field) => {
    acc[field] = undefined; // Setting fields to undefined for easier filtering
    return acc;
  }, {} as Partial<UserProfile>);

  try {
    await updateDoc(userRef, resetData);
    console.log("User profile fields reset successfully");
  } catch (error) {
    console.error("Error resetting user profile fields:", error);
  }
};

import { fetchGymFromHubSpot } from "./hubspotHelper";
import {
  getGymFromFirestore,
  addOrUpdateReviewToFirestore,
  getUserReviewFromFirestore,
} from "./firebaseHelper";
import axios from "axios";
import { auth } from "./firebaseConfig";
import { Alert, Linking } from "react-native";
import { GymReview, Gym, GooglePlacesApiResponse } from "../types";
import { calculateDistance } from "../utils/calculateDistance";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
};

/**
 * Fetches gyms within a specified range of a location.
 */
export const fetchGyms = async (lat: number, lng: number, range: number) => {
  const headers = await getAuthHeaders();

  try {
    const response = await axios.get(
      `${process.env.FIREBASE_FUNCTION_HOST_URL}/getNearbyFacilitiesSecondGen?lat=${lat}&lng=${lng}&range=${range}`,
      { headers }
    );
    return response.data.facilities;
  } catch (error: any) {
    console.error("Error fetching gyms:", error?.response?.data || error);
    throw new Error("Failed to fetch gyms.");
  }
};

/**
 * Opens Google Maps to the gym's location.
 */
export const handleOpenMap = (gym: any) => {
  if (!gym?.properties.address || !gym?.properties.city) {
    Alert.alert("Location unavailable", "No address found for this gym.");
    return;
  }

  const address = `${gym.properties.address}, ${gym.properties.city}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the maps app.");
      }
    })
    .catch((err) => console.error("Error opening map:", err));
};

/**
 * Fetches and combines gym data from Firestore and HubSpot.
 * @param gymId - The ID of the gym.
 * @returns Combined gym data with Firestore and HubSpot fields.
 */
export const getGymDetails = async (gymId: string) => {
  const [firestoreData, hubSpotData] = await Promise.all([
    getGymFromFirestore(gymId),
    fetchGymFromHubSpot(gymId),
  ]);

  // Merge Firestore and HubSpot data, prioritizing HubSpot data where applicable
  const combinedData = {
    ...firestoreData,
    ...hubSpotData,
  };
  console.log("Combined Data:", combinedData);
  return combinedData;
};

/**
 * Fetches a user's existing review for a gym.
 * @param gymId - The ID of the gym.
 * @param userId - The ID of the user.
 * @returns The user's review if it exists; otherwise, null.
 */
export const getUserReview = async (gymId: string, userId: string) => {
  try {
    const review = await getUserReviewFromFirestore(gymId, userId);
    console.log("Fetched User Review:", review);
    return review;
  } catch (error) {
    console.error(
      `Error fetching user review for gymId: ${gymId}, userId: ${userId}`,
      error
    );
    throw new Error("Failed to fetch user review.");
  }
};

/**
 * Adds or updates a review for a gym.
 * @param reviewData - The review data, including gymId, userId, rating, comment, and ownerNote.
 */
export const addGymReview = async (reviewData: GymReview) => {
  try {
    await addOrUpdateReviewToFirestore(reviewData);
    console.log("Review added or updated successfully:", reviewData);
  } catch (error) {
    console.error("Error adding or updating review:", error);
    throw new Error("Failed to add or update review.");
  }
};

/**
 * Fetches non-network gyms and martial arts studios using the Google Places API.
 * @param lat - Latitude of the source location.
 * @param lng - Longitude of the source location.
 * @param range - Range in meters to search within.
 * @returns A list of non-network gyms formatted into the `Gym` type.
 */
export const fetchNonNetworkGyms = async (
  lat: number,
  lng: number,
  range: number
): Promise<Gym[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${range}&type=gym&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get<GooglePlacesApiResponse>(url);

    if (response.data.status !== "OK") {
      console.error("Google Places API error:", response.data.status);
      return [];
    }

    const places = response.data.results;

    // Map API response to `Gym` type
    const gyms: Gym[] = places.map((place) => ({
      id: place.place_id,
      properties: {
        name: place.name,
        address: place.vicinity || null,
        lat: place.geometry.location.lat.toString(),
        lng: place.geometry.location.lng.toString(),
        app_background_image_url: place.photos?.[0]?.photo_reference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          : null,
        lifecyclestage: "non-network",
        plan_nutrition: "N/A",
        plan_personal_training: "N/A",
        description: null,
        createdate: null,
        hs_lastmodifieddate: null,
        hs_object_id: null,
        city: null,
        state: null,
        domain: null,
        zip: null,
        industry: "Fitness",
        owner_blurb: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      distance: calculateDistance(
        { lat, lng },
        { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
      ),
      review: {
        gymId: place.place_id,
        userId: "",
        rating: place.rating || 0,
        comment: "",
        ownerNote: "",
      },
      averageRating: place.rating || 0,
      reviews: [],
      totalReviews: place.user_ratings_total || 0,
      isOnNetwork: false,
    }));

    return gyms;
  } catch (error: any) {
    console.error("Error fetching non-network gyms:", error.message);
    throw new Error("Failed to fetch non-network gyms.");
  }
};

// src/services/locationService.ts
import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Function to get the user's current location
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    // Request permissions to access location
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission not granted");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
};

// Function to calculate the distance between two locations in kilometers
export const calculateDistance = (
  start: Coordinates,
  end: Coordinates
): number => {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;

  const dLat = toRadians(end.latitude - start.latitude);
  const dLon = toRadians(end.longitude - start.longitude);

  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

// Function to watch the user's location with a callback
export const watchLocation = (
  callback: (location: Coordinates) => void
): Location.LocationSubscription | null => {
  try {
    let locationSubscription: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1 },
      (loc) => {
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        callback(coords);
      }
    )
      .then((subscription) => {
        locationSubscription = subscription;
      })
      .catch((error) => {
        console.error("Error watching location:", error);
      });
    return locationSubscription;
  } catch (error) {
    console.error("Error watching location:", error);
    return null;
  }
};

// Function to stop watching the user's location
export const stopWatchingLocation = (
  locationSubscription: Location.LocationSubscription | null
): void => {
  if (locationSubscription) {
    locationSubscription.remove();
    // console.log("Location watching stopped");
  }
};

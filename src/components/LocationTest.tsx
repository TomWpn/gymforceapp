// src/components/LocationTest.tsx
import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { getLocation } from "../services/locationService";

const LocationTest = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleGetLocation = async () => {
    const loc = await getLocation();
    if (loc) {
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Get Location" onPress={handleGetLocation} />
      {location ? (
        <Text>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      ) : (
        <Text>No location data available.</Text>
      )}
    </View>
  );
};

export default LocationTest;

import { useState, useEffect } from "react";
import { getGymDetails } from "../services/gymService"; // Adjust import path

// Define types for the expected data and errors
type GymData = {
  id: string;
  name: string;
  location: string;
  // Add other properties as per your API response
};

type UseGymDataReturn = {
  gymData: GymData | null;
  loading: boolean;
  error: string | null;
  fetchGymData: () => Promise<void>;
};

export const useGymData = (gymId: string | null): UseGymDataReturn => {
  const [gymData, setGymData] = useState<GymData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGymData = async () => {
    if (!gymId) {
      setError("No gym selected.");
      return;
    }

    setLoading(true);
    try {
      const data = await getGymDetails(gymId); // Ensure `getGymDetails` is properly typed
      setGymData(data);
      setError(null); // Clear any previous error
    } catch (err) {
      setError("Failed to load gym information.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymData();
  }, [gymId]);

  return { gymData, loading, error, fetchGymData };
};

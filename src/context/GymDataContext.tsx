import React, { createContext, useContext, useState, useCallback } from "react";
import { getGymDetails } from "../services/gymService"; // Adjust the path
import { Gym } from "../types";

type GymDataContextType = {
  gymData: Gym | null;
  loading: boolean;
  error: string | null;
  fetchGymData: (gymId: string) => Promise<void>;
};

const GymDataContext = createContext<GymDataContextType | undefined>(undefined);

export const GymDataProvider: React.FC = ({
  children,
}: React.PropsWithChildren) => {
  const [gymData, setGymData] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGymData = useCallback(async (gymId: string) => {
    setLoading(true);
    try {
      const data = await getGymDetails(gymId);
      setGymData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch gym data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GymDataContext.Provider value={{ gymData, loading, error, fetchGymData }}>
      {children}
    </GymDataContext.Provider>
  );
};

export const useGymDataContext = (): GymDataContextType => {
  const context = useContext(GymDataContext);
  if (!context) {
    throw new Error("useGymDataContext must be used within a GymDataProvider");
  }
  return context;
};

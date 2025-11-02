import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../services/firebaseConfig";

interface CheckInEligibility {
  canCheckIn: boolean;
  reason?: string;
  lastCheckIn?: Date;
  nextEligibleTime?: Date;
}

export const useCheckInEligibility = () => {
  const [eligibility, setEligibility] = useState<CheckInEligibility | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      setEligibility({ canCheckIn: false, reason: "User not authenticated" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkUserCheckInEligibility = httpsCallable(
        functions,
        "checkUserCheckInEligibility"
      );
      const result = await checkUserCheckInEligibility({
        userId: currentUser.uid,
      });

      const data = result.data as CheckInEligibility;

      // Convert string dates back to Date objects if they exist
      if (data.lastCheckIn) {
        data.lastCheckIn = new Date(data.lastCheckIn);
      }
      if (data.nextEligibleTime) {
        data.nextEligibleTime = new Date(data.nextEligibleTime);
      }

      setEligibility(data);
    } catch (err: any) {
      console.error("Error checking check-in eligibility:", err);
      setError(err.message || "Failed to check eligibility");
      setEligibility({
        canCheckIn: false,
        reason: "Failed to check eligibility",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      checkEligibility();
    }
  }, [auth.currentUser?.uid]);

  return {
    eligibility,
    loading,
    error,
    refetchEligibility: checkEligibility,
  };
};

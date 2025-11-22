import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckInRecord, getCheckInHistory } from "../services/checkInService";
import { auth } from "../services/firebaseConfig";
import { httpsCallable } from "firebase/functions";
import { functions } from "../services/firebaseConfig";
import { format } from "date-fns";

interface GroupedCheckIn {
  gymName: string;
  lastCheckInDate: string;
  checkInCount: number;
}

interface CheckInContextType {
  checkInHistory: CheckInRecord[];
  groupedCheckInHistory: GroupedCheckIn[];
  totalCheckInCount: number;
  fetchCheckInHistory: () => Promise<void>;
  logUserCheckIn: (gymId: string, gymName: string) => Promise<void>;
}

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export const CheckInProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [groupedCheckInHistory, setGroupedCheckInHistory] = useState<
    GroupedCheckIn[]
  >([]);
  const [totalCheckInCount, setTotalCheckInCount] = useState(0);

  const fetchCheckInHistory = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const history = await getCheckInHistory(uid);
      setCheckInHistory(history);

      // Calculate grouped check-ins and total count
      const groupedHistory = history.reduce(
        (acc: Record<string, GroupedCheckIn>, checkIn) => {
          const gymId = checkIn.gymId;
          const gymName = checkIn.gymName;
          const checkInDate = format(
            new Date(checkIn.timestamp.seconds * 1000),
            "MMMM d, yyyy, h:mm a"
          );

          if (!acc[gymId]) {
            acc[gymId] = {
              gymName,
              lastCheckInDate: checkInDate,
              checkInCount: 1,
            };
          } else {
            acc[gymId].lastCheckInDate = checkInDate;
            acc[gymId].checkInCount += 1;
          }
          return acc;
        },
        {}
      );

      setGroupedCheckInHistory(Object.values(groupedHistory));
      setTotalCheckInCount(history.length); // Total check-in count
    } catch (error) {
      console.error("Error fetching check-in history:", error);
    }
  };

  const logUserCheckIn = async (gymId: string, gymName: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Use secure server-side check-in function
      console.log("🔒 Calling secure check-in function...");
      const logSecureCheckIn = httpsCallable(functions, "logSecureCheckIn");

      const result = await logSecureCheckIn({
        userId: uid,
        gymId,
        gymName,
      });

      const checkInResult = result.data as {
        success: boolean;
        message: string;
        checkInId?: string;
      };

      console.log("✅ Secure check-in result:", checkInResult);

      // Handle contest logic via Firebase Function
      try {
        console.log("🎯 Attempting to call handleContestCheckIn function...");
        console.log("Function parameters:", { userId: uid, gymId, gymName });

        const handleContestCheckIn = httpsCallable(
          functions,
          "handleContestCheckIn"
        );

        console.log("🔄 Calling Firebase Function...");
        const contestResult = await handleContestCheckIn({
          userId: uid,
          gymId,
          gymName,
        });

        console.log("✅ Function call completed. Raw result:", contestResult);

        const contestData = contestResult.data as {
          success: boolean;
          contestEnrolled: boolean;
          contestId?: string;
          pointsEarned?: number;
          newTotalPoints?: number;
          currentRank?: number;
          message: string;
        };

        console.log("📊 Contest check-in result:", contestData);

        if (contestData.contestEnrolled) {
          console.log(
            `🏆 Contest processing successful: +${contestData.pointsEarned} points, total: ${contestData.newTotalPoints}, rank: ${contestData.currentRank}`
          );
        } else {
          console.log("ℹ️ Contest not enrolled:", contestData.message);
        }
      } catch (contestError) {
        console.error("❌ Contest processing failed:", contestError);
        if (contestError instanceof Error) {
          console.error("Error details:", {
            name: contestError.name,
            message: contestError.message,
            stack: contestError.stack,
          });
        }
        // Don't throw here as the check-in itself was successful
      }

      await fetchCheckInHistory(); // Refresh check-in history after logging a new check-in
    } catch (error) {
      console.error("Error logging check-in:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCheckInHistory();
  }, []);

  return (
    <CheckInContext.Provider
      value={{
        checkInHistory,
        groupedCheckInHistory,
        totalCheckInCount,
        fetchCheckInHistory,
        logUserCheckIn,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
};

export const useCheckInContext = () => {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error("useCheckInContext must be used within a CheckInProvider");
  }
  return context;
};

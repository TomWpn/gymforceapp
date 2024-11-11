import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CheckInRecord,
  getCheckInHistory,
  logCheckIn,
} from "../services/checkInService";
import { auth } from "../services/firebaseConfig";
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
      await logCheckIn(uid, gymId, gymName);
      await fetchCheckInHistory(); // Refresh check-in history after logging a new check-in
    } catch (error) {
      console.error("Error logging check-in:", error);
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  ContestData,
  ContestUser,
  ContestParticipation,
  ContestStats,
  FeatureFlags,
} from "../types/contest";
import { ContestService } from "../services/contestService";
import { auth } from "../services/firebaseConfig";

interface ContestContextType {
  // Feature flags
  featureFlags: FeatureFlags;
  isContestEnabled: boolean;

  // Contest data
  activeContest: ContestData | null;
  userParticipation: ContestParticipation | null;
  leaderboard: ContestUser[];
  contestStats: ContestStats;

  // Loading states
  isLoading: boolean;
  isLoadingLeaderboard: boolean;

  // Methods
  refreshContestData: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  joinContest: () => Promise<void>;
  updateContestScore: (points?: number) => Promise<void>;

  // User position helpers
  getUserRank: () => number;
  getUserPoints: () => number;
  isUserInContest: () => boolean;
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export const ContestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    checkInContestEnabled: false,
    contestType: "off",
  });
  const [activeContest, setActiveContest] = useState<ContestData | null>(null);
  const [userParticipation, setUserParticipation] =
    useState<ContestParticipation | null>(null);
  const [leaderboard, setLeaderboard] = useState<ContestUser[]>([]);
  const [contestStats, setContestStats] = useState<ContestStats>({
    totalParticipants: 0,
    totalCheckIns: 0,
    averageCheckIns: 0,
    topStreak: 0,
    daysRemaining: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Computed values
  const isContestEnabled =
    featureFlags.checkInContestEnabled && featureFlags.contestType !== "off";

  // Methods
  const refreshContestData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch feature flags
      const flags = await ContestService.getFeatureFlags();
      setFeatureFlags(flags);

      if (flags.checkInContestEnabled && flags.activeContestId) {
        // Fetch active contest
        const contest = await ContestService.getContestById(
          flags.activeContestId
        );
        setActiveContest(contest);

        if (contest) {
          // Fetch user participation
          const participation =
            await ContestService.getUserContestParticipation(contest.id);
          setUserParticipation(participation);

          // Fetch contest stats
          const stats = await ContestService.getContestStats(contest.id);
          setContestStats(stats);
        }
      } else {
        setActiveContest(null);
        setUserParticipation(null);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Error refreshing contest data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    if (!activeContest) return;

    setIsLoadingLeaderboard(true);
    try {
      const users = await ContestService.getContestLeaderboard(
        activeContest.id
      );
      setLeaderboard(users);
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [activeContest]);

  const joinContest = useCallback(async () => {
    if (!activeContest) return;

    try {
      await ContestService.joinContest(activeContest.id);
      await refreshContestData();
      await refreshLeaderboard();
    } catch (error) {
      console.error("Error joining contest:", error);
      throw error;
    }
  }, [activeContest, refreshContestData, refreshLeaderboard]);

  const updateContestScore = useCallback(
    async (points: number = 10) => {
      if (!activeContest) return;

      try {
        await ContestService.updateContestScore(activeContest.id, points);
        await refreshContestData();
        await refreshLeaderboard();
      } catch (error) {
        console.error("Error updating contest score:", error);
        throw error;
      }
    },
    [activeContest, refreshContestData, refreshLeaderboard]
  );

  // Helper methods
  const getUserRank = useCallback(() => {
    return userParticipation?.rank || 0;
  }, [userParticipation]);

  const getUserPoints = useCallback(() => {
    return userParticipation?.points || 0;
  }, [userParticipation]);

  const isUserInContest = useCallback(() => {
    return userParticipation !== null;
  }, [userParticipation]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!activeContest || !auth.currentUser) return;

    const unsubscribeLeaderboard = ContestService.subscribeToContestLeaderboard(
      activeContest.id,
      (users) => {
        setLeaderboard(users);
      }
    );

    const unsubscribeUserData = ContestService.subscribeToUserContestData(
      activeContest.id,
      (participation) => {
        setUserParticipation(participation);
      }
    );

    return () => {
      unsubscribeLeaderboard();
      unsubscribeUserData();
    };
  }, [activeContest]);

  // Initial data fetch
  useEffect(() => {
    refreshContestData();
  }, [refreshContestData]);

  // Refresh leaderboard when contest changes
  useEffect(() => {
    if (activeContest) {
      refreshLeaderboard();
    }
  }, [activeContest, refreshLeaderboard]);

  const contextValue: ContestContextType = {
    // Feature flags
    featureFlags,
    isContestEnabled,

    // Contest data
    activeContest,
    userParticipation,
    leaderboard,
    contestStats,

    // Loading states
    isLoading,
    isLoadingLeaderboard,

    // Methods
    refreshContestData,
    refreshLeaderboard,
    joinContest,
    updateContestScore,

    // Helper methods
    getUserRank,
    getUserPoints,
    isUserInContest,
  };

  return (
    <ContestContext.Provider value={contextValue}>
      {children}
    </ContestContext.Provider>
  );
};

export const useContestContext = () => {
  const context = useContext(ContestContext);
  if (!context) {
    throw new Error("useContestContext must be used within a ContestProvider");
  }
  return context;
};

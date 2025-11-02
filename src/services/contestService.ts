import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { firestore, auth } from "./firebaseConfig";
import {
  ContestData,
  ContestUser,
  ContestParticipation,
  ContestStats,
  FeatureFlags,
} from "../types/contest";

export class ContestService {
  // Feature flags management
  static async getFeatureFlags(): Promise<FeatureFlags> {
    try {
      const flagsDoc = await getDoc(doc(firestore, "config", "featureFlags"));
      if (flagsDoc.exists()) {
        const data = flagsDoc.data();
        return {
          checkInContestEnabled: data.checkInContestEnabled || false,
          contestType: data.contestType || "off",
          contestStartDate: data.contestStartDate?.toDate(),
          contestEndDate: data.contestEndDate?.toDate(),
          activeContestId: data.activeContestId,
        };
      }
      return {
        checkInContestEnabled: false,
        contestType: "off",
      };
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return {
        checkInContestEnabled: false,
        contestType: "off",
      };
    }
  }

  // Contest management
  static async getActiveContest(): Promise<ContestData | null> {
    try {
      const contestsQuery = query(
        collection(firestore, "contests"),
        where("isActive", "==", true),
        limit(1)
      );

      const snapshot = await getDocs(contestsQuery);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate?.toDate
          ? data.startDate.toDate()
          : new Date(data.startDate),
        endDate: data.endDate?.toDate
          ? data.endDate.toDate()
          : new Date(data.endDate),
        isActive: data.isActive,
        gymId: data.gymId,
        participants: data.participants || 0,
        maxParticipants: data.maxParticipants,
        rewards: data.rewards,
        rules: data.rules,
      };
    } catch (error) {
      console.error("Error fetching active contest:", error);
      return null;
    }
  }

  static async getContestById(contestId: string): Promise<ContestData | null> {
    try {
      const contestDoc = await getDoc(doc(firestore, "contests", contestId));
      if (!contestDoc.exists()) return null;

      const data = contestDoc.data();
      return {
        id: contestDoc.id,
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate?.toDate
          ? data.startDate.toDate()
          : new Date(data.startDate),
        endDate: data.endDate?.toDate
          ? data.endDate.toDate()
          : new Date(data.endDate),
        isActive: data.isActive,
        gymId: data.gymId,
        participants: data.participants || 0,
        maxParticipants: data.maxParticipants,
        rewards: data.rewards,
        rules: data.rules,
      };
    } catch (error) {
      console.error("Error fetching contest:", error);
      return null;
    }
  }

  // User participation
  static async joinContest(contestId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    try {
      const batch = writeBatch(firestore);

      // Add user to contest participants
      const participationRef = doc(
        firestore,
        "contestParticipants",
        `${contestId}_${userId}`
      );
      batch.set(participationRef, {
        userId,
        contestId,
        joinedAt: Timestamp.now(),
        points: 0,
        checkIns: 0,
        streak: 0,
        rank: 0,
      });

      // Update contest participant count
      const contestRef = doc(firestore, "contests", contestId);
      const contestDoc = await getDoc(contestRef);
      if (contestDoc.exists()) {
        const currentParticipants = contestDoc.data().participants || 0;
        batch.update(contestRef, {
          participants: currentParticipants + 1,
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("Error joining contest:", error);
      throw error;
    }
  }

  static async getUserContestParticipation(
    contestId: string
  ): Promise<ContestParticipation | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    try {
      const participationDoc = await getDoc(
        doc(firestore, "contestParticipants", `${contestId}_${userId}`)
      );

      if (!participationDoc.exists()) return null;

      const data = participationDoc.data();
      return {
        userId: data.userId,
        contestId: data.contestId,
        joinedAt: data.joinedAt?.toDate
          ? data.joinedAt.toDate()
          : new Date(data.joinedAt),
        points: data.points,
        checkIns: data.checkIns,
        lastCheckInAt: data.lastCheckInAt?.toDate
          ? data.lastCheckInAt.toDate()
          : data.lastCheckInAt
          ? new Date(data.lastCheckInAt)
          : undefined,
        streak: data.streak,
        rank: data.rank,
      };
    } catch (error) {
      console.error("Error fetching user contest participation:", error);
      return null;
    }
  }

  // Leaderboard
  static async getContestLeaderboard(
    contestId: string,
    limitCount: number = 50
  ): Promise<ContestUser[]> {
    try {
      const leaderboardQuery = query(
        collection(firestore, "contestParticipants"),
        where("contestId", "==", contestId),
        orderBy("points", "desc"),
        orderBy("checkIns", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(leaderboardQuery);
      const users: ContestUser[] = [];
      const currentUserId = auth.currentUser?.uid;

      for (let i = 0; i < snapshot.docs.length; i++) {
        const docSnapshot = snapshot.docs[i];
        const data = docSnapshot.data();

        // Fetch user profile for display name
        const userProfileDoc = await getDoc(
          doc(firestore, "users", data.userId)
        );
        const userProfile = userProfileDoc.data() as any;

        users.push({
          id: docSnapshot.id,
          userId: data.userId,
          displayName:
            userProfile?.firstName || userProfile?.email || "Anonymous",
          avatar: userProfile?.avatar,
          points: data.points,
          checkIns: data.checkIns,
          lastCheckIn: data.lastCheckInAt?.toDate
            ? data.lastCheckInAt.toDate()
            : data.lastCheckInAt
            ? new Date(data.lastCheckInAt)
            : new Date(),
          streak: data.streak,
          rank: i + 1,
          isCurrentUser: data.userId === currentUserId,
        });
      }

      return users;
    } catch (error) {
      console.error("Error fetching contest leaderboard:", error);
      return [];
    }
  }

  // Contest scoring
  static async updateContestScore(
    contestId: string,
    pointsToAdd: number = 10
  ): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    try {
      const participationRef = doc(
        firestore,
        "contestParticipants",
        `${contestId}_${userId}`
      );
      let participationDoc = await getDoc(participationRef);

      if (!participationDoc.exists()) {
        console.log("User not in contest, auto-joining...");
        // Auto-join contest if not already joined
        await this.joinContest(contestId);
        console.log("Auto-join completed, re-fetching participation document");
        // Re-fetch the document after joining
        participationDoc = await getDoc(participationRef);
      } else {
        console.log("User already in contest, updating score");
      }

      const currentData = participationDoc.data();
      const newPoints = (currentData?.points || 0) + pointsToAdd;
      const newCheckIns = (currentData?.checkIns || 0) + 1;

      // Calculate streak
      const lastCheckIn = currentData?.lastCheckInAt?.toDate
        ? currentData.lastCheckInAt.toDate()
        : currentData?.lastCheckInAt
        ? new Date(currentData.lastCheckInAt)
        : null;
      const now = new Date();
      const isConsecutiveDay =
        lastCheckIn &&
        now.getTime() - lastCheckIn.getTime() <= 48 * 60 * 60 * 1000 && // Within 48 hours
        (now.getDate() !== lastCheckIn.getDate() ||
          now.getMonth() !== lastCheckIn.getMonth()); // Different day

      const newStreak = isConsecutiveDay ? (currentData?.streak || 0) + 1 : 1;

      await updateDoc(participationRef, {
        points: newPoints,
        checkIns: newCheckIns,
        lastCheckInAt: Timestamp.now(),
        streak: newStreak,
      });

      // Update ranks for all participants
      await this.updateContestRanks(contestId);
    } catch (error) {
      console.error("Error updating contest score:", error);
      throw error;
    }
  }

  static async updateContestRanks(contestId: string): Promise<void> {
    try {
      const participantsQuery = query(
        collection(firestore, "contestParticipants"),
        where("contestId", "==", contestId),
        orderBy("points", "desc"),
        orderBy("checkIns", "desc")
      );

      const snapshot = await getDocs(participantsQuery);
      const batch = writeBatch(firestore);

      snapshot.docs.forEach((doc, index) => {
        batch.update(doc.ref, { rank: index + 1 });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error updating contest ranks:", error);
    }
  }

  // Contest statistics
  static async getContestStats(contestId: string): Promise<ContestStats> {
    try {
      const participantsQuery = query(
        collection(firestore, "contestParticipants"),
        where("contestId", "==", contestId)
      );

      const snapshot = await getDocs(participantsQuery);
      const participants = snapshot.docs.map((doc) => doc.data());

      const totalParticipants = participants.length;
      const totalCheckIns = participants.reduce(
        (sum, p) => sum + (p.checkIns || 0),
        0
      );
      const averageCheckIns =
        totalParticipants > 0
          ? Math.round(totalCheckIns / totalParticipants)
          : 0;
      const topStreak = Math.max(...participants.map((p) => p.streak || 0), 0);

      // Calculate days remaining
      const contest = await this.getContestById(contestId);
      const daysRemaining = contest
        ? Math.max(
            0,
            Math.ceil(
              (contest.endDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 0;

      return {
        totalParticipants,
        totalCheckIns,
        averageCheckIns,
        topStreak,
        daysRemaining,
      };
    } catch (error) {
      console.error("Error fetching contest stats:", error);
      return {
        totalParticipants: 0,
        totalCheckIns: 0,
        averageCheckIns: 0,
        topStreak: 0,
        daysRemaining: 0,
      };
    }
  }

  // Real-time subscriptions
  static subscribeToContestLeaderboard(
    contestId: string,
    callback: (users: ContestUser[]) => void
  ): () => void {
    const leaderboardQuery = query(
      collection(firestore, "contestParticipants"),
      where("contestId", "==", contestId),
      orderBy("points", "desc"),
      orderBy("checkIns", "desc"),
      limit(50)
    );

    return onSnapshot(leaderboardQuery, async (snapshot) => {
      const users: ContestUser[] = [];
      const currentUserId = auth.currentUser?.uid;

      for (let i = 0; i < snapshot.docs.length; i++) {
        const docSnapshot = snapshot.docs[i];
        const data = docSnapshot.data();

        // Fetch user profile for display name
        const userProfileDoc = await getDoc(
          doc(firestore, "users", data.userId)
        );
        const userProfile = userProfileDoc.data() as any;

        users.push({
          id: docSnapshot.id,
          userId: data.userId,
          displayName:
            userProfile?.firstName || userProfile?.email || "Anonymous",
          avatar: userProfile?.avatar,
          points: data.points,
          checkIns: data.checkIns,
          lastCheckIn: data.lastCheckInAt?.toDate
            ? data.lastCheckInAt.toDate()
            : data.lastCheckInAt
            ? new Date(data.lastCheckInAt)
            : new Date(),
          streak: data.streak,
          rank: i + 1,
          isCurrentUser: data.userId === currentUserId,
        });
      }

      callback(users);
    });
  }

  static subscribeToUserContestData(
    contestId: string,
    callback: (participation: ContestParticipation | null) => void
  ): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      callback(null);
      return () => {};
    }

    const participationRef = doc(
      firestore,
      "contestParticipants",
      `${contestId}_${userId}`
    );

    return onSnapshot(participationRef, (doc) => {
      if (!doc.exists()) {
        callback(null);
        return;
      }

      const data = doc.data();
      callback({
        userId: data.userId,
        contestId: data.contestId,
        joinedAt: data.joinedAt?.toDate
          ? data.joinedAt.toDate()
          : new Date(data.joinedAt),
        points: data.points,
        checkIns: data.checkIns,
        lastCheckInAt: data.lastCheckInAt?.toDate
          ? data.lastCheckInAt.toDate()
          : data.lastCheckInAt
          ? new Date(data.lastCheckInAt)
          : undefined,
        streak: data.streak,
        rank: data.rank,
      });
    });
  }
}

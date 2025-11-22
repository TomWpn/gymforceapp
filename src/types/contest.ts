export interface ContestUser {
  id: string;
  displayName: string;
  avatar?: string;
  points: number;
  checkIns: number;
  lastCheckIn: Date;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
  gymId?: string;
  userId: string;
  gymName?: string;
  gymLogo?: string;
}

export interface ContestPeriod {
  type: "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  title: string;
}

export interface ContestData {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  gymId?: string; // If gym-specific contest
  participants: number;
  maxParticipants?: number;
  rewards?: ContestReward[];
  rules?: string[];
}

export interface ContestReward {
  rank: number;
  title: string;
  description: string;
  value?: string;
  icon?: string;
}

export interface ContestParticipation {
  userId: string;
  contestId: string;
  joinedAt: Date;
  points: number;
  checkIns: number;
  lastCheckInAt?: Date;
  streak: number;
  rank: number;
}

export interface FeatureFlags {
  checkInContestEnabled: boolean;
  contestType: "weekly" | "monthly" | "off";
  contestStartDate?: Date;
  contestEndDate?: Date;
  activeContestId?: string;
}

export interface ContestNotification {
  type:
    | "contest_start"
    | "rank_change"
    | "contest_end"
    | "daily_reminder"
    | "streak_milestone";
  title: string;
  message: string;
  data?: any;
}

export interface ContestStats {
  totalParticipants: number;
  totalCheckIns: number;
  averageCheckIns: number;
  topStreak: number;
  daysRemaining: number;
}

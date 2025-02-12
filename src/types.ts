export interface EmailStatus {
  sent: boolean;
  sentAt: Date;
  userClaimedMembership: boolean;
  userClaimedMembershipAt?: Date;
  gymVerifiedMembership: boolean;
  gymVerifiedMembershipAt?: Date;
  verificationToken?: string;
  verificationTokenUsed?: boolean;

  // User metadata
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;

  // Gym metadata
  gymId: string;
  gymName: string;
  gymCity?: string;
  gymState?: string;

  // Email metadata
  emailSubject: string;
  emailContent: string;
  recipientEmail: string;
  recipientContactId: string;
}

import * as admin from "firebase-admin";
import { Company } from "./hubspot";

export interface GroupedCompanies {
  [industry: string]: (Company & { distance: number })[];
}

export interface EmailStatus {
  sent: boolean;
  sentAt: admin.firestore.Timestamp;

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

  // Membership status
  userClaimedMembership?: boolean;
  userClaimedMembershipAt?: admin.firestore.Timestamp;
  gymVerifiedMembership?: boolean;
  gymVerifiedMembershipAt?: admin.firestore.Timestamp;

  // Security
  verificationToken?: string;
  verificationTokenUsed?: boolean;
}

export interface MembershipInterestData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  gymId: string;
  gymName: string;
  gymAddress?: string;
  gymCity?: string;
  gymState?: string;
  gymDomain?: string;
}

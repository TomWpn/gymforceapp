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

export interface Address {
  coordinates: {
    lat: number;
    lng: number;
  };
  formatted_address: string;
}

export interface CompanyProperties {
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: string | null;
  lng: string | null;
  domain: string | null;
  industry: string | null;
  description: string | null;
  owner_blurb: string | null;
  app_background_image_url: string | null;
  lifecyclestage: string | null;
  plan_nutrition: boolean;
  plan_personal_training: boolean;
  createdate: string | null;
  hs_lastmodifieddate: string | null;
  hs_object_id: string | null;
}

export interface Company {
  id: string;
  properties: CompanyProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  distance: number;
}

export interface Gym extends Company {
  isOnNetwork?: boolean;
  review?: {
    gymId: string;
    userId: string;
    rating: number;
    comment: string;
    ownerNote: string;
  };
  averageRating?: number;
  reviews?: Array<{
    userId: string;
    rating: number;
    comment: string;
    ownerNote?: string;
    createdAt: string;
  }>;
  totalReviews?: number;
}

export interface GroupedCompanies {
  [key: string]: Company[];
}

export interface GooglePlacesApiResponse {
  status: string;
  results: Array<{
    place_id: string;
    name: string;
    vicinity: string | null;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    photos?: Array<{
      photo_reference: string;
    }>;
    rating?: number;
    user_ratings_total?: number;
    editorial_summary?: {
      overview: string;
    };
    website?: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
}

export interface GymReview {
  gymId: string;
  userId: string;
  rating: number;
  comment: string;
  ownerNote?: string;
}

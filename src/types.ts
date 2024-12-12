// src/types.ts

import { CheckInRecord } from "./services/checkInService";

// HubSpot Company Properties Interface
export interface CompanyProperties {
  address?: string | null;
  createdate?: string | null;
  description?: string | null;
  hs_lastmodifieddate?: string | null;
  hs_object_id?: string | null;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  domain?: string | null;
  zip?: string | null;
  lifecyclestage: string;
  plan_nutrition: string;
  plan_personal_training: string;
  industry?: string;
  owner_blurb?: string | null;
  lat?: string | null;
  lng?: string | null;
  app_background_image_url?: string | null;
}

// HubSpot Company Interface
export interface Company {
  id: string;
  properties: CompanyProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  distance: number;
}

// Grouped Companies Interface for sorting by industry
export interface GroupedCompanies {
  [industry: string]: Company[];
}

export interface Address {
  coordinates: {
    lat: number;
    lng: number;
  };
  formatted_address: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  address?: Address;
  employer?: Company; // Following the HubSpot Company structure
  gym?: Company; // Following the HubSpot Company structure
  checkInHistory?: CheckInRecord[];
}

export interface GymReview {
  gymId: string;
  userId: string;
  rating: number;
  comment: string;
  ownerNote: string;
}

export type Gym = Company & {
  review: GymReview;
  averageRating: number;
  reviews: GymReview[];
  totalReviews: number;
  isOnNetwork: boolean;
};

export interface GooglePlacesApiResponse {
  html_attributions: string[];
  next_page_token?: string;
  results: GooglePlaceResult[];
  status: string;
}

export interface GooglePlaceResult {
  business_status?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  icon?: string;
  icon_background_color?: string;
  icon_mask_base_uri?: string;
  name: string;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: GooglePlacePhoto[];
  place_id: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  rating?: number;
  reference: string;
  scope: string;
  types: string[];
  user_ratings_total?: number;
  vicinity?: string;
}

export interface GooglePlacePhoto {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

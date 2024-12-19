// src/types.ts

import { AddressComponent } from "react-native-google-places-autocomplete";
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
  plan_nutrition: boolean;
  plan_personal_training: boolean;
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
  createdAt?: string;
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
  place_id: string;
  name: string;
  formatted_address?: string;
  adr_address?: string;
  address_components?: AddressComponent[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
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
  types?: string[];
  icon?: string;
  photos?: Array<{
    height: number;
    html_attributions: string[];
    width: number;
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    special_days?: Array<{
      date: string;
      exception: boolean;
    }>;
    type?: string;
  };
  secondary_opening_hours?: Array<{
    open_now?: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekday_text?: string[];
  }>;
  delivery?: boolean;
  dine_in?: boolean;
  takeout?: boolean;
  curbside_pickup?: boolean;
  serves_beer?: boolean;
  serves_breakfast?: boolean;
  serves_brunch?: boolean;
  serves_dinner?: boolean;
  serves_lunch?: boolean;
  serves_vegetarian_food?: boolean;
  serves_wine?: boolean;
  reservable?: boolean;
  wheelchair_accessible_entrance?: boolean;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    profile_photo_url?: string;
    relative_time_description?: string;
  }>;
  editorial_summary?: {
    overview: string;
  };
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  url?: string;
  website?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  utc_offset_minutes?: number;
}

export interface GooglePlacePhoto {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

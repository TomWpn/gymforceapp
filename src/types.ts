// src/types.ts

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
  website?: string | null;
  zip?: string | null;
  lifecyclestage: string;
  plan_nutrition: string;
  plan_personal_training: string;
  industry?: string;
  owner_blurb?: string | null;
  lat?: string | null;
  lng?: string | null;
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
}

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

export interface Company {
  id: string;
  properties: CompanyProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  distance: number;
}

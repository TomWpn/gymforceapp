// src/utils/profileUtils.ts
import { UserProfile } from "../types";

export const getIncompleteProfileFields = (profile: UserProfile): string[] => {
  const requiredFields: (keyof UserProfile)[] = [
    "name",
    "phone",
    "address",
    "employer",
    "gym",
  ];
  return requiredFields.filter((field) => !profile[field]);
};

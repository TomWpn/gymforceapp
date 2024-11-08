import { Company } from "./Hubspot";

export interface GroupedCompanies {
  [industry: string]: Company[];
}

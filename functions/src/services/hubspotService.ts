// functions/src/services/hubspotService.ts
import axios from "axios";
import { defineString } from "firebase-functions/params";
import { GroupedCompanies } from "../types/gymforce";
import { calculateDistance } from "../utils/calculateDistance";
import { geocodeAddress } from "./googleService";

const HUBSPOT_OAUTH_ACCESS_TOKEN = defineString("HUBSPOT_OAUTH_ACCESS_TOKEN");
const HUBSPOT_BASE_URL = "https://api.hubapi.com/crm/v3/objects/companies";

// Function to generate headers with the resolved HubSpot OAuth token
const getHubSpotHeaders = async () => ({
  Authorization: `Bearer ${await HUBSPOT_OAUTH_ACCESS_TOKEN.value()}`,
  "Content-Type": "application/json",
});

// Function to search employers by name and update missing coordinates if possible
export const searchEmployersInHubSpot = async (query: string) => {
  const filterGroups = [
    {
      filters: [
        { propertyName: "name", operator: "CONTAINS_TOKEN", value: query },
        { propertyName: "type", operator: "EQ", value: "SMB" },
      ],
    },
  ];
  const properties = [
    "name",
    "domain",
    "industry",
    "type",
    "lat",
    "lng",
    "address",
    "city",
    "state",
  ];

  try {
    const headers = await getHubSpotHeaders(); // Retrieve headers with the async token
    const response = await axios.post(
      `${HUBSPOT_BASE_URL}/search`,
      { filterGroups, properties },
      { headers }
    );

    // Process employers: geocode and update if missing lat/lng
    const employers = await Promise.all(
      response.data.results.map(async (employer: any) => {
        let { lat, lng } = employer.properties;

        if (!lat || !lng) {
          const fullAddress = `${employer.properties.address}, ${employer.properties.city}, ${employer.properties.state}`;
          const coordinates = await geocodeAddress(fullAddress);
          if (coordinates) {
            lat = coordinates.lat;
            lng = coordinates.lng;
            await updateCompanyCoordinates(employer.id, lat, lng); // Update HubSpot with lat/lng
          }
        }

        return {
          ...employer,
          properties: { ...employer.properties, lat, lng },
        };
      })
    );

    return employers;
  } catch (error) {
    console.error("Error fetching employers from HubSpot:", error);
    throw error;
  }
};

// Function to search facilities by location and range with distance calculations
export const getFacilitiesFromHubSpot = async (
  location: { lat: number; lng: number },
  range: number
): Promise<GroupedCompanies> => {
  const filterGroups = [
    { filters: [{ propertyName: "type", operator: "EQ", value: "FACILITY" }] },
  ];
  const properties = [
    "name",
    "domain",
    "industry",
    "lat",
    "lng",
    "address",
    "city",
    "state",
  ];

  try {
    const headers = await getHubSpotHeaders(); // Retrieve headers with the async token
    const response = await axios.post(
      `${HUBSPOT_BASE_URL}/search`,
      { filterGroups, properties },
      { headers }
    );

    const companies = await Promise.all(
      response.data.results.map(async (company: any) => {
        let { lat, lng } = company.properties;

        if (!lat || !lng) {
          const fullAddress = `${company.properties.address}, ${company.properties.city}, ${company.properties.state}`;
          const coordinates = await geocodeAddress(fullAddress);
          if (coordinates) {
            lat = coordinates.lat;
            lng = coordinates.lng;
            await updateCompanyCoordinates(company.id, lat, lng);
          }
        }

        return {
          ...company,
          distance:
            lat && lng ? calculateDistance(location, { lat, lng }) : Infinity,
        };
      })
    );

    return companies
      .filter((company) => company.distance <= range)
      .reduce((grouped, company) => {
        const industry = company.properties.industry || "Other";
        if (!grouped[industry]) grouped[industry] = [];
        grouped[industry].push(company);
        return grouped;
      }, {} as GroupedCompanies);
  } catch (error) {
    console.error("Error fetching facilities from HubSpot:", error);
    throw error;
  }
};

// Helper function to update HubSpot company with new lat/lng coordinates
const updateCompanyCoordinates = async (
  companyId: string,
  lat: number,
  lng: number
) => {
  try {
    const headers = await getHubSpotHeaders(); // Retrieve headers with the async token
    await axios.patch(
      `${HUBSPOT_BASE_URL}/${companyId}`,
      { properties: { lat, lng } },
      { headers }
    );
    console.log(`Updated company ${companyId} with lat: ${lat}, lng: ${lng}`);
  } catch (error) {
    console.error(
      `Error updating company ${companyId} coordinates in HubSpot:`,
      error
    );
  }
};

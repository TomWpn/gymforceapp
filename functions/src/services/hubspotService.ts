import axios from "axios";
import { defineString } from "firebase-functions/params";
import { GroupedCompanies } from "../types/gymforce";
import { calculateDistance } from "../utils/calculateDistance";
import { geocodeAddress } from "./googleService";
import { Company } from "../types/Hubspot";

const HUBSPOT_OAUTH_ACCESS_TOKEN = defineString("HUBSPOT_OAUTH_ACCESS_TOKEN");
const HUBSPOT_BASE_URL = "https://api.hubapi.com/crm/v3/objects/companies";

// Function to generate headers with the resolved HubSpot OAuth token
const getHubSpotHeaders = async () => ({
  Authorization: `Bearer ${await HUBSPOT_OAUTH_ACCESS_TOKEN.value()}`,
  "Content-Type": "application/json",
});

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
  "zip",
  "app_background_image_url",
  "owner_blurb",
  "createdate",
  "hs_lastmodifieddate",
  "app_background_image_url",
  "owner_blurb",
  "description",
  "lifecyclestage", // Add any additional properties as needed
];

// New function to fetch a company by ID from HubSpot
export const getCompanyById = async (companyId: string) => {
  try {
    const headers = await getHubSpotHeaders();

    // Specify properties you need

    // Fetch company data from HubSpot with specified properties
    const response = await axios.get(
      `${HUBSPOT_BASE_URL}/${companyId}?properties=${properties.join(",")}`,
      { headers }
    );

    const company = response.data;
    console.log("Fetched company from HubSpot:", company);

    // Check if lat/lng are missing and attempt to update them
    let { lat, lng } = company.properties;

    if (!lat || !lng) {
      const fullAddress = `${company.properties.address}, ${company.properties.city}, ${company.properties.state}, ${company.properties.zip}`;
      const coordinates = await geocodeAddress(fullAddress);
      if (coordinates) {
        lat = coordinates.lat;
        lng = coordinates.lng;
        await updateCompanyCoordinates(companyId, lat, lng);
      }
    }

    // Return the company object with complete properties
    return {
      ...company,
    };
  } catch (error) {
    console.error(`Error fetching company ${companyId} from HubSpot:`, error);
    throw error;
  }
};

// Existing function to search employers by name and update missing coordinates if possible
export const searchEmployersInHubSpot = async (query: string) => {
  const filterGroups = [
    {
      filters: [
        { propertyName: "name", operator: "CONTAINS_TOKEN", value: query },
        { propertyName: "type", operator: "EQ", value: "SMB" },
      ],
    },
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
      response.data.results.map(
        async (employer: Company & { lat?: number; lng?: number }) => {
          let { lat, lng } = employer.properties;

          if (!lat || !lng) {
            const fullAddress = `${employer.properties.address}, ${employer.properties.city}, ${employer.properties.state}`;
            const coordinates = await geocodeAddress(fullAddress);
            if (coordinates) {
              lat = coordinates.lat;
              lng = coordinates.lng;
              await updateCompanyCoordinates(
                employer.id,
                parseFloat(lat!),
                parseFloat(lng!)
              ); // Update HubSpot with lat/lng
            }
          }

          return {
            ...employer,
            properties: { ...employer.properties, lat, lng },
          };
        }
      )
    );

    return employers;
  } catch (error) {
    console.error("Error fetching employers from HubSpot:", error);
    throw error;
  }
};

// Existing function to search facilities by location and range with distance calculations
export const getFacilitiesFromHubSpot = async (
  location: { lat: number; lng: number },
  range: number
): Promise<GroupedCompanies> => {
  const filterGroups = [
    {
      filters: [
        { propertyName: "type", operator: "EQ", value: "FACILITY" },
        { propertyName: "lifecyclestage", operator: "EQ", value: "97079970" },
      ],
    },
  ];

  try {
    const headers = await getHubSpotHeaders(); // Retrieve headers with the async token
    const response = await axios.post(
      `${HUBSPOT_BASE_URL}/search`,
      { filterGroups, properties },
      { headers }
    );

    const companies = await Promise.all(
      response.data.results.map(async (company: Company) => {
        let { lat, lng } = company.properties;

        if (!lat || !lng) {
          const fullAddress = `${company.properties.address}, ${company.properties.city}, ${company.properties.state}`;
          const coordinates = await geocodeAddress(fullAddress);
          if (coordinates) {
            lat = coordinates.lat;
            lng = coordinates.lng;
            await updateCompanyCoordinates(
              company.id,
              parseFloat(lat!),
              parseFloat(lng!)
            );
          }
        }

        return {
          ...company,
          distance:
            lat && lng
              ? calculateDistance(location, {
                  lat: parseFloat(lat!),
                  lng: parseFloat(lng!),
                })
              : Infinity,
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

// Existing helper function to update HubSpot company with new lat/lng coordinates
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

export const createCompanyInHubSpot = async (companyData: {
  name: string;
  domain?: string;
  industry?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  owner_blurb?: string;
  description?: string;
  lifecyclestage?: string;
}) => {
  try {
    const headers = await getHubSpotHeaders();

    // Step 1: Search for an existing company by name and address
    const filterGroups = [
      {
        filters: [
          { propertyName: "name", operator: "EQ", value: companyData.name },
          ...(companyData.address
            ? [
                {
                  propertyName: "address",
                  operator: "EQ",
                  value: companyData.address,
                },
              ]
            : []),
          ...(companyData.city
            ? [
                {
                  propertyName: "city",
                  operator: "EQ",
                  value: companyData.city,
                },
              ]
            : []),
          ...(companyData.state
            ? [
                {
                  propertyName: "state",
                  operator: "EQ",
                  value: companyData.state,
                },
              ]
            : []),
          ...(companyData.zip
            ? [{ propertyName: "zip", operator: "EQ", value: companyData.zip }]
            : []),
        ],
      },
    ];

    const searchResponse = await axios.post(
      `${HUBSPOT_BASE_URL}/search`,
      {
        filterGroups,
        properties: ["name", "address", "city", "state", "zip", "id"],
      },
      { headers }
    );

    // Step 2: Check if a matching company already exists
    if (searchResponse.data.total > 0) {
      const existingCompany = searchResponse.data.results[0];
      console.log("Company already exists in HubSpot:", existingCompany);
      return existingCompany; // Return the existing company's data
    }

    // Step 3: Create a new company if no match is found
    const payload = {
      properties: {
        name: companyData.name,
        domain: companyData.domain || "",
        industry: companyData.industry || "",
        type: companyData.type || "",
        address: companyData.address || "",
        city: companyData.city || "",
        state: companyData.state || "",
        zip: companyData.zip || "",
        owner_blurb: companyData.owner_blurb || "",
        description: companyData.description || "",
        lifecyclestage: companyData.lifecyclestage || "",
      },
    };

    const response = await axios.post(HUBSPOT_BASE_URL, payload, { headers });
    return response.data; // Return the newly created company's data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error creating or checking company in HubSpot:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error creating or checking company in HubSpot:", error);
    }
    throw new Error("Failed to create or find company in HubSpot");
  }
};

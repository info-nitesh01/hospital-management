/**
 * Clients API
 *
 * All API calls related to the clients page
 */

import { clientsApi } from "../global-http";
import type { ApiClientsResponse, ApiClientData, ClientFilters, ClientDetailData, GetClientByIdResponse, GraphDataPoint, GetGraphDataResponse } from "./types";

/**
 * Get paginated list of clients with optional filters
 * @param pageNumber - Page number (1-based)
 * @param pageSize - Number of items per page
 * @param sortBy - Sort direction ("asc" | "desc")
 * @param sortIndex - Column index to sort by
 * @param filters - Optional filter parameters (clientName, clientStatus, etc.)
 */
export const getClients = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  sortBy: string = "desc",
  sortIndex?: number,
  filters?: ClientFilters
): Promise<ApiClientsResponse> => {
  // Build query parameters
  const params: Record<string, string | number> = {
    pageNumber,
    pageSize,
    sortBy,
  };

  // Add sortIndex if provided
  if (sortIndex !== undefined) {
    params.sortIndex = sortIndex;
  }

  // Add filters if provided (comma-separated values for multi-select)
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          // Join array values with comma
          params[key] = value.join(',');
        } else if (!Array.isArray(value) && value !== '') {
          // Add string or number values directly
          params[key] = value as string | number;
        }
      }
    });
  }

  const response = await clientsApi.getInstance().get<ApiClientsResponse>("/Clients", {
    params,
  });
  return response.data;
};

/**
 * Get client checkboxes data with optional filters
 * @param params - Query parameters including pagination and filters
 * @returns Promise with array of client data for checkboxes
 */
export const getClientCheckBoxes = async (params: {
  pageNumber?: number;
  pageSize?: number;
  filters?: ClientFilters;
} = {}): Promise<ApiClientData[]> => {
  const queryParams: Record<string, string | number> = {
    pageNumber: params.pageNumber || 1,
    pageSize: params.pageSize || 2147483647,
  };

  // Add filters if provided (same format as getClients)
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          queryParams[key] = value.join(',');
        } else if (!Array.isArray(value) && value !== '') {
          queryParams[key] = value as string | number;
        }
      }
    });
  }

  const response = await clientsApi.getInstance().get<{
    code: number;
    content: ApiClientData[];
  }>("/Clients/GetClientCheckBoxes", {
    params: queryParams,
  });
  return response.data.content;
};

/**
 * Get client details by ID
 * @param clientId - Client ID to fetch
 * @returns Promise with client detail data
 */
export const getClientById = async (clientId: string): Promise<ClientDetailData> => {
  const response = await clientsApi.getInstance().get<GetClientByIdResponse>(
    `/Clients/GetClientById/${clientId}`
  );

  const clientData = response.data.content;

  // Parse billingSettings JSON string and extract individual fields
  if (clientData.billingSettings) {
    try {
      const billingSettingsArray = JSON.parse(clientData.billingSettings);
      if (Array.isArray(billingSettingsArray) && billingSettingsArray.length > 0) {
        const settings = billingSettingsArray[0];

        // Map billing settings to individual fields
        clientData.contingencyPercentage = settings.ContingencyPercentage ?? null;
        clientData.discount = settings.Discount ?? null;
        clientData.maximumCap = settings.MaxBillingCap ?? null;
        clientData.minimumBilling = settings.MinBillingCap ?? null;

        // Map additional fees
        if (settings.AdditionalFeePerAccount && Array.isArray(settings.AdditionalFeePerAccount)) {
          clientData.additionalFees = settings.AdditionalFeePerAccount.map((fee: { FeeType: string; FeeValue: number }) => ({
            feeType: fee.FeeType,
            feeValue: fee.FeeValue,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to parse billingSettings:', error);
    }
  }

  return clientData;
};

/**
 * Get FMV (Fair Market Value) graph data by year for a client
 * @param clientId - Client ID to fetch graph data for
 * @returns Promise with array of yearly FMV data
 */
export const getClientGraphData = async (clientId: string): Promise<GraphDataPoint[]> => {
  const response = await clientsApi.getInstance().get<GetGraphDataResponse>(
    `/Clients/GetGraphData/${clientId}`
  );
  return response.data.content;
};

// Export preload APIs for add client modal
export { getClientTypes, useClientTypes, getStatesByClientId, useStates, getCitiesByStateCode, useCities, getCountiesByStateCode, useCounties, getZipCodes, useZipCodes, getClientManagers, useClientManagers, getSalesManagers, useSalesManagers } from "./add/preload-apis";

// Export update client API
export { updateClient, useUpdateClient } from "./update/update-client-api";

// Re-export for use in module
import { updateClient } from "./update/update-client-api";

// Export all client API functions
const clientsApiModule = {
  getClients,
  getClientCheckBoxes,
  getClientById,
  getClientGraphData,
  updateClient,
};

export default clientsApiModule;
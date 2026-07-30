import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../global-http";
import type { SearchableInputOption } from "@/components/commonComponents/SearchableInput";

/**
 * Interface for individual client type item from API response
 */
interface ClientTypeItem {
  clientType: string;
}

/**
 * Interface for GetClientType API response
 */
interface GetClientTypeResponse {
  code: number;
  content: ClientTypeItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

/**
 * Interface for individual state item from API response
 */
interface StateItem {
  stateCode: string;
}

/**
 * Interface for GetStatesByClientId API response
 */
interface GetStatesByClientIdResponse {
  code: number;
  content: StateItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

/**
 * Interface for individual city item from API response
 */
interface CityItem {
  city: string;
}

/**
 * Interface for GetCityByClientId API response
 */
interface GetCityByClientIdResponse {
  code: number;
  content: CityItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

/**
 * Interface for individual county item from API response
 */
interface CountyItem {
  county: string;
}

/**
 * Interface for GetCountyByClientId API response
 */
interface GetCountyByClientIdResponse {
  code: number;
  content: CountyItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

/**
 * Interface for individual zip code item from API response
 */
interface ZipCodeItem {
  zipCode: string;
}

/**
 * Interface for GetZipByClientId API response
 */
interface GetZipByClientIdResponse {
  code: number;
  content: ZipCodeItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

/**
 * Fetches client types from the API
 * @returns Promise with client types response
 */
export const getClientTypes = async (): Promise<GetClientTypeResponse> => {
  const response = await clientsApi.getInstance().get<GetClientTypeResponse>(
    "/AdvancedSearch/GetClientType"
  );
  return response.data;
};

/**
 * Custom hook to fetch client types using TanStack Query
 * @param enabled - Controls when the API is called (lazy loading on user interaction)
 * @returns Query result with client type options formatted for SearchableInput
 */
export function useClientTypes(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "clientTypes"],
    queryFn: getClientTypes,
    enabled: enabled, // Only fetch when dropdown is opened/focused
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.clientType,
        label: item.clientType,
      })),
  });
}

/**
 * Fetches states by client ID from the API
 * @returns Promise with states response
 */
export const getStatesByClientId = async (): Promise<GetStatesByClientIdResponse> => {
  const response = await clientsApi.getInstance().get<GetStatesByClientIdResponse>(
    "/Clients/GetStatesByClientId"
  );
  return response.data;
};

/**
 * Custom hook to fetch states using TanStack Query
 * @param enabled - Controls when the API is called (lazy loading on user interaction)
 * @returns Query result with state options formatted for SearchableInput
 */
export function useStates(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "states"],
    queryFn: getStatesByClientId,
    enabled: enabled, // Only fetch when dropdown is opened/focused
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.stateCode,
        label: item.stateCode,
      })),
  });
}

/**
 * Fetches cities by state code from the API
 * @param stateCode - The state code to filter cities by
 * @returns Promise with cities response
 */
export const getCitiesByStateCode = async (stateCode: string): Promise<GetCityByClientIdResponse> => {
  const response = await clientsApi.getInstance().get<GetCityByClientIdResponse>(
    "/Clients/GetCityByClientId",
    {
      params: { stateCode }
    }
  );
  return response.data;
};

/**
 * Custom hook to fetch cities by state code using TanStack Query
 * @param stateCode - The state code to filter cities by
 * @param enabled - Controls when the API is called
 * @returns Query result with city options formatted for SearchableInput
 */
export function useCities(stateCode: string | null, enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "cities", stateCode],
    queryFn: () => getCitiesByStateCode(stateCode!),
    enabled: enabled && !!stateCode, // Only fetch when dropdown is opened/focused AND stateCode is provided
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.city,
        label: item.city,
      })),
  });
}

/**
 * Fetches counties by state code from the API
 * @param stateCode - The state code to filter counties by
 * @returns Promise with counties response
 */
export const getCountiesByStateCode = async (stateCode: string): Promise<GetCountyByClientIdResponse> => {
  const response = await clientsApi.getInstance().get<GetCountyByClientIdResponse>(
    "/Clients/GetCountyByClientId",
    {
      params: { stateCode }
    }
  );
  return response.data;
};

/**
 * Custom hook to fetch counties by state code using TanStack Query
 * @param stateCode - The state code to filter counties by
 * @param enabled - Controls when the API is called
 * @returns Query result with county options formatted for SearchableInput
 */
export function useCounties(stateCode: string | null, enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "counties", stateCode],
    queryFn: () => getCountiesByStateCode(stateCode!),
    enabled: enabled && !!stateCode, // Only fetch when dropdown is opened/focused AND stateCode is provided
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.county,
        label: item.county,
      })),
  });
}

/**
 * Fetches zip codes from the API
 * @returns Promise with zip codes response
 */
export const getZipCodes = async (): Promise<GetZipByClientIdResponse> => {
  const response = await clientsApi.getInstance().get<GetZipByClientIdResponse>(
    "/Clients/GetZipByClientId"
  );
  return response.data;
};

/**
 * Custom hook to fetch zip codes using TanStack Query
 * @param enabled - Controls when the API is called (lazy loading on user interaction)
 * @returns Query result with zip code options formatted for SearchableInput
 */
export function useZipCodes(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "zipCodes"],
    queryFn: getZipCodes,
    enabled: enabled, // Only fetch when dropdown is opened/focused
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.zipCode,
        label: item.zipCode,
      })),
  });
}

/**
 * Interface for individual client manager item from API response
 */
interface ClientManagerItem {
  clientManagerId: string;
  clientManager: string;
}

/**
 * Interface for GetClientManagerLookup API response
 */
interface GetClientManagerLookupResponse {
  code?: number;
  content?: ClientManagerItem[];
  currentFileId?: null | string;
  currentAssessmentId?: null | string;
}

/**
 * Fetches client managers from the API
 * @returns Promise with client managers response
 */
export const getClientManagers = async (): Promise<ClientManagerItem[]> => {
  const response = await clientsApi.getInstance().get<GetClientManagerLookupResponse | ClientManagerItem[]>(
    "/Clients/GetClientManagerLookup"
  );
  // Handle both response formats: array directly or wrapped in content
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.content || [];
};

/**
 * Custom hook to fetch client managers using TanStack Query
 * @param enabled - Controls when the API is called (lazy loading on user interaction)
 * @returns Query result with client manager options formatted for SearchableInput
 */
export function useClientManagers(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "clientManagers"],
    queryFn: getClientManagers,
    enabled: enabled, // Only fetch when dropdown is opened/focused
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.map((item) => ({
        value: item.clientManagerId,
        label: item.clientManager,
      })),
  });
}

/**
 * Interface for individual contact type item from API response
 */
interface ContactTypeItem {
  contactType: string;
}

/**
 * Interface for GetContactType API response
 */
interface GetContactTypeResponse {
  code: number;
  content: ContactTypeItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

/**
 * Fetches contact types from the API
 * @returns Promise with contact types response
 */
export const getContactTypes = async (): Promise<GetContactTypeResponse> => {
  const response = await clientsApi.getInstance().get<GetContactTypeResponse>(
    "/AdvancedSearch/GetContactType"
  );
  return response.data;
};

/**
 * Custom hook to fetch contact types using TanStack Query
 * @param enabled - Controls when the API is called (lazy loading on user interaction)
 * @returns Query result with contact type options formatted for SearchableInput
 */
export function useContactTypes(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "contactTypes"],
    queryFn: getContactTypes,
    enabled: enabled, // Only fetch when dropdown is opened/focused
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.contactType,
        label: item.contactType,
      })),
  });
}

/**
 * Interface for individual sales manager item from API response
 */
interface SalesManagerItem {
  salesManagerId: string;
  salesManager: string;
}

/**
 * Interface for GetSalesManagerLookup API response
 */
interface GetSalesManagerLookupResponse {
  code?: number;
  content?: SalesManagerItem[];
  currentFileId?: null | string;
  currentAssessmentId?: null | string;
}

/**
 * Fetches sales managers from the API
 * @returns Promise with sales managers response
 */
export const getSalesManagers = async (): Promise<SalesManagerItem[]> => {
  const response = await clientsApi.getInstance().get<GetSalesManagerLookupResponse | SalesManagerItem[]>(
    "/Clients/GetSalesManagerLookup"
  );
  // Handle both response formats: array directly or wrapped in content
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.content || [];
};

/**
 * Custom hook to fetch sales managers using TanStack Query
 * @param enabled - Controls when the API is called (lazy loading on user interaction)
 * @returns Query result with sales manager options formatted for SearchableInput
 */
export function useSalesManagers(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "add", "salesManagers"],
    queryFn: getSalesManagers,
    enabled: enabled, // Only fetch when dropdown is opened/focused
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
    select: (data): SearchableInputOption[] =>
      data.map((item) => ({
        value: item.salesManagerId,
        label: item.salesManager,
      })),
  });
}

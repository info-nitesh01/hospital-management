import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../../global-http";

/**
 * Interface for contact information in AddClient payload
 */
export interface AddClientContact {
  contactType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

/**
 * Interface for AddClient API request payload
 */
export interface AddClientPayload {
  clientName: string;
  clientShortName: string;
  clientType: string;
  clientStatus: string;
  state: string;
  city: string;
  county: string;
  address: string;
  zip: string;
  clientManager: string;
  salesManager: string;
  notes: string;
  contacts: AddClientContact[];
}

/**
 * Interface for AddClient API response
 */
export interface AddClientResponse {
  code: number;
  content: string; // Returns the new client ID
}

/**
 * Adds a new client to the system
 * @param payload - The client data to submit
 * @returns Promise with the AddClient response containing the new client ID
 */
export const addClient = async (payload: AddClientPayload): Promise<AddClientResponse> => {
  console.log('[ADD CLIENT] Form data submitted:', JSON.stringify(payload, null, 2));
  // Use getInstance().post directly to get the raw response
  // The API returns { code: 200, content: "clientId" } format
  const response = await clientsApi.getInstance().post<AddClientResponse>(
    "/Clients/AddClient",
    payload
  );
  // Return the response data directly (not response.data.data)
  return response.data;
};

/**
 * Custom hook to add a client using TanStack Query mutation
 * @returns Mutation object with mutate, mutateAsync functions and state
 */
export function useAddClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      // Invalidate and refetch specific queries after successful addition
      // Only invalidate clients list queries, not the "add" preload queries
      queryClient.invalidateQueries({
        queryKey: ["clients"],
        predicate: (query) => {
          // Only invalidate if it's NOT an "add" preload query
          const key = query.queryKey as string[];
          return key[0] === "clients" && key[1] !== "add";
        }
      });
      // Invalidate client checkboxes (matches ["client", "checkboxes"])
      queryClient.invalidateQueries({ queryKey: ["client", "checkboxes"] });
    },
  });
}

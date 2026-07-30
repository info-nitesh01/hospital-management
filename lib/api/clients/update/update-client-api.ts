import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../../global-http";
import type { AddClientPayload } from "../add/add-client-api";

/**
 * Interface for UpdateClient API request payload
 * Extends AddClientPayload with required clientId field
 */
export interface UpdateClientPayload extends AddClientPayload {
  clientId: string;
}

/**
 * Interface for UpdateClient API response
 */
export interface UpdateClientResponse {
  code: number;
  content: string; // Returns success message or updated client ID
}

/**
 * Updates an existing client in the system
 * @param payload - The client data to update including clientId
 * @returns Promise with the UpdateClient response
 */
export const updateClient = async (payload: UpdateClientPayload): Promise<UpdateClientResponse> => {
  console.log('[UPDATE CLIENT] Form data submitted:', JSON.stringify(payload, null, 2));
  const response = await clientsApi.getInstance().post<UpdateClientResponse>(
    "/Clients/UpdateClient",
    payload
  );
  return response.data;
};

/**
 * Custom hook to update a client using TanStack Query mutation
 * @returns Mutation object with mutate, mutateAsync functions and state
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (_data, variables) => {
      // Invalidate and refetch specific queries after successful update
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
      // Invalidate the specific client query that was updated
      queryClient.invalidateQueries({ queryKey: ["client", variables.clientId] });
      // Invalidate the client detail page query
      queryClient.invalidateQueries({ queryKey: ["client-detail", variables.clientId] });
    },
  });
}

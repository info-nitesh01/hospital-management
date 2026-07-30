import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../../global-http";

/**
 * Request payload for save/update client billing
 */
export interface SaveClientBillingPayload {
  clientId: string;
  billingMethod: string;
  billingSettings: string; // JSON stringified billing settings object
  additionalFeePerAccount: Array<{
    feeType: string;
    feeValue: number;
  }>;
  billingInternalNotes: string;
  billingClientNotes: string;
  billingManager: string;
  defaultTaxRateSource: string;
  defaultTaxRateType: string;
  defaultAssessment: string;
}

/**
 * API response structure
 */
export interface SaveClientBillingResponse {
  code: number;
  content: string;
}

/**
 * Saves or updates client billing information
 */
export const saveClientBilling = async (
  payload: SaveClientBillingPayload
): Promise<SaveClientBillingResponse> => {
  console.log('[SAVE BILLING] Form data submitted:', JSON.stringify(payload, null, 2));
  const response = await clientsApi.getInstance().post<SaveClientBillingResponse>(
    "/Clients/AddUpdateClientBillingMethod",
    payload
  );
  return response.data;
};

/**
 * Custom hook for save/update client billing mutation
 */
export function useSaveClientBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveClientBilling,
    onSuccess: (_data, variables) => {
      // Invalidate client detail query
      queryClient.invalidateQueries({
        queryKey: ["client-detail", variables.clientId],
      });

      // Invalidate specific client query
      queryClient.invalidateQueries({
        queryKey: ["client", variables.clientId],
      });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../global-http";
import type { SearchableInputOption } from "@/components/commonComponents/SearchableInput";

interface AccountManagerItem {
  userId: string;
  accountManager: string;
}

interface GetAccountManagersResponse {
  code: number;
  content: AccountManagerItem[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

const CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 2,
} as const;

export function useAccountManagers(enabled: boolean = false) {
  return useQuery({
    queryKey: ["clients", "billing", "accountManagers"],
    queryFn: async (): Promise<GetAccountManagersResponse> => {
      const response = await clientsApi.getInstance().get<GetAccountManagersResponse>(
        "/AdvancedSearch/GetAccountManagerLookup"
      );
      return response.data;
    },
    enabled,
    ...CACHE_CONFIG,
    select: (data): SearchableInputOption[] =>
      data.content.map((item) => ({
        value: item.userId, // Use userId as value for API
        label: item.accountManager, // Use accountManager name as display label
      })),
  });
}

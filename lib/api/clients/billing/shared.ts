import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../global-http";
import type { SearchableInputOption } from "@/components/commonComponents/SearchableInput";

interface BaseApiResponse<T> {
  code: number;
  content: T[];
  currentFileId: null | string;
  currentAssessmentId: null | string;
}

const CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 2,
} as const;

export function createBillingQuery<T, K extends keyof T>(
  endpoint: string,
  queryKey: string[],
  fieldName: K
) {
  return (enabled: boolean = false) =>
    useQuery({
      queryKey,
      queryFn: async (): Promise<BaseApiResponse<T>> => {
        const response = await clientsApi.getInstance().get<BaseApiResponse<T>>(endpoint);
        return response.data;
      },
      enabled,
      ...CACHE_CONFIG,
      select: (data): SearchableInputOption[] =>
        data.content.map((item) => ({
          value: String(item[fieldName]),
          label: String(item[fieldName]),
        })),
    });
}

export function createSimpleQuery<T, K extends keyof T>(
  endpoint: string,
  queryKey: string[],
  fieldName: K
) {
  return (enabled: boolean = false) =>
    useQuery({
      queryKey,
      queryFn: async (): Promise<BaseApiResponse<T>> => {
        const response = await clientsApi.getInstance().get<BaseApiResponse<T>>(endpoint);
        return response.data;
      },
      enabled,
      ...CACHE_CONFIG,
      select: (data): string[] => data.content.map((item) => String(item[fieldName])),
    });
}

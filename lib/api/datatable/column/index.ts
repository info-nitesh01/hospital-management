import { clientsApi } from "../../global-http";
import type { ColumnFilterParams, ColumnFilterResponse, FilterTypeConfig } from "./types";

/**
 * Generic function to fetch filter data from any column filter endpoint
 */
const getFilterData = async (
  endpoint: string,
  fieldName: string,
  idPrefix: string,
  { fromRange = 0, toRange = 50, searchTerm, currentFilters }: ColumnFilterParams
): Promise<ColumnFilterResponse> => {
  try {
    const params = {
      fromRange,
      toRange,
      ...(searchTerm && { [fieldName]: searchTerm }),
      ...(currentFilters && currentFilters),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[getFilterData] ${endpoint} - Params:`, params);
    }

    const response = await clientsApi.getInstance().get<{
      code: number;
      content: Array<Record<string, string>>;
    }>(endpoint, { params });

    const content = response.data?.content || [];

    const data = content.map((item, index) => ({
      id: `${idPrefix}-${fromRange + index}`,
      clientName: item[fieldName],
      [fieldName]: item[fieldName],
    }));

    const hasMore = data.length === toRange && data.length > 0;

    return {
      data,
      hasMore,
      totalCount: data.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch filter data from ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Dynamic filter data fetcher that works with any registered filter type
 * @param filterType - The filter type key (e.g., "clientName", "clientShortName")
 * @param params - Pagination and search parameters
 * @param registry - The filter type registry to use
 */
export const getFilterDataByType = async (
  filterType: string,
  params: ColumnFilterParams,
  registry: Record<string, FilterTypeConfig>
): Promise<ColumnFilterResponse> => {
  const config = registry[filterType];

  if (!config) {
    throw new Error(
      `Filter type "${filterType}" is not registered. Available types: ${Object.keys(registry).join(', ')}`
    );
  }

  return getFilterData(config.endpoint, config.fieldName, config.idPrefix, params);
};

// Export query keys and hooks for TanStack Query integration
export * from "./queryKeys";
export * from "./hooks";

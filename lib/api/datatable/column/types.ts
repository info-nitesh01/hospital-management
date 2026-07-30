/**
 * Column Filter API Types
 */

export interface ClientNameFilterItem {
  id: string;
  clientName: string;
  clientShortName?: string;
  isSelected?: boolean;
}

export interface ColumnFilterParams {
  fromRange: number;
  toRange: number;
  searchTerm?: string;
  currentFilters?: Record<string, string | number | undefined>;
}

export interface ColumnFilterResponse {
  data: ClientNameFilterItem[];
  hasMore: boolean;
  totalCount?: number;
}

export interface DynamicFilterOptions {
  enabled: boolean;
  pageSize?: number;
  loadMoreOnScroll?: boolean;
  searchable?: boolean;
}

/**
 * Configuration for a dynamic filter type
 */
export interface FilterTypeConfig {
  endpoint: string;
  fieldName: string;
  idPrefix: string;
}
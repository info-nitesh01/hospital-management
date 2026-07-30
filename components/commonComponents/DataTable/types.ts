import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import * as React from "react";
import type { FilterTypeConfig } from "@/lib/api/datatable/column/types";
import type { TransformedFilters } from "./utils/transformFilters";
import type { ScreenName } from "@/lib/constants";

// Extend TanStack Table's ColumnMeta to include custom properties
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    title?: string;
    width?: number;
    sticky?: "left" | "right";
  }
}

// Re-export TransformedFilters for convenience
export type { TransformedFilters };

export interface SavedFilter {
  id: string;
  name: string;
  filters: ColumnFiltersState; // Internal TanStack Table format for restoration
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  showColumnVisibility?: boolean;
  className?: string;
  pageSize?: number;
  storageKey?: string;
  onFiltersChange?: (filters: TransformedFilters) => void; // Receives API-ready transformed filters
  onPaginationChange?: (pageNumber: number, pageSize: number) => void;
  // Server-side sorting props
  serverSideSort?: {
    sortIndex?: number; // Currently active sort index from API
    sortBy?: "asc" | "desc"; // Currently active sort direction from API
    onSortChange?: (sortIndex: number, sortBy: "asc" | "desc") => void; // Handler for sort changes
  };
  // Row selection props
  getRowId?: (row: TData) => string; // Function to extract unique ID from row (required for cross-page selection)
  enableCrossPageSelection?: boolean; // Enable selection across multiple pages (default: false)
  allRowIds?: string[]; // All available row IDs for cross-page selection
  // Floating Action Bar props
  onEdit?: (selectedRows: TData[]) => void;
  onDelete?: (selectedRows: TData[]) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: TData[]) => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    className?: string;
  }>;
  // Toolbar actions (rendered before manage columns button)
  toolbarActions?: React.ReactNode | ((selectedIds: string[]) => React.ReactNode);
  // Quick search props
  showQuickSearch?: boolean; // Enable quick search feature
  quickSearchApiUrl?: string; // API URL for quick search
  quickSearchPlaceholder?: string; // Placeholder for quick search input
  onQuickSearchSelect?: (result: QuickSearchResult) => void; // Handler when search result is selected
  onQuickSearchClear?: () => void; // Handler when search is cleared
  // Filter API functions for server-side filtering
  filterApiFunctions?: Record<string, FilterTypeConfig>;
  // Column configuration - disable filtering for specific columns
  disableFiltering?: string[]; // Array of dataIndex values to disable filtering
  // Export props
  showExport?: boolean; // Show export button in floating action bar when rows are selected
  exportConfig?: ExportConfig; // Export configuration (screenName or custom onExport function)
}

export interface QuickSearchResult {
  key: string;
  description: string;
  quickSearchDescription: string;
}

export interface ActionItem<TData> {
  label: string;
  onClick: (data: TData) => void;
  icon?: React.ReactNode;
}

export interface TablePreferences {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  pinnedColumn: string | null;
}

export type ExportMode = "all" | "filtered" | "selected";

export interface ExportInfo {
  data: unknown[];
  count: number;
  mode: ExportMode;
}

export interface ActiveFilter {
  id: string;
  name: string;
  count: number;
}

export interface FilterValue {
  id: string;
  value: unknown;
}

// Export configuration for DataTable
export type ExportConfig =
  | { screenName: ScreenName }
  | { onExport: (ids: string[]) => Promise<Blob>; fileName?: string };

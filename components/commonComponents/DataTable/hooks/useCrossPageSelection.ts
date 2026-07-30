import * as React from "react";

export interface CrossPageSelectionState {
  // Map of row IDs to their selection state
  selectedIds: Set<string>;
  // Whether "select all" across all pages is active
  isSelectAllPages: boolean;
  // Total number of records (for display purposes)
  totalRecords: number;
  // All available IDs (from API)
  allAvailableIds: string[];
}

export interface UseCrossPageSelectionReturn {
  selectionState: CrossPageSelectionState;
  toggleRow: (id: string) => void;
  toggleAllOnPage: (pageRowIds: string[], checked: boolean) => void;
  toggleSelectAllPages: (checked: boolean) => void;
  clearSelection: () => void;
  isRowSelected: (id: string) => boolean;
  getSelectionInfo: () => { count: number; isSelectAll: boolean };
  getSelectedIds: () => string[];
}

/**
 * Custom hook for managing row selection across multiple pages in server-side paginated tables
 *
 * @param allAvailableIds - Array of all available IDs from API
 * @returns Selection state and control functions
 */
export function useCrossPageSelection(
  allAvailableIds: string[]
): UseCrossPageSelectionReturn {
  const [selectionState, setSelectionState] = React.useState<CrossPageSelectionState>({
    selectedIds: new Set<string>(),
    isSelectAllPages: false,
    totalRecords: allAvailableIds.length,
    allAvailableIds,
  });

  // Update state when allAvailableIds changes
  React.useEffect(() => {
    setSelectionState(prev => ({
      ...prev,
      allAvailableIds,
      totalRecords: allAvailableIds.length,
    }));
  }, [allAvailableIds]);

  // Toggle individual row selection
  const toggleRow = React.useCallback((id: string) => {
    setSelectionState((prev) => {
      // If we're in "select all" mode, we need to transition to individual selection
      if (prev.isSelectAllPages) {
        // Create a set with all IDs except the one being deselected
        const newSelectedIds = new Set(prev.allAvailableIds.filter(availableId => availableId !== id));
        return {
          ...prev,
          selectedIds: newSelectedIds,
          isSelectAllPages: false,
        };
      }

      // Normal toggle behavior
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }

      return {
        ...prev,
        selectedIds: newSelectedIds,
        isSelectAllPages: false,
      };
    });
  }, []);

  // Toggle all rows on current page
  const toggleAllOnPage = React.useCallback((pageRowIds: string[], checked: boolean) => {
    setSelectionState((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);

      if (checked) {
        // Add all page row IDs
        pageRowIds.forEach(id => newSelectedIds.add(id));
      } else {
        // Remove all page row IDs
        pageRowIds.forEach(id => newSelectedIds.delete(id));
      }

      return {
        ...prev,
        selectedIds: newSelectedIds,
        isSelectAllPages: false, // Exit "select all pages" mode
      };
    });
  }, []);

  // Toggle "select all" across all pages
  const toggleSelectAllPages = React.useCallback((checked: boolean) => {
    setSelectionState(prev => ({
      ...prev,
      selectedIds: new Set<string>(),
      isSelectAllPages: checked,
    }));
  }, []);

  // Clear all selections
  const clearSelection = React.useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedIds: new Set<string>(),
      isSelectAllPages: false,
    }));
  }, []);

  // Check if a specific row is selected
  const isRowSelected = React.useCallback((id: string) => {
    if (selectionState.isSelectAllPages) {
      return true; // All rows are selected
    }
    return selectionState.selectedIds.has(id);
  }, [selectionState.isSelectAllPages, selectionState.selectedIds]);

  // Get selection info for display/actions
  const getSelectionInfo = React.useCallback(() => {
    if (selectionState.isSelectAllPages) {
      return {
        count: selectionState.totalRecords,
        isSelectAll: true,
      };
    }
    return {
      count: selectionState.selectedIds.size,
      isSelectAll: false,
    };
  }, [selectionState]);

  // Get array of selected IDs
  const getSelectedIds = React.useCallback((): string[] => {
    if (selectionState.isSelectAllPages) {
      return selectionState.allAvailableIds;
    }
    return Array.from(selectionState.selectedIds);
  }, [selectionState]);

  return {
    selectionState,
    toggleRow,
    toggleAllOnPage,
    toggleSelectAllPages,
    clearSelection,
    isRowSelected,
    getSelectionInfo,
    getSelectedIds,
  };
}

"use client";

import * as React from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import type { SavedFilter } from "../types";
import { toast } from "sonner";

interface UseSavedFiltersProps {
  storageKey?: string;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  userId?: string; // User ID for user-specific filter storage
}

export function useSavedFilters({
  storageKey,
  columnFilters,
  setColumnFilters,
  userId,
}: UseSavedFiltersProps) {
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [selectedFilterId, setSelectedFilterId] = React.useState<string | null>(
    null
  );
  const [showSaveFilterDialog, setShowSaveFilterDialog] = React.useState(false);

  // Track if we're programmatically setting filters
  const isSettingFromSavedFilter = React.useRef(false);

  // Generate user-specific storage key
  const getUserStorageKey = React.useCallback(() => {
    if (!storageKey) return null;
    return userId ? `saved-filters-${storageKey}-user-${userId}` : `saved-filters-${storageKey}`;
  }, [storageKey, userId]);

  // Load saved filters from localStorage
  React.useEffect(() => {
    const userStorageKey = getUserStorageKey();
    if (!userStorageKey || typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        const filters = JSON.parse(saved) as SavedFilter[];
        // Filter to only show current user's filters
        const userFilters = userId
          ? filters.filter(f => !f.userId || f.userId === userId)
          : filters;
        setSavedFilters(userFilters);
      }
    } catch (error) {
      console.error("Error loading saved filters:", error);
    }
  }, [getUserStorageKey, userId]);

  // Save filters to localStorage
  const saveFiltersToStorage = React.useCallback(
    (filters: SavedFilter[]) => {
      const userStorageKey = getUserStorageKey();
      if (!userStorageKey || typeof window === "undefined") return;

      try {
        localStorage.setItem(userStorageKey, JSON.stringify(filters));
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    },
    [getUserStorageKey]
  );

  // Handle saving a new filter
  const handleSaveFilter = React.useCallback(
    (filterName: string) => {
      const newFilter: SavedFilter = {
        id: `filter-${Date.now()}`,
        name: filterName,
        filters: columnFilters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId, // Attach userId to the filter
      };

      const updatedFilters = [...savedFilters, newFilter];
      setSavedFilters(updatedFilters);
      saveFiltersToStorage(updatedFilters);
      setShowSaveFilterDialog(false);

      toast.success("Filter saved", {
        description: `"${filterName}" has been saved successfully`,
      });
    },
    [columnFilters, savedFilters, saveFiltersToStorage, userId]
  );

  // Handle selecting a saved filter
  const handleSelectFilter = React.useCallback(
    (filterId: string | null) => {
      isSettingFromSavedFilter.current = true;
      setSelectedFilterId(filterId);

      if (filterId === null) {
        setColumnFilters([]);
      } else {
        const filter = savedFilters.find((f) => f.id === filterId);
        if (filter) {
          setColumnFilters(filter.filters);
        }
      }

      // Reset flag after state update
      setTimeout(() => {
        isSettingFromSavedFilter.current = false;
      }, 0);
    },
    [savedFilters, setColumnFilters]
  );

  // Handle deleting a saved filter
  const handleDeleteFilter = React.useCallback(
    (filterId: string) => {
      const filterToDelete = savedFilters.find((f) => f.id === filterId);
      const updatedFilters = savedFilters.filter((f) => f.id !== filterId);
      setSavedFilters(updatedFilters);
      saveFiltersToStorage(updatedFilters);

      // If we deleted the currently selected filter, clear the selection
      if (filterId === selectedFilterId) {
        setSelectedFilterId(null);
      }

      // Show success toast with undo option
      toast.success(`Filter "${filterToDelete?.name}" deleted`, {
        description: "The filter has been removed",
        action: {
          label: "Undo",
          onClick: () => {
            if (filterToDelete) {
              const restoredFilters = [...updatedFilters, filterToDelete];
              setSavedFilters(restoredFilters);
              saveFiltersToStorage(restoredFilters);
              toast.success("Filter restored");
            }
          },
        },
      });
    },
    [savedFilters, saveFiltersToStorage, selectedFilterId]
  );

  // Handle updating an existing filter
  const handleUpdateFilter = React.useCallback(
    (filterId: string) => {
      const filterToUpdate = savedFilters.find((f) => f.id === filterId);
      const updatedFilters = savedFilters.map((f) =>
        f.id === filterId
          ? {
              ...f,
              filters: columnFilters,
              updatedAt: new Date().toISOString(),
            }
          : f
      );
      setSavedFilters(updatedFilters);
      saveFiltersToStorage(updatedFilters);

      toast.success(`Filter "${filterToUpdate?.name}" updated`, {
        description: "Your filter has been updated with current settings",
      });
    },
    [columnFilters, savedFilters, saveFiltersToStorage]
  );

  // Clear selected filter when filters change manually
  React.useEffect(() => {
    if (!isSettingFromSavedFilter.current && columnFilters.length > 0) {
      // Check if current filters match any saved filter
      const matchingFilter = savedFilters.find(
        (f) => JSON.stringify(f.filters) === JSON.stringify(columnFilters)
      );

      if (matchingFilter) {
        setSelectedFilterId(matchingFilter.id);
      } else if (selectedFilterId !== null) {
        // Clear selection if filters don't match any saved filter
        setSelectedFilterId(null);
      }
    } else if (columnFilters.length === 0 && selectedFilterId !== null) {
      // Clear selection when all filters are cleared
      setSelectedFilterId(null);
    }
  }, [columnFilters, savedFilters, selectedFilterId]);

  return {
    savedFilters,
    selectedFilterId,
    showSaveFilterDialog,
    setShowSaveFilterDialog,
    handleSaveFilter,
    handleSelectFilter,
    handleDeleteFilter,
    handleUpdateFilter,
  };
}

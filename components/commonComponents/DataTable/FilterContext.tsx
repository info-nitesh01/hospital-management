"use client";

import * as React from "react";
import type { FilterTypeConfig } from "@/lib/api/datatable/column/types";

type FilterRegistry = Record<string, FilterTypeConfig>;

interface FilterContextValue {
  registry: FilterRegistry;
  disableFiltering: string[];
}

const FilterContext = React.createContext<FilterContextValue | null>(null);

export const useFilterRegistry = () => {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterRegistry must be used within a FilterProvider");
  }
  return context.registry;
};

export const useFilterRegistryOptional = () => {
  const context = React.useContext(FilterContext);
  return context?.registry ?? null;
};

export const useDisableFiltering = () => {
  const context = React.useContext(FilterContext);
  return context?.disableFiltering ?? [];
};

interface FilterProviderProps {
  registry: FilterRegistry;
  disableFiltering?: string[];
  children: React.ReactNode;
}

export const FilterProvider = ({ registry, disableFiltering = [], children }: FilterProviderProps) => {
  const value = React.useMemo(() => ({
    registry,
    disableFiltering,
  }), [registry, disableFiltering]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

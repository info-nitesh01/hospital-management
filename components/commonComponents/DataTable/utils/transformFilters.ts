import { ColumnFiltersState } from "@tanstack/react-table";

export type TransformedFilters = Record<string, string | number | string[]>;

/**
 * Transforms TanStack Table ColumnFiltersState to API-friendly format
 * This is used globally by DataTable for server-side filtering
 */
export function transformFiltersToApi(tableFilters: ColumnFiltersState): TransformedFilters {
  const apiFilters: TransformedFilters = {};

  tableFilters.forEach((filter) => {
    const value = filter.value;

    // Array filters (multi-select)
    if (Array.isArray(value) && value.length > 0) {
      apiFilters[filter.id] = value as string[];
    }
    // String filters
    else if (typeof value === "string" && value !== "") {
      apiFilters[filter.id] = value;
    }
    // Object filters (date range, number range)
    else if (typeof value === "object" && value !== null) {
      const rangeValue = value as Record<string, unknown>;
      const capitalizedId = filter.id.charAt(0).toUpperCase() + filter.id.slice(1);

      // Date range or generic range filters (from/to)
      if (rangeValue.from !== undefined || rangeValue.to !== undefined) {
        if (rangeValue.from !== undefined) {
          const fromValue = typeof rangeValue.from === "number"
            ? rangeValue.from
            : String(rangeValue.from);
          apiFilters[`from${capitalizedId}`] = fromValue;
        }
        if (rangeValue.to !== undefined) {
          const toValue = typeof rangeValue.to === "number"
            ? rangeValue.to
            : String(rangeValue.to);
          apiFilters[`to${capitalizedId}`] = toValue;
        }
      }

      // Numeric range filters (min/max) - legacy support
      if (rangeValue.min !== undefined || rangeValue.max !== undefined) {
        if (rangeValue.min !== undefined) {
          apiFilters[`${filter.id}Min`] = Number(rangeValue.min);
        }
        if (rangeValue.max !== undefined) {
          apiFilters[`${filter.id}Max`] = Number(rangeValue.max);
        }
      }
    }
  });

  return apiFilters;
}

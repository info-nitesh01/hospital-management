import { Column, Table } from "@tanstack/react-table";
import { ServerSideSortHeader } from "../components/ServerSideSortHeader";
import { TableFilterPopover } from "../Filters/TableFilterPopover";
import { DateRangeFilterPopover } from "../Filters/DateRangeFilterPopover";
import { RangeFilterPopover } from "../Filters/RangeFilterPopover";
import { StatusFilterPopover } from "../Filters/StatusFilterPopover";

/**
 * Server-side sorting state interface
 * This should be passed from the parent component that manages API calls
 */
export interface ServerSortState {
  /** Currently active sort index from API */
  sortIndex?: number;
  /** Currently active sort direction from API */
  sortBy?: "asc" | "desc";
  /** Callback to update sort state and trigger API refetch. Pass undefined to clear sorting. */
  onSortChange?: (sortIndex: number | undefined, sortBy: "asc" | "desc" | undefined) => void;
}

/**
 * Create a server-side sortable header with optional filter support
 *
 * This function creates a column header that:
 * 1. Uses the sortOrder from ColumnConfig as sortIndex for API calls
 * 2. Calls onSortChange callback when user clicks to sort
 * 3. Shows visual indicators for current sort state
 * 4. Optionally includes a filter popover
 *
 * @param title - Column title to display
 * @param sortIndex - The sortOrder from ColumnConfig (used as sortIndex in API)
 * @param serverSortState - Current sort state and callback from parent
 * @param enableFilter - Whether to show filter popover (boolean | "dateRange" | "range" | "status")
 * @param filterType - Filter type identifier for the column
 *
 * @example
 * ```tsx
 * // In your column definition:
 * {
 *   accessorKey: "clientName",
 *   header: createServerSortableHeader(
 *     "Client Name",
 *     1, // sortOrder from ColumnConfig
 *     {
 *       sortIndex: currentSortIndex,
 *       sortBy: currentSortBy,
 *       onSortChange: handleSortChange
 *     },
 *     true,
 *     "clientName"
 *   )
 * }
 * ```
 */
export const createServerSortableHeader = <TData,>(
  title: string,
  sortIndex: number,
  serverSortState: ServerSortState,
  enableFilter: boolean | "dateRange" | "range" | "status" = false,
  filterType?: string
) => {
  const HeaderComponent = ({
    column,
    table,
  }: {
    column: Column<TData>;
    table: Table<TData>;
  }) => {
    return (
      <div className="flex items-center gap-1">
        <ServerSideSortHeader
          label={title}
          sortIndex={sortIndex}
          currentSortIndex={serverSortState.sortIndex}
          currentSortBy={serverSortState.sortBy}
          onSortChange={serverSortState.onSortChange}
        />
        {enableFilter === "dateRange" && (
          <DateRangeFilterPopover column={column} title={title} table={table} />
        )}
        {enableFilter === "range" && (
          <RangeFilterPopover column={column} title={title} table={table} />
        )}
        {enableFilter === "status" && (
          <StatusFilterPopover column={column} table={table} title={title} filterType={filterType} />
        )}
        {enableFilter === true && (
          <TableFilterPopover
            column={column}
            table={table}
            title={title}
            filterType={filterType}
          />
        )}
      </div>
    );
  };

  HeaderComponent.displayName = `ServerSortableHeader_${title}`;
  return HeaderComponent;
};

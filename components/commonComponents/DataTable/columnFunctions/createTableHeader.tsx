import { Column, Table } from "@tanstack/react-table";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Button } from "@/components/commonComponents/Button";
import { TableFilterPopover } from "../Filters/TableFilterPopover";

/**
 * Create a sortable header with server-side filter support
 * @param title - Column title
 * @param enableFilter - Enable filtering
 * @param filterType - Type of filter (e.g., "clientName")
 */
export const createTableSortableHeader = <TData,>(
  title: string,
  enableFilter: boolean = false,
  filterType?: "clientName" | string
) => {
  const HeaderComponent = ({ column, table }: { column: Column<TData>; table: Table<TData> }) => {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          className="sort-button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {title}
          <HiOutlineArrowsUpDown className="ml-2 h-4 w-4" />
        </Button>
        {enableFilter && (
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

  HeaderComponent.displayName = `TableSortableHeader_${title}`;
  return HeaderComponent;
};
import { ColumnDef } from "@tanstack/react-table";
import { TableData } from "./types";
import { createTableSortableHeader } from "./createTableHeader";

interface TableNameColumnOptions {
  enableFilter?: boolean;
  filterType?: string;
  className?: string;
}

/**
 * Name column with server-side filter support (non-linked)
 * @param accessor - Column accessor
 * @param title - Column title
 * @param sortable - Enable sorting
 * @param options - Additional options including server filter and styling
 */
export const tableNameColumn = <T extends TableData>(
  accessor: string,
  title: string = accessor,
  sortable: boolean = true,
  options: TableNameColumnOptions = {}
): ColumnDef<T> => {
  const { enableFilter = false, filterType = "clientName", className = "font-medium" } = options;

  return {
    accessorKey: accessor,
    header: sortable
      ? createTableSortableHeader(title, enableFilter, filterType)
      : title,
    filterFn: enableFilter ? "includesString" : undefined,
    cell: ({ row }) => {
      const value = row.getValue(accessor) as string;

      if (!value) return "-";

      return (
        <div className={className}>
          {value}
        </div>
      );
    },
  };
};

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { TableData } from "./types";
import { createTableSortableHeader } from "./createTableHeader";

interface TableLinkedColumnOptions {
  enableFilter?: boolean;
  filterType?: "clientName" | string;
}

/**
 * Linked column with server-side filter support
 * @param accessor - Column accessor
 * @param hrefBase - Base URL for the link
 * @param title - Column title
 * @param sortable - Enable sorting
 * @param options - Additional options including server filter
 */
export const tableLinkedColumn = <T extends TableData>(
  accessor: string,
  hrefBase: string,
  title: string = accessor,
  sortable: boolean = true,
  options: TableLinkedColumnOptions = {}
): ColumnDef<T> => {
  const { enableFilter = false, filterType = "clientName" } = options;

  return {
    accessorKey: accessor,
    header: sortable
      ? createTableSortableHeader(title, enableFilter, filterType)
      : title,
    filterFn: enableFilter ? "includesString" : undefined,
    cell: ({ row }) => {
      const value = row.getValue(accessor) as string;
      const id = row.original.id || row.original.clientId;

      if (!value) return "-";

      return (
        <Link
          href={`${hrefBase}/${id}`}
          target="_blank"
          className="text-primary hover:underline font-medium"
        >
          {value}
        </Link>
      );
    },
  };
};
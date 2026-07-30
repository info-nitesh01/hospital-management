import { ColumnDef, FilterFnOption } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TableData } from "./types";
import { createTableSortableHeader } from "./createTableHeader";

interface TableStatusColumnOptions {
  enableFilter?: boolean;
  filterType?: "clientStatus" | string;
}

/**
 * Status column with badge display and server-side filter support
 * @param accessor - Column accessor
 * @param title - Column title
 * @param sortable - Enable sorting
 * @param options - Additional options including server filter
 */
export const tableStatusColumn = <T extends TableData>(
  accessor: string = "status",
  title: string = "Status",
  sortable: boolean = true,
  options: TableStatusColumnOptions = {}
): ColumnDef<T> => {
  const { enableFilter = true, filterType = "clientStatus" } = options;

  return {
    accessorKey: accessor,
    header: sortable
      ? createTableSortableHeader(title, enableFilter, filterType)
      : title,
    filterFn: enableFilter ? ("multiSelect" as FilterFnOption<T>) : undefined,
    cell: ({ row }) => {
      const status = row.getValue(accessor) as string;

      // Handle null/undefined status
      if (!status) {
        return (
          <Badge variant="outline">
            N/A
          </Badge>
        );
      }

      const getVariant = (statusValue: string): "default" | "secondary" | "outline" | "destructive" => {
        const lowerStatus = statusValue.toLowerCase();
        if (lowerStatus === "active") return "default";
        if (lowerStatus === "inactive") return "outline";
        if (lowerStatus === "pending") return "secondary";
        if (lowerStatus === "suspended") return "destructive";
        return "outline";
      };

      return (
        <Badge variant={getVariant(status)} className="h-5 text-[10px]">
          {status}
        </Badge>
      );
    },
  };
};
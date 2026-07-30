import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { createSortableHeader } from "../index";
import { TableData } from "./types";

/**
 * Email column with sortable header, mailto link, and optional filter
 */
export const emailColumn = <T extends TableData>(
  accessor: string = "email",
  label: string = "Email",
  enableFilter: boolean | "status" = false
): ColumnDef<T> => ({
  accessorKey: accessor,
  header: createSortableHeader(label, enableFilter),
  cell: ({ row }) => {
    const email = row.getValue(accessor) as string;
    if (!email) return <span className="text-muted-foreground">-</span>;
    return (
      <a
        href={`mailto:${email}`}
        className="hover:text-primary inline-flex items-center gap-1"
      >
        <HiOutlineEnvelope className="h-3 w-3 text-red-500" />
        {email}
      </a>
    );
  },
});
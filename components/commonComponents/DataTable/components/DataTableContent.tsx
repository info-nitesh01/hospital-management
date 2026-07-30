"use client";

import * as React from "react";
import { Table as TableType, flexRender, ColumnDef, Header, Cell } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableContentProps<TData, TValue> {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  pinnedColumn: string | null;
  getOrderedHeaders: (headers: Header<TData, unknown>[]) => Header<TData, unknown>[];
  getOrderedCells: (cells: Cell<TData, unknown>[]) => Cell<TData, unknown>[];
}

export function DataTableContent<TData, TValue>({
  table,
  columns,
  pinnedColumn,
  getOrderedHeaders,
  getOrderedCells,
}: DataTableContentProps<TData, TValue>) {
  return (
    <div className="table-container">
      <Table disableWrapper>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => {
            const orderedHeaders = getOrderedHeaders(headerGroup.headers);
            return (
              <TableRow key={headerGroup.id}>
                {orderedHeaders.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        ...(header.column.columnDef.meta?.width && {
                          width: `${header.column.columnDef.meta.width}px`,
                          minWidth: `${header.column.columnDef.meta.width}px`,
                          maxWidth: `${header.column.columnDef.meta.width}px`,
                        }),
                      }}
                      className={cn(
                        header.id === "select" && "sticky-select",
                        header.id === pinnedColumn && "sticky-pinned",
                        header.id === "actions" && "sticky-actions"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            );
          })}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const orderedCells = getOrderedCells(row.getVisibleCells());
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {orderedCells.map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...(cell.column.columnDef.meta?.width && {
                          width: `${cell.column.columnDef.meta.width}px`,
                          minWidth: `${cell.column.columnDef.meta.width}px`,
                          maxWidth: `${cell.column.columnDef.meta.width}px`,
                        }),
                      }}
                      className={cn(
                        cell.column.id === "select" && "sticky-select",
                        cell.column.id === pinnedColumn && "sticky-pinned",
                        cell.column.id === "actions" && "sticky-actions"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

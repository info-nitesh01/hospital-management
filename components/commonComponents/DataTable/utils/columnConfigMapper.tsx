import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { ColumnConfig } from "@/lib/api/clients/types";
import { TableData } from "../columnFunctions/types";
import {
  checkboxColumn,
  dateColumn,
  numberColumn,
  tableStatusColumn,
  tableNameColumn,
  emailColumn,
  phoneColumn,
  booleanColumn,
  currencyColumn,
  percentageColumn,
  standardActionColumn,
} from "../columnFunctions";
import { tableLinkedColumn } from "../columnFunctions/tableLinkedColumn";
import { createServerSortableHeader, type ServerSortState } from "../columnFunctions/createServerSortableHeader";

interface ColumnTypeMap {
  status: string[];
  date: string[];
  number: string[];
  email: string[];
  phone: string[];
  boolean: string[];
  currency: string[];
  percentage: string[];
  link: string[];
}

const DEFAULT_TYPE_MAP: ColumnTypeMap = {
  status: ["clientStatus"],
  date: ["createdOn", "modifiedOn", "createdAt"],
  number: ["noOfAccounts"],
  email: ["contactEmail"],
  phone: [],
  boolean: [],
  currency: [],
  percentage: [],
  link: ["clientName"],
};

type ColumnFactoryContext<T extends TableData> = {
  dataIndex: string;
  title: string;
  enableSorting: boolean;
  isFilterDisabled: boolean;
  filterType: string;
  columnType: keyof ColumnTypeMap | "text";
  options: ColumnGenerationOptions<T>;
};

type ColumnFactory<T extends TableData> = (
  ctx: ColumnFactoryContext<T>
) => ColumnDef<T>;

export interface ColumnGenerationOptions<T extends TableData> {
  includeCheckbox?: boolean;
  includeActions?: boolean;
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    additionalActions?: Array<{
      label: string;
      onClick: (row: T) => void;
      icon?: React.ReactNode;
    }>;
  };
  linkBaseUrl?: string;
  typeMap?: Partial<ColumnTypeMap>;
  enableFilters?: {
    status?: boolean;
    name?: boolean;
    link?: boolean;
    email?: boolean;
    number?: boolean;
  };
  filterTypeRegistry?: Record<string, string>;
  disableFiltersFor?: string[];
  disableSortingFor?: string[];
  customColumns?: Record<string, ColumnDef<T>>;
  serverSideSort?: ServerSortState;
}

function createStatusColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const enableFilter = ctx.isFilterDisabled
    ? false
    : (ctx.options.enableFilters?.status ?? true);

  // Use tableStatusColumn for consistent badge UI regardless of server-side sorting
  return tableStatusColumn<T>(ctx.dataIndex, ctx.title, ctx.enableSorting, {
    enableFilter,
    filterType: ctx.options.filterTypeRegistry?.[ctx.dataIndex] || ctx.filterType,
  });
}

function createLinkColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const enableFilter = ctx.isFilterDisabled
    ? false
    : (ctx.options.enableFilters?.link ?? true);

  // For server-side sorting, we'll handle header in createServerSideColumn
  if (ctx.options.serverSideSort && ctx.enableSorting) {
    if (ctx.options.linkBaseUrl) {
      return {
        accessorKey: ctx.dataIndex,
        cell: ({ row }) => {
          const value = row.getValue(ctx.dataIndex) as string;
          const rowData = row.original as T & { id?: string | number; clientId?: string | number };
          const id = rowData.id || rowData.clientId;
          return (
            <a target="_blank" href={`${ctx.options.linkBaseUrl}/${id}`} className="text-primary hover:underline font-medium">
              {value || "-"}
            </a>
          );
        },
      } as ColumnDef<T>;
    }
    return {
      accessorKey: ctx.dataIndex,
      cell: ({ row }) => {
        const value = row.getValue(ctx.dataIndex) as string;
        return value || "-";
      },
    } as ColumnDef<T>;
  }

  if (ctx.options.linkBaseUrl) {
    return tableLinkedColumn<T>(
      ctx.dataIndex,
      ctx.options.linkBaseUrl,
      ctx.title,
      ctx.enableSorting,
      {
        enableFilter,
        filterType: ctx.options.filterTypeRegistry?.[ctx.dataIndex] || ctx.filterType,
      }
    );
  }

  const nameFilter = ctx.isFilterDisabled
    ? false
    : (ctx.options.enableFilters?.name ?? true);
  return tableNameColumn<T>(ctx.dataIndex, ctx.title, ctx.enableSorting, {
    enableFilter: nameFilter,
    filterType: ctx.options.filterTypeRegistry?.[ctx.dataIndex] || ctx.filterType,
  });
}

function createDateColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const enableFilter = ctx.isFilterDisabled ? false : "dateRange";
  return dateColumn<T>(ctx.dataIndex, ctx.title, enableFilter);
}

function createNumberColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const enableNumberFilter = ctx.isFilterDisabled
    ? false
    : (ctx.options.enableFilters?.number ?? false);
  return numberColumn<T>(
    ctx.dataIndex,
    ctx.title,
    undefined,
    enableNumberFilter ? "range" : false
  );
}

function createEmailColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const enableEmailFilter = ctx.isFilterDisabled
    ? false
    : (ctx.options.enableFilters?.email ?? false);
  return emailColumn<T>(
    ctx.dataIndex,
    ctx.title,
    enableEmailFilter ? "status" : false
  );
}

function createPhoneColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  return phoneColumn<T>(ctx.dataIndex);
}

function createBooleanColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  return booleanColumn<T>(ctx.dataIndex, ctx.title, "Yes", "No");
}

function createCurrencyColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  return currencyColumn<T>(ctx.dataIndex, ctx.title, "USD", "range");
}

function createPercentageColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  return percentageColumn<T>(ctx.dataIndex, ctx.title);
}

function createTextColumnFactory<T extends TableData>(
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const enableFilter = ctx.isFilterDisabled
    ? false
    : (ctx.options.enableFilters?.name ?? true);

  // For server-side sorting, we'll handle header in createServerSideColumn
  if (ctx.options.serverSideSort && ctx.enableSorting) {
    return {
      accessorKey: ctx.dataIndex,
      cell: ({ row }) => {
        const value = row.getValue(ctx.dataIndex) as string;
        return value || "-";
      },
    } as ColumnDef<T>;
  }

  return tableNameColumn<T>(ctx.dataIndex, ctx.title, ctx.enableSorting, {
    enableFilter,
    filterType: ctx.options.filterTypeRegistry?.[ctx.dataIndex] || ctx.filterType,
  });
}

const COLUMN_FACTORY_REGISTRY: Record<
  keyof ColumnTypeMap | "text",
  ColumnFactory<TableData>
> = {
  status: createStatusColumnFactory,
  link: createLinkColumnFactory,
  date: createDateColumnFactory,
  number: createNumberColumnFactory,
  email: createEmailColumnFactory,
  phone: createPhoneColumnFactory,
  boolean: createBooleanColumnFactory,
  currency: createCurrencyColumnFactory,
  percentage: createPercentageColumnFactory,
  text: createTextColumnFactory,
};

function createServerSideColumn<T extends TableData>(
  config: ColumnConfig,
  ctx: ColumnFactoryContext<T>
): ColumnDef<T> {
  const { sortOrder, width } = config;

  const factory = COLUMN_FACTORY_REGISTRY[ctx.columnType] as ColumnFactory<T>;
  const baseColumn = factory(ctx as ColumnFactoryContext<T>);

  // Determine the filter type to pass to the server sortable header
  // For date columns, use "dateRange"; for disabled filters, use false; otherwise use true
  let enableFilter: boolean | "dateRange" | "range" | "status" = false;
  if (!ctx.isFilterDisabled) {
    if (ctx.columnType === "date") {
      enableFilter = "dateRange";
    } else if (ctx.columnType === "status") {
      enableFilter = "status";
    } else if (ctx.columnType === "currency" || ctx.columnType === "number") {
      enableFilter = "range";
    } else {
      enableFilter = true;
    }
  }

  // Add width and title to meta
  if (width && width > 0) {
    return {
      ...baseColumn,
      header: createServerSortableHeader<T>(
        ctx.title,
        sortOrder!,
        ctx.options.serverSideSort!,
        enableFilter,
        ctx.options.filterTypeRegistry?.[ctx.dataIndex] || ctx.filterType
      ),
      meta: {
        ...(baseColumn.meta || {}),
        width: width,
        title: ctx.title,
      },
    } as ColumnDef<T>;
  }

  return {
    ...baseColumn,
    header: createServerSortableHeader<T>(
      ctx.title,
      sortOrder!,
      ctx.options.serverSideSort!,
      enableFilter,
      ctx.options.filterTypeRegistry?.[ctx.dataIndex] || ctx.filterType
    ),
    meta: {
      ...(baseColumn.meta || {}),
      title: ctx.title,
    },
  } as ColumnDef<T>;
}

function determineColumnType(
  dataIndex: string,
  typeMap: ColumnTypeMap
): keyof ColumnTypeMap | "text" {
  for (const [type, columnNames] of Object.entries(typeMap)) {
    if (columnNames.includes(dataIndex)) {
      return type as keyof ColumnTypeMap;
    }
  }
  return "text";
}

function createColumnFromConfig<T extends TableData>(
  config: ColumnConfig,
  options: ColumnGenerationOptions<T>
): ColumnDef<T> | null {
  const { dataIndex, title, hidden, sorter, sortOrder, width } = config;

  if (hidden) {
    return null;
  }

  if (options.customColumns && options.customColumns[dataIndex]) {
    return options.customColumns[dataIndex];
  }

  const typeMap = { ...DEFAULT_TYPE_MAP, ...options.typeMap };
  const columnType = determineColumnType(dataIndex, typeMap);
  const enableSorting = sorter !== false && !(options.disableSortingFor?.includes(dataIndex) ?? false);
  const isFilterDisabled = options.disableFiltersFor?.includes(dataIndex) ?? false;

  const context: ColumnFactoryContext<T> = {
    dataIndex,
    title,
    enableSorting,
    isFilterDisabled,
    filterType: dataIndex,
    columnType,
    options,
  };

  if (options.serverSideSort && sortOrder !== undefined && enableSorting) {
    return createServerSideColumn<T>(config, context);
  }

  const factory = COLUMN_FACTORY_REGISTRY[columnType] as ColumnFactory<T>;
  const column = factory(context as ColumnFactoryContext<T>);

  // Add width to meta only if width is defined and greater than 0
  if (width && width > 0) {
    return {
      ...column,
      meta: {
        ...(column.meta || {}),
        width: width,
      },
    };
  }

  return column;
}

export function generateColumnsFromConfig<T extends TableData>(
  columnConfigs: ColumnConfig[],
  options: ColumnGenerationOptions<T> = {}
): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = [];

  if (options.includeCheckbox) {
    columns.push(checkboxColumn<T>());
  }

  const sortedConfigs = [...columnConfigs].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  for (const config of sortedConfigs) {
    if (config.isGridVisible !== false) {
      const column = createColumnFromConfig<T>(config, options);
      if (column) {
        columns.push(column);
      }
    }
  }

  if (options.includeActions && options.actions) {
    const { onView, onEdit, additionalActions } = options.actions;
    const actionColumn = standardActionColumn<T>(
      onView || (() => {}),
      onEdit || (() => {}),
      additionalActions
    );

    const stickyActionColumn: ColumnDef<T> = {
      ...actionColumn,
      meta: {
        ...(actionColumn.meta || {}),
        sticky: 'right',
      },
    };

    columns.push(stickyActionColumn);
  }

  return columns;
}

export function extractFilterTypeRegistry(
  columnConfigs: ColumnConfig[]
): Record<string, string> {
  const registry: Record<string, string> = {};

  for (const config of columnConfigs) {
    if (config.isGridVisible !== false && !config.hidden) {
      registry[config.dataIndex] = config.dataIndex;
    }
  }

  return registry;
}

export function getVisibleColumns(columnConfigs: ColumnConfig[]): string[] {
  return columnConfigs
    .filter((config) => config.isGridVisible !== false && !config.hidden)
    .sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    })
    .map((config) => config.dataIndex);
}

export function getColumnVisibility(
  columnConfigs: ColumnConfig[]
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};

  for (const config of columnConfigs) {
    visibility[config.dataIndex] = config.isGridVisible !== false && !config.hidden;
  }

  return visibility;
}

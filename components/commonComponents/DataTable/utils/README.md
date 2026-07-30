# DataTable Column Configuration Mapper

Automatically generate DataTable columns from API `ColumnConfigs` responses. This utility enables dynamic table creation based on backend configuration, making your tables adaptable without code changes.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Column Type Detection](#column-type-detection)
- [Configuration Options](#configuration-options)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Overview

The Column Configuration Mapper solves the problem of maintaining hardcoded column definitions by generating them dynamically from API responses. This approach:

✅ **Eliminates hardcoded columns** - Define columns on the backend
✅ **Auto-detects column types** - Intelligently determines appropriate renderers
✅ **Supports all column types** - Status, dates, numbers, links, emails, etc.
✅ **Enables dynamic filtering** - Automatically configures filter types
✅ **Respects API configuration** - Honors visibility, sorting, and ordering from backend

---

## Quick Start

### 1. API Response Structure

Your API should return data in this format:

```typescript
{
  code: 200,
  content: {
    Data: [
      {
        clientName: "Acme Corp",
        clientStatus: "Active",
        createdOn: "2024-01-15T10:30:00Z",
        noOfAccounts: 42,
        // ... other fields
      }
    ],
    ColumnConfigs: [
      {
        dataIndex: "clientName",
        title: "Client Name",
        isGridVisible: true,
        isFormVisible: true,
        sortOrder: 1,
        isReadOnly: false,
        isMandatory: true,
        hidden: false,
        sorter: true,
        showSorterTooltip: true,
        width: 200,
        key: "clientName"
      },
      // ... other column configs
    ]
  }
}
```

### 2. Generate Columns in Your Component

```tsx
import { generateColumnsFromConfig } from "@/components/commonComponents/DataTable/utils";
import type { ColumnConfig } from "@/lib/api/clients/types";

export function MyDataTable({ data }) {
  const columns = React.useMemo(() => {
    if (!data?.content?.ColumnConfigs) return [];

    return generateColumnsFromConfig<MyDataType>(
      data.content.ColumnConfigs,
      {
        includeCheckbox: true,
        includeActions: true,
        linkBaseUrl: "/clients",
        actions: {
          onView: (row) => console.log("View", row),
          onEdit: (row) => console.log("Edit", row),
          onDelete: (row) => console.log("Delete", row),
        },
        enableFilters: {
          status: true,
          name: true,
          link: true,
        },
      }
    );
  }, [data?.content?.ColumnConfigs]);

  return <DataTable columns={columns} data={data?.content?.Data || []} />;
}
```

---

## API Reference

### `generateColumnsFromConfig<T>(columnConfigs, options)`

Main function to generate column definitions from API configuration.

**Type Parameters:**
- `T extends TableData` - Your data type (must extend `TableData`)

**Parameters:**

#### `columnConfigs: ColumnConfig[]`
Array of column configuration objects from your API response.

#### `options: ColumnGenerationOptions<T>`
Configuration options for column generation.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeCheckbox` | `boolean` | `false` | Add checkbox column for row selection |
| `includeActions` | `boolean` | `false` | Add actions column (view, edit, delete) |
| `linkBaseUrl` | `string` | `undefined` | Base URL for clickable link columns |
| `actions` | `object` | `undefined` | Action handlers and custom actions |
| `enableFilters` | `object` | `{}` | Enable filters for specific column types |
| `typeMap` | `Partial<ColumnTypeMap>` | `DEFAULT_TYPE_MAP` | Custom type detection patterns |
| `filterTypeRegistry` | `Record<string, string>` | `undefined` | Map dataIndex to filter types |
| `customColumns` | `Record<string, ColumnDef<T>>` | `undefined` | Override specific columns |

**Returns:** `ColumnDef<T>[]` - Array of column definitions for TanStack Table

---

### `extractFilterTypeRegistry(columnConfigs)`

Extract filter type mappings from column configurations.

```typescript
const filterRegistry = extractFilterTypeRegistry(columnConfigs);
// Returns: { clientName: "clientName", clientStatus: "clientStatus", ... }
```

---

### `getVisibleColumns(columnConfigs)`

Get array of visible column dataIndex values.

```typescript
const visibleColumns = getVisibleColumns(columnConfigs);
// Returns: ["clientName", "clientStatus", "createdOn", ...]
```

---

### `getColumnVisibility(columnConfigs)`

Get column visibility state for DataTable.

```typescript
const visibility = getColumnVisibility(columnConfigs);
// Returns: { clientName: true, hidden_field: false, ... }
```

---

## Column Type Detection

The mapper automatically detects column types based on field names:

### Detection Rules

| Type | Field Name Patterns | Column Renderer |
|------|---------------------|-----------------|
| **Status** | `status`, `state`, `clientStatus`, `accountStatus` | `dynamicStatusColumn` with badges |
| **Date** | `date`, `createdOn`, `modifiedOn`, `startDate` | `dateColumn` with date range filter |
| **Number** | `count`, `number`, `noOf`, `quantity`, `total` | `numberColumn` with alignment |
| **Email** | `email`, `contactEmail`, `userEmail` | `emailColumn` with mailto link |
| **Phone** | `phone`, `mobile`, `telephone` | `phoneColumn` with formatting |
| **Boolean** | `isActive`, `isDeleted`, `hasAccess` | `booleanColumn` with Yes/No |
| **Currency** | `price`, `cost`, `revenue`, `salary` | `currencyColumn` with formatting |
| **Percentage** | `progress`, `completion`, `percentage` | `percentageColumn` with % symbol |
| **Link** | `name`, `clientName`, `propertyName` | `dynamicLinkedColumn` if `linkBaseUrl` provided |
| **Text** | Everything else | `dynamicNameColumn` with optional filter |

### Custom Type Detection

Override the default type detection with custom patterns:

```typescript
generateColumnsFromConfig(columnConfigs, {
  typeMap: {
    status: ["status", "customStatus", "myState"],
    currency: ["price", "cost", "customAmount"],
    // ... other custom mappings
  },
});
```

---

## Configuration Options

### Include Checkbox Column

```typescript
generateColumnsFromConfig(columnConfigs, {
  includeCheckbox: true, // Adds row selection checkbox
});
```

### Include Action Column

```typescript
generateColumnsFromConfig(columnConfigs, {
  includeActions: true,
  actions: {
    onView: (row) => router.push(`/clients/${row.clientId}`),
    onEdit: (row) => openEditDialog(row),
    onDelete: (row) => confirmDelete(row),
    additionalActions: [
      {
        label: "Clone",
        onClick: (row) => cloneClient(row),
        icon: <Copy className="h-4 w-4" />,
      },
    ],
  },
});
```

### Link Columns

Convert name fields to clickable links:

```typescript
generateColumnsFromConfig(columnConfigs, {
  linkBaseUrl: "/clients", // Makes "name" fields into links
  // Links will be: /clients/{row.id or row.clientId}
});
```

### Enable Filters

```typescript
generateColumnsFromConfig(columnConfigs, {
  enableFilters: {
    status: true,  // Enable status filters
    name: true,    // Enable text field filters
    link: true,    // Enable linked column filters
  },
  filterTypeRegistry: {
    clientName: "clientName",
    clientStatus: "clientStatus",
    // Maps dataIndex to registered filter types
  },
});
```

### Custom Column Overrides

Override specific columns with custom implementations:

```typescript
generateColumnsFromConfig(columnConfigs, {
  customColumns: {
    clientName: {
      accessorKey: "clientName",
      header: "Custom Client Name",
      cell: ({ row }) => (
        <div className="font-bold text-primary">
          {row.getValue("clientName")}
        </div>
      ),
    },
  },
});
```

---

## Examples

### Example 1: Basic Usage

```tsx
import { generateColumnsFromConfig } from "@/components/commonComponents/DataTable/utils";

function ClientsTable({ apiResponse }) {
  const columns = React.useMemo(() => {
    return generateColumnsFromConfig(apiResponse.content.ColumnConfigs);
  }, [apiResponse]);

  return (
    <DataTable
      columns={columns}
      data={apiResponse.content.Data}
    />
  );
}
```

### Example 2: Full Configuration

```tsx
function AdvancedTable({ data, onView, onEdit, onDelete }) {
  const columns = React.useMemo(() => {
    if (!data?.content?.ColumnConfigs) return [];

    return generateColumnsFromConfig<Client>(
      data.content.ColumnConfigs,
      {
        includeCheckbox: true,
        includeActions: true,
        linkBaseUrl: "/clients",
        actions: {
          onView,
          onEdit,
          onDelete,
          additionalActions: [
            {
              label: "Export",
              onClick: (row) => exportClient(row),
              icon: <Download className="h-4 w-4" />,
            },
          ],
        },
        enableFilters: {
          status: true,
          name: true,
          link: true,
        },
        filterTypeRegistry: {
          clientName: "clientName",
          clientStatus: "clientStatus",
          clientType: "clientType",
        },
        customColumns: {
          revenue: currencyColumn<Client>("revenue", "Revenue", "USD", "range"),
        },
      }
    );
  }, [data?.content?.ColumnConfigs, onView, onEdit, onDelete]);

  return <DataTable columns={columns} data={data?.content?.Data || []} />;
}
```

### Example 3: Multiple Tables from Same Config

```tsx
function DashboardWithMultipleTables() {
  const { data: clientsData } = useClients();
  const { data: accountsData } = useAccounts();

  // Same utility works for different data types
  const clientColumns = React.useMemo(() => {
    return generateColumnsFromConfig<Client>(
      clientsData?.content?.ColumnConfigs || [],
      { linkBaseUrl: "/clients" }
    );
  }, [clientsData]);

  const accountColumns = React.useMemo(() => {
    return generateColumnsFromConfig<Account>(
      accountsData?.content?.ColumnConfigs || [],
      { linkBaseUrl: "/accounts" }
    );
  }, [accountsData]);

  return (
    <>
      <DataTable columns={clientColumns} data={clientsData?.content?.Data} />
      <DataTable columns={accountColumns} data={accountsData?.content?.Data} />
    </>
  );
}
```

### Example 4: With React Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/lib/api/clients";

function ClientsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(1, 50),
  });

  const columns = React.useMemo(() => {
    if (!data?.content?.ColumnConfigs) return [];

    return generateColumnsFromConfig<Client>(
      data.content.ColumnConfigs,
      {
        includeCheckbox: true,
        linkBaseUrl: "/clients",
      }
    );
  }, [data?.content?.ColumnConfigs]);

  if (isLoading) return <DataTableSkeleton />;
  if (isError) return <ErrorMessage />;

  return (
    <DataTable
      columns={columns}
      data={data.content.Data}
    />
  );
}
```

---

## Best Practices

### 1. Always Memoize Column Generation

```tsx
// ✅ Good - Prevents unnecessary re-renders
const columns = React.useMemo(() => {
  return generateColumnsFromConfig(columnConfigs, options);
}, [columnConfigs]);

// ❌ Bad - Recreates columns on every render
const columns = generateColumnsFromConfig(columnConfigs, options);
```

### 2. Handle Empty/Missing Configs

```tsx
const columns = React.useMemo(() => {
  if (!data?.content?.ColumnConfigs || data.content.ColumnConfigs.length === 0) {
    return []; // Or return fallback columns
  }
  return generateColumnsFromConfig(data.content.ColumnConfigs, options);
}, [data?.content?.ColumnConfigs]);
```

### 3. Use Type Safety

```tsx
// ✅ Good - Type-safe
type Client = ApiClientData;
const columns = generateColumnsFromConfig<Client>(columnConfigs, options);

// ❌ Bad - No type checking
const columns = generateColumnsFromConfig(columnConfigs, options);
```

### 4. Register Filter Types

If using dynamic filters, register them first:

```tsx
// In your app initialization or config file
import { registerFilterType } from "@/lib/api/datatable/column";

registerFilterType("clientName", {
  endpoint: "/ColumnFilter/GetClientName",
  fieldName: "clientName",
  idPrefix: "client",
});
```

### 5. Keep Actions Stable

```tsx
// ✅ Good - Stable references
const handleView = React.useCallback((row) => {
  router.push(`/clients/${row.id}`);
}, [router]);

const columns = React.useMemo(() => {
  return generateColumnsFromConfig(columnConfigs, {
    actions: { onView: handleView },
  });
}, [columnConfigs, handleView]);

// ❌ Bad - Creates new function on every render
const columns = React.useMemo(() => {
  return generateColumnsFromConfig(columnConfigs, {
    actions: { onView: (row) => router.push(`/clients/${row.id}`) },
  });
}, [columnConfigs, router]); // Missing dependency
```

### 6. Override Only When Necessary

```tsx
const columns = React.useMemo(() => {
  return generateColumnsFromConfig(columnConfigs, {
    // Override only specific columns that need custom rendering
    customColumns: {
      specialField: myCustomColumn,
    },
  });
}, [columnConfigs]);
```

---

## Migration Guide

### From Hardcoded Columns

**Before:**
```tsx
const columns: ColumnDef<Client>[] = [
  checkboxColumn<Client>(),
  dynamicLinkedColumn<Client>("clientName", "/clients", "Client Name", true),
  dynamicStatusColumn<Client>("clientStatus", "Status", true),
  dateColumn<Client>("createdOn", "Created On"),
  numberColumn<Client>("noOfAccounts", "Accounts"),
  standardActionColumn<Client>(onView, onEdit, onDelete),
];
```

**After:**
```tsx
const columns = React.useMemo(() => {
  return generateColumnsFromConfig<Client>(
    data.content.ColumnConfigs,
    {
      includeCheckbox: true,
      includeActions: true,
      linkBaseUrl: "/clients",
      actions: { onView, onEdit, onDelete },
    }
  );
}, [data.content.ColumnConfigs, onView, onEdit, onDelete]);
```

---

## Troubleshooting

### Columns Not Appearing

1. Check if `ColumnConfigs` is present in API response
2. Verify `isGridVisible` is `true` in config
3. Check `hidden` field is `false`

### Wrong Column Type

1. Check field name matches detection patterns
2. Add custom type mapping
3. Or use `customColumns` to override

### Filters Not Working

1. Ensure filter type is registered in filter registry
2. Check `enableFilters` options are set
3. Verify `filterTypeRegistry` maps dataIndex correctly

### Performance Issues

1. Always wrap `generateColumnsFromConfig` in `useMemo`
2. Ensure action handlers are memoized with `useCallback`
3. Check if unnecessary re-renders are occurring

---

## Resources

- [DataTable Documentation](../README.md)
- [Column Functions Reference](../columnFunctions/index.ts)
- [Filter API Documentation](../../../../lib/api/datatable/column/README.md)
- [TanStack Table Docs](https://tanstack.com/table/latest)

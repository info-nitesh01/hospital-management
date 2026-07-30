# Column Filter API with TanStack Query

Comprehensive API for managing dynamic column filters with full TanStack Query integration, providing powerful caching, prefetching, and state management capabilities.

## Table of Contents

- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Query Keys](#query-keys)
- [React Hooks](#react-hooks)
- [Prefetching](#prefetching)
- [Advanced Patterns](#advanced-patterns)
- [Examples](#examples)

---

## Quick Start

### 1. Register a Filter Type

```typescript
import { registerFilterType } from "@/lib/api/datatable/column";

registerFilterType("accountType", {
  endpoint: "/ColumnFilter/GetAccountType",
  fieldName: "accountType",
  idPrefix: "account-type",
});
```

### 2. Use in a Column Definition

```typescript
import { dynamicNameColumn } from "@/components/commonComponents/DataTable/columnFunctions";

const columns = [
  dynamicNameColumn<Account>("accountType", "Account Type", true, {
    enableFilter: true,
    filterType: "accountType",
  }),
];
```

### 3. Filter Data is Automatically Cached

TanStack Query handles all caching, refetching, and state management automatically!

---

## API Reference

### Core Functions

#### `registerFilterType(filterType: string, config: FilterTypeConfig)`

Register a new filter type in the global registry.

**Parameters:**
- `filterType`: Unique identifier (e.g., "clientType")
- `config`: Configuration object
  - `endpoint`: API endpoint path
  - `fieldName`: Response field name
  - `idPrefix`: Unique ID prefix

**Example:**
```typescript
registerFilterType("propertyStatus", {
  endpoint: "/ColumnFilter/GetPropertyStatus",
  fieldName: "propertyStatus",
  idPrefix: "property-status",
});
```

#### `getFilterDataByType(filterType: string, params: ColumnFilterParams)`

Fetch filter data for any registered filter type.

**Parameters:**
- `filterType`: Registered filter type
- `params`: Pagination and search parameters
  - `fromRange`: Start index (0-based)
  - `toRange`: Page size
  - `searchTerm?`: Optional search query (server-side)

**Returns:** `Promise<ColumnFilterResponse>`

**Example:**
```typescript
const data = await getFilterDataByType("clientType", {
  fromRange: 0,
  toRange: 50,
  searchTerm: "corporate",
});
```

---

## Query Keys

Centralized query keys factory for type-safe TanStack Query integration.

### `columnFilterKeys`

```typescript
import { columnFilterKeys } from "@/lib/api/datatable/column/queryKeys";

// All column filter queries
columnFilterKeys.all // ['columnFilter']

// All queries for a specific filter type
columnFilterKeys.type('clientName') // ['columnFilter', 'clientName']

// Specific list query with params
columnFilterKeys.list('clientName', { fromRange: 0, toRange: 50 })
// ['columnFilter', 'clientName', 'list', { fromRange: 0, toRange: 50 }]

// Search query
columnFilterKeys.search('clientName', 'acme')
// ['columnFilter', 'clientName', 'search', 'acme']
```

### Benefits

✅ **Type-safe**: TypeScript autocomplete for all query keys
✅ **Consistent**: Single source of truth for cache keys
✅ **Maintainable**: Easy to update cache invalidation logic
✅ **Debuggable**: Clear query structure in React Query DevTools

---

## React Hooks

### `useFilterData(filterType, params, options?)`

Main hook for fetching filter data with TanStack Query.

**Parameters:**
- `filterType`: Filter type identifier
- `params`: Pagination/search params
- `options?`: Additional React Query options

**Returns:**
```typescript
{
  data: ColumnFilterResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  // ... all standard React Query returns
}
```

**Example:**
```typescript
import { useFilterData } from "@/lib/api/datatable/column";

function MyComponent() {
  const { data, isLoading, error } = useFilterData("clientType", {
    fromRange: 0,
    toRange: 50,
  });

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data?.data.map(item => (
        <li key={item.id}>{item.clientName}</li>
      ))}
    </ul>
  );
}
```

### Specialized Hooks

```typescript
// Client Name Filter
const { data } = useClientNameFilter({ fromRange: 0, toRange: 50 });

// Client Short Name Filter
const { data } = useClientShortNameFilter({ fromRange: 0, toRange: 50 });

// Client Status Filter
const { data } = useClientStatusFilter({ fromRange: 0, toRange: 50 });

// Client Type Filter
const { data } = useClientTypeFilter({ fromRange: 0, toRange: 50 });
```

### `usePrefetchFilterData()`

Hook for programmatic prefetching.

**Example:**
```typescript
import { usePrefetchFilterData } from "@/lib/api/datatable/column";

function DataTableHeader() {
  const { prefetchFilter } = usePrefetchFilterData();

  const handleHover = () => {
    prefetchFilter("clientType", { fromRange: 0, toRange: 50 });
  };

  return <Button onMouseEnter={handleHover}>Filters</Button>;
}
```

### `useInvalidateFilterData()`

Hook for cache invalidation.

**Example:**
```typescript
import { useInvalidateFilterData } from "@/lib/api/datatable/column";

function RefreshButton() {
  const { invalidateFilter, invalidateAllFilters } = useInvalidateFilterData();

  return (
    <>
      <Button onClick={() => invalidateFilter("clientType")}>
        Refresh Client Types
      </Button>
      <Button onClick={invalidateAllFilters}>
        Refresh All Filters
      </Button>
    </>
  );
}
```

### `useFilterDataCache()`

Direct cache manipulation.

**Example:**
```typescript
import { useFilterDataCache } from "@/lib/api/datatable/column";

function CacheExample() {
  const { getCachedData, setCachedData } = useFilterDataCache(
    "clientType",
    { fromRange: 0, toRange: 50 }
  );

  const handleOptimisticUpdate = () => {
    const current = getCachedData();
    if (current) {
      setCachedData({
        ...current,
        data: [...current.data, newItem],
      });
    }
  };

  return <Button onClick={handleOptimisticUpdate}>Add Item</Button>;
}
```

---

## Prefetching

### Automatic Prefetching (Built-in)

The `DynamicFilterPopover` component automatically prefetches filter data on hover:

```typescript
<DynamicFilterPopover
  column={column}
  filterType="clientType"
  enablePrefetch={true} // Default: true
/>
```

### Manual Prefetching Utilities

```typescript
import {
  prefetchFilterOnHover,
  prefetchMultipleFilters,
  prefetchAllFilters
} from "@/components/commonComponents/DataTable/utils/filterPrefetch";
import { useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const queryClient = useQueryClient();

  // Prefetch on hover
  const handleHover = () => {
    prefetchFilterOnHover(queryClient, "clientType", {
      fromRange: 0,
      toRange: 50,
    });
  };

  // Prefetch multiple filters
  const handlePageLoad = async () => {
    await prefetchMultipleFilters(
      queryClient,
      ["clientName", "clientStatus", "clientType"],
      { fromRange: 0, toRange: 50 }
    );
  };

  // Prefetch all registered filters
  const prefetchAll = async () => {
    await prefetchAllFilters(queryClient);
  };

  return <div onMouseEnter={handleHover}>...</div>;
}
```

### Cache Management

```typescript
import {
  getFilterCacheStats,
  clearFilterCache
} from "@/components/commonComponents/DataTable/utils/filterPrefetch";

// Get cache statistics
const stats = getFilterCacheStats(queryClient, "clientType");
console.log({
  totalQueries: stats.totalQueries,
  staleQueries: stats.staleQueries,
  cachedData: stats.cachedData,
});

// Clear cache
clearFilterCache(queryClient, "clientType"); // Clear specific
clearFilterCache(queryClient); // Clear all filters
```

---

## Advanced Patterns

### Server-Side Search

```typescript
// Enable server-side search (default)
const { data } = useFilterData("clientName", {
  fromRange: 0,
  toRange: 50,
  searchTerm: "acme", // Sent to server
});

// Disable server-side search (client-side only)
<DynamicFilterPopover
  column={column}
  filterType="clientName"
  useServerSearch={false}
/>
```

### Optimistic Updates

```typescript
import { useOptimisticFilterUpdate } from "@/lib/api/datatable/column";

function OptimisticExample() {
  const { updateFilterOptimistically } = useOptimisticFilterUpdate();

  const handleAdd = () => {
    const context = updateFilterOptimistically(
      "clientType",
      { fromRange: 0, toRange: 50 },
      (oldData) => ({
        ...oldData,
        data: [...(oldData?.data || []), newItem],
      })
    );

    // context.previousData available for rollback
  };

  return <Button onClick={handleAdd}>Add</Button>;
}
```

### Filter Selection State Management

```typescript
import { useFilterSelection } from "@/lib/api/datatable/column";

function FilterManager() {
  const {
    selection,
    addToSelection,
    removeFromSelection,
    clearSelection,
  } = useFilterSelection("clientType");

  return (
    <div>
      <p>Selected: {selection.size} items</p>
      <Button onClick={() => addToSelection("Corporate")}>
        Add Corporate
      </Button>
      <Button onClick={clearSelection}>Clear All</Button>
    </div>
  );
}
```

### Custom Query Options

```typescript
const { data } = useFilterData(
  "clientType",
  { fromRange: 0, toRange: 50 },
  {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated, // Conditional fetching
  }
);
```

---

## Examples

### Example 1: Basic Filter Column

```typescript
import { dynamicNameColumn } from "@/components/commonComponents/DataTable/columnFunctions";
import { registerFilterType } from "@/lib/api/datatable/column";

// Register the filter
registerFilterType("department", {
  endpoint: "/ColumnFilter/GetDepartment",
  fieldName: "department",
  idPrefix: "dept",
});

// Use in columns
const columns = [
  dynamicNameColumn<Employee>("department", "Department", true, {
    enableFilter: true,
    filterType: "department",
  }),
];
```

### Example 2: Prefetch on Tab Switch

```typescript
import { usePrefetchFilterData } from "@/lib/api/datatable/column";

function TabView() {
  const { prefetchFilter } = usePrefetchFilterData();

  const handleTabChange = (tab: string) => {
    if (tab === "clients") {
      // Prefetch filter data before tab renders
      prefetchFilter("clientType", { fromRange: 0, toRange: 50 });
      prefetchFilter("clientStatus", { fromRange: 0, toRange: 50 });
    }
  };

  return <Tabs onValueChange={handleTabChange}>...</Tabs>;
}
```

### Example 3: Custom Filter Hook

```typescript
import { useFilterData } from "@/lib/api/datatable/column";

function useProjectFilters(projectId: string) {
  const statusFilter = useFilterData(
    "projectStatus",
    { fromRange: 0, toRange: 50 },
    { enabled: !!projectId }
  );

  const priorityFilter = useFilterData(
    "projectPriority",
    { fromRange: 0, toRange: 50 },
    { enabled: !!projectId }
  );

  return {
    statuses: statusFilter.data?.data || [],
    priorities: priorityFilter.data?.data || [],
    isLoading: statusFilter.isLoading || priorityFilter.isLoading,
  };
}
```

---

## Configuration

### Default Cache Times

```typescript
// Query configuration (in hooks)
staleTime: 5 * 60 * 1000,  // 5 minutes
gcTime: 10 * 60 * 1000,     // 10 minutes (cache retention)
retry: 2,                    // Retry failed requests twice
```

### Global Configuration

Modify global settings in `contexts/QueryProvider.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,         // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## Troubleshooting

### Filter Not Loading

1. Check if filter type is registered:
```typescript
import { filterTypeRegistry } from "@/lib/api/datatable/column";
console.log(filterTypeRegistry);
```

2. Verify endpoint is correct
3. Check network tab for API errors
4. Enable React Query DevTools

### Stale Data

```typescript
// Force refetch
const { refetch } = useFilterData(...);
refetch();

// Or invalidate cache
const { invalidateFilter } = useInvalidateFilterData();
invalidateFilter("clientType");
```

### Memory Issues

```typescript
// Reduce cache time
const { data } = useFilterData(filterType, params, {
  gcTime: 1 * 60 * 1000, // 1 minute instead of 10
});

// Or clear cache periodically
import { clearFilterCache } from "@/components/commonComponents/DataTable/utils/filterPrefetch";
clearFilterCache(queryClient, "clientType");
```

---

## Best Practices

1. **Always register filter types** before using them
2. **Use query keys factory** for cache invalidation
3. **Enable prefetching** for better UX (it's on by default)
4. **Leverage stale-while-revalidate** pattern (built-in)
5. **Monitor cache with DevTools** in development
6. **Use optimistic updates** sparingly and with rollback
7. **Set appropriate stale times** based on data change frequency

---

## Migration Guide

### From Old Implementation

```typescript
// Before
import { getClientNames } from "@/lib/api/datatable/column";
const data = await getClientNames({ fromRange: 0, toRange: 50 });

// After (with TanStack Query)
import { useClientNameFilter } from "@/lib/api/datatable/column";
const { data, isLoading } = useClientNameFilter({ fromRange: 0, toRange: 50 });
```

Both patterns are supported for backward compatibility!

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)

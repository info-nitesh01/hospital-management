// Export all column types and utilities
export * from "./types";

/**
 * CHECKBOX COLUMN
 * Example: checkboxColumn<Client>()
 * Data format: N/A - Used for row selection
 * Description: Adds a checkbox column for selecting rows
 */
export { checkboxColumn } from "./checkboxColumn";

/**
 * CROSS-PAGE CHECKBOX COLUMN
 * Example: crossPageCheckboxColumn<Client>(crossPageSelection, (row) => row.id, currentPageData)
 * Data format: N/A - Used for cross-page row selection
 * Description: Adds a checkbox column that works with cross-page selection
 */
export { crossPageCheckboxColumn } from "./crossPageCheckboxColumn";

/**
 * EMAIL COLUMN
 * Example: emailColumn<Client>("email")
 * Data format: string (valid email)
 */
export { emailColumn } from "./emailColumn";

/**
 * PHONE COLUMN
 * Example: phoneColumn<Client>("phone")
 * Data format: string (phone number)
 */
export { phoneColumn } from "./phoneColumn";

/**
 * TABLE STATUS COLUMN
 * Example: tableStatusColumn<Client>("clientStatus", "Status", true, { filterType: "clientStatus" })
 * Parameters:
 * - accessor: Field to use (default: "status")
 * - title: Column header label (default: "Status")
 * - sortable: Enable sorting (default: true)
 * - options: { enableFilter?: boolean, filterType?: string }
 * Data format: string
 * Description: Status column with server-side filter that fetches options from API
 */
export { tableStatusColumn } from "./tableStatusColumn";

/**
 * TABLE NAME COLUMN
 * Example: tableNameColumn<Client>("clientType", "Client Type", true, { enableFilter: true, filterType: "clientType" })
 * Parameters:
 * - accessor: Field to use
 * - title: Column header label
 * - sortable: Enable sorting (default: true)
 * - options: { enableFilter?: boolean, filterType?: string, className?: string }
 * Data format: string
 * Description: Name column with server-side filter that fetches options from API (non-linked)
 */
export { tableNameColumn } from "./tableNameColumn";

/**
 * TABLE LINKED COLUMN
 * Example: tableLinkedColumn<Client>("clientName", "/clients", "Client Name", true, { filterType: "clientName" })
 * Parameters:
 * - accessor: Field to use
 * - baseUrl: Base URL for links
 * - title: Column header label
 * - sortable: Enable sorting (default: true)
 * - options: { enableFilter?: boolean, filterType?: string }
 * Data format: string
 * Description: Linked name column with server-side filter that fetches options from API
 */
export { tableLinkedColumn } from "./tableLinkedColumn";

/**
 * DATE COLUMN
 * Example: dateColumn<Client>("createdAt", "Created", "dateRange")
 * Parameters:
 * - accessor: Field to use
 * - label: Column header label (default: "Date")
 * - enableFilter: false (no filter), true (multi-select), or "dateRange" (date range filter)
 * Data format: string (ISO date) | Date object
 */
export { dateColumn } from "./dateColumn";

/**
 * CURRENCY COLUMN
 * Example: currencyColumn<Client>("revenue", "Revenue", "USD", "range")
 * Parameters:
 * - accessor: Field to use
 * - label: Column header label
 * - currency: Currency code (default: "USD")
 * - enableFilter: false (no filter), true (multi-select), or "range" (range filter)
 * Data format: number | string (parseable as number)
 */
export { currencyColumn } from "./currencyColumn";

/**
 * PERCENTAGE COLUMN
 * Example: percentageColumn<Project>("progress", "Progress")
 * Data format: number (0-100)
 */
export { percentageColumn } from "./percentageColumn";

/**
 * BOOLEAN COLUMN
 * Example: booleanColumn<User>("isActive", "Status", "Active", "Inactive")
 * Data format: boolean
 */
export { booleanColumn } from "./booleanColumn";

/**
 * NUMBER COLUMN
 * Example: numberColumn<Product>("quantity", "Quantity", undefined, "range")
 * Parameters:
 * - accessor: Field to use
 * - label: Column header label
 * - suffix: Optional suffix to display after number
 * - enableFilter: false (no filter), true (multi-select), or "range" (range filter)
 * Data format: number
 */
export { numberColumn } from "./numberColumn";

/**
 * STANDARD ACTION COLUMN
 * Example: standardActionColumn<Client>(
 *   (client) => console.log("View", client),
 *   (client) => console.log("Edit", client),
 *   (client) => console.log("Delete", client),
 *   undefined, // additional actions
 *   "Actions" // custom header label (default: "Action")
 * )
 * Data format: The entire row object is passed to callbacks
 */
export { standardActionColumn } from "./actionColumn";

/**
 * SERVER-SIDE SORTABLE HEADER
 * Example: createServerSortableHeader<Client>(
 *   "Client Name",
 *   1, // sortIndex from ColumnConfig.sortOrder
 *   { sortIndex: currentSortIndex, sortBy: currentSortBy, onSortChange: handleSort },
 *   true, // enableFilter
 *   "clientName" // filterType
 * )
 * Description: Creates a sortable header for server-side sorting with optional filter
 * Use this when you need to trigger API calls on sort changes
 */
export { createServerSortableHeader } from "./createServerSortableHeader";
export type { ServerSortState } from "./createServerSortableHeader";
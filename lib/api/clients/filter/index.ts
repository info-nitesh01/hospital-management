import type { FilterTypeConfig } from "@/lib/api/datatable/column/types";

export const CLIENTS_FILTER_API_FUNCTIONS: Record<string, FilterTypeConfig> = {
  clientName: { endpoint: "/ColumnFilter/GetClientName", fieldName: "clientName", idPrefix: "client" },
  clientShortName: { endpoint: "/ColumnFilter/GetClientShortName", fieldName: "clientShortName", idPrefix: "client-short" },
  clientStatus: { endpoint: "/ColumnFilter/GetClientStatus", fieldName: "clientStatus", idPrefix: "status" },
  clientType: { endpoint: "/ColumnFilter/GetClientType", fieldName: "clientType", idPrefix: "client-type" },
  contactName: { endpoint: "/ColumnFilter/GetClientContactName", fieldName: "contactName", idPrefix: "contact-name" },
  contactEmail: { endpoint: "/ColumnFilter/GetClientContactEmail", fieldName: "contactEmail", idPrefix: "contact-email" },
  createdBy: { endpoint: "/ColumnFilter/GetClientCreatedBy", fieldName: "createdBy", idPrefix: "created-by" },
  modifiedBy: { endpoint: "/ColumnFilter/GetClientModifiedBy", fieldName: "modifiedBy", idPrefix: "modified-by" },
  createdOn: { endpoint: "", fieldName: "createdOn", idPrefix: "created-on" },
  modifiedOn: { endpoint: "", fieldName: "modifiedOn", idPrefix: "modified-on" },
};

import type { FilterTypeConfig } from "@/lib/api/datatable/column/types";

export const USERS_FILTER_API_FUNCTIONS: Record<string, FilterTypeConfig> = {
  userName: {
    endpoint: "/ColumnFilter/GetUserName",
    fieldName: "userName",
    idPrefix: "user",
  },
  userEmail: {
    endpoint: "/ColumnFilter/GetUserEmail",
    fieldName: "userEmail",
    idPrefix: "user-email",
  },
  userRole: {
    endpoint: "/ColumnFilter/GetUserRole",
    fieldName: "userRole",
    idPrefix: "user-role",
  },
};
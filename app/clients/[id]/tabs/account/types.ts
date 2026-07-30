import type { ColumnConfig } from "@/lib/api/clients/types";

export interface AccountData {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  status: string;
  balance: number;
  contactEmail: string;
  contactPhone: string;
  createdDate: string;
  lastModified: string;
  accountManager: string;
  [key: string]: unknown; // For TableData compatibility
}

export interface AccountFilters {
  accountName?: string | string[];
  accountType?: string | string[];
  status?: string | string[];
  accountManager?: string | string[];
  fromBalance?: number;
  toBalance?: number;
  fromCreatedDate?: string;
  toCreatedDate?: string;
  [key: string]: string | string[] | number | undefined;
}

export interface StaticAccountData {
  ColumnConfigs: ColumnConfig[];
  Data: AccountData[];
}

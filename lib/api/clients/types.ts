/**
 * Client API Types
 *
 * Type definitions for client-related API responses and requests
 */

export interface ApiClientData {
  clientName: string;
  clientShortName: string | null;
  clientStatus: string;
  clientType: string | null;
  propertyType: string | null;
  contactName: string | null;
  contactEmail: string | null;
  noOfProperties: number | null;
  noOfAccounts: number | null;
  createdBy: string | null;
  createdOn: string;
  modifiedBy: string | null;
  modifiedOn: string | null;
  vendorId: string;
  clientId: string;
  activeClient: number;
  pendingClient: number;
  totalRecords: number;
  noOfPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  [key: string]: unknown; // Index signature for TableData compatibility
}

export interface ColumnConfig {
  dataIndex: string;
  title: string;
  isGridVisible: boolean;
  isFormVisible: boolean;
  sortOrder: number;
  isReadOnly: boolean;
  isMandatory: boolean;
  hidden: boolean;
  sorter: boolean;
  showSorterTooltip: boolean;
  width: number;
  key: string;
  // Optional field for specifying column type explicitly
  columnType?: "text" | "number" | "date" | "status" | "email" | "phone" | "boolean" | "currency" | "percentage" | "link";
}

export interface ApiClientsResponse {
  code: number;
  content: {
    Data: ApiClientData[];
    ColumnConfigs: ColumnConfig[];
  };
  currentFileId: string | null;
  currentAssessmentId: string | null;
}

/**
 * Client filter parameters for API requests
 * All filter values can be either a single value or an array for multi-select
 */
export interface ClientFilters {
  clientName?: string | string[];
  clientShortName?: string | string[];
  clientStatus?: string | string[];
  clientType?: string | string[];
  state?: string | string[];
  city?: string | string[];
  county?: string | string[];
  zip?: string | string[];
  address?: string | string[];
  contactName?: string | string[];
  contactEmail?: string | string[];
  contactPhone?: string | string[];
  createdBy?: string | string[];
  modifiedBy?: string | string[];
  clientManager?: string | string[];
  salesManager?: string | string[];
  notes?: string | string[];
  // Date range filters
  fromCreatedOn?: string;
  toCreatedOn?: string;
  fromModifiedOn?: string;
  toModifiedOn?: string;
  // Numeric range filters (from/to prefix format)
  fromNoOfAccounts?: number;
  toNoOfAccounts?: number;
  fromNoOfProperties?: number;
  toNoOfProperties?: number;
  fromFairMarketValue?: number;
  toFairMarketValue?: number;
  fromTaxableValue?: number;
  toTaxableValue?: number;
  fromFinalSavings?: number;
  toFinalSavings?: number;
  // Legacy numeric range filters (Min/Max suffix) - kept for backward compatibility
  noOfAccountsMin?: number;
  noOfAccountsMax?: number;
  noOfPropertiesMin?: number;
  noOfPropertiesMax?: number;
  fairMarketValueMin?: number;
  fairMarketValueMax?: number;
  taxableValueMin?: number;
  taxableValueMax?: number;
  finalSavingsMin?: number;
  finalSavingsMax?: number;
  // Allow any additional filter fields
  [key: string]: string | string[] | number | undefined;
}

export interface ClientContact {
  contactId: string;
  contactType: "Primary" | "Alternate" | string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdBy: string;
  createdOn: string;
  clientId: string;
}

export interface AdditionalFee {
  feeType: string;
  feeValue: number;
}

export interface ClientDetailData {
  clientName: string;
  clientId: string;
  clientShortName: string | null;
  clientStatus: string;
  clientType: string | null;
  propertyType: string | null;
  state: string | null;
  city: string | null;
  county: string | null;
  zip: string | null;
  address: string | null;
  notes: string | null;
  vendorId: string;
  industry: string | null;
  primaryContactEmail: string | null;
  billingContactEmail: string | null;
  clientManager: string | null;
  clientSource: string | null;
  contractStatus: string | null;
  clientDescription: string | null;
  fairMarketValue: number;
  taxableValue: number;
  finalSavings: number;
  lattitude: string | null;
  longitude: string | null;
  salesManager: string | null;
  updatedByName: string | null;
  createdByName: string | null;
  createdOn: string;
  updateOn: string | null;
  clientManagerName: string | null;
  salesManagerName: string | null;
  clientContacts: ClientContact[];
  billingId: string | null;
  billingMethod: string | null;
  billingSettings: string | null;
  billingInternalNotes: string | null;
  billingClientNotes: string | null;
  billingManager: string | null;
  billingManagerName: string | null;
  contingency: string | null;
  contingencyPercentage: number | null;
  additionalFees: AdditionalFee[] | null;
  discount: number | null;
  maximumCap: number | null;
  minimumBilling: number | null;
  additionalSettingsId: string | null;
  defaultTaxRateSource: string | null;
  defaultTaxRateType: string | null;
  defaultAssessment: string | null;
}

export interface GetClientByIdResponse {
  code: number;
  content: ClientDetailData;
  currentFileId: string | null;
  currentAssessmentId: string | null;
}

// Graph/Chart Data Types
export interface GraphDataPoint {
  year: string;
  fmv: number;
}

export interface GetGraphDataResponse {
  code: number;
  content: GraphDataPoint[];
  currentFileId: string | null;
  currentAssessmentId: string | null;
}
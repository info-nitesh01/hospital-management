import type { ColumnConfig } from "@/lib/api/clients/types";

export interface PropertyData {
  propertyId: string;
  propertyNumber: string;
  propertyName: string;
  propertyType: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  marketValue: number;
  taxableValue: number;
  squareFeet: number;
  yearBuilt: number;
  acquisitionDate: string;
  propertyManager: string;
  [key: string]: unknown; // For TableData compatibility
}

export interface PropertyFilters {
  propertyName?: string | string[];
  propertyType?: string | string[];
  status?: string | string[];
  city?: string | string[];
  state?: string | string[];
  propertyManager?: string | string[];
  fromMarketValue?: number;
  toMarketValue?: number;
  fromTaxableValue?: number;
  toTaxableValue?: number;
  fromSquareFeet?: number;
  toSquareFeet?: number;
  fromYearBuilt?: number;
  toYearBuilt?: number;
  fromAcquisitionDate?: string;
  toAcquisitionDate?: string;
  [key: string]: string | string[] | number | undefined;
}

export interface StaticPropertyData {
  ColumnConfigs: ColumnConfig[];
  Data: PropertyData[];
}

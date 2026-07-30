import { createSimpleQuery } from "./shared";

interface TaxRateTypeItem {
  taxRateType: string;
}

export const useTaxRateTypes = createSimpleQuery<TaxRateTypeItem, "taxRateType">(
  "/ColumnFilter/GetDefaultTaxRateType",
  ["clients", "billing", "taxRateTypes"],
  "taxRateType"
);

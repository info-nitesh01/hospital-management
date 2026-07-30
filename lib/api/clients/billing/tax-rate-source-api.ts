import { createSimpleQuery } from "./shared";

interface TaxRateSourceItem {
  taxRateSource: string;
}

export const useTaxRateSources = createSimpleQuery<TaxRateSourceItem, "taxRateSource">(
  "/ColumnFilter/GetDefaultTaxRateSource",
  ["clients", "billing", "taxRateSources"],
  "taxRateSource"
);

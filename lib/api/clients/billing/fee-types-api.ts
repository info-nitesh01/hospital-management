import { createBillingQuery } from "./shared";

interface FeeTypeItem {
  feeType: string;
}

export const useFeeTypes = createBillingQuery<FeeTypeItem, "feeType">(
  "/Clients/GetAdditionalFee",
  ["clients", "billing", "feeTypes"],
  "feeType"
);

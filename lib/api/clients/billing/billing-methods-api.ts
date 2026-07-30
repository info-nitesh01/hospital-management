import { createBillingQuery } from "./shared";

interface BillingMethodItem {
  billingMethod: string;
}

export const useBillingMethods = createBillingQuery<BillingMethodItem, "billingMethod">(
  "/ColumnFilter/GetBillingMethod",
  ["clients", "billing", "billingMethods"],
  "billingMethod"
);

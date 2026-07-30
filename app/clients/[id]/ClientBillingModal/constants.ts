import type { BillingFormData } from "./types";

export const INITIAL_BILLING_FORM_STATE: BillingFormData = {
  billingMethod: "",
  contingencyPercentage: "",
  additionalFees: [],
  tierSettings: [],
  discountEnabled: false,
  discount: "",
  discountType: "$",
  maximumCapEnabled: false,
  maximumCap: "",
  minimumBillingEnabled: false,
  minimumBilling: "",
  billingClientNotes: "",
  billingManager: "",
  defaultTaxRateSource: "",
  defaultTaxRateType: "",
  defaultAssessmentType: "",
};

export const REQUIRED_FIELDS = [
  { field: "billingMethod" as keyof BillingFormData, message: "Billing Method is required" },
] as const;

import type { AdditionalFee } from "@/lib/api/clients/types";

export interface ClientBillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export interface TierSetting {
  tier: string;
  savingsFrom: number;
  savingsTo: number;
  percentage: number;
}

export interface BillingFormData {
  billingMethod: string;
  contingencyPercentage: string;
  additionalFees: AdditionalFee[];
  tierSettings: TierSetting[];
  discountEnabled: boolean;
  discount: string;
  discountType: "$" | "%";
  maximumCapEnabled: boolean;
  maximumCap: string;
  minimumBillingEnabled: boolean;
  minimumBilling: string;
  billingClientNotes: string;
  billingManager: string;
  defaultTaxRateSource: string;
  defaultTaxRateType: string;
  defaultAssessmentType: string;
}

export interface BillingFormErrors {
  billingMethod?: string;
  contingencyPercentage?: string;
  discount?: string;
  maximumCap?: string;
  minimumBilling?: string;
  billingClientNotes?: string;
  billingManager?: string;
  [key: string]: string | undefined;
}

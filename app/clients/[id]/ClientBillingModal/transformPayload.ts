import type { BillingFormData } from "./types";
import type { SaveClientBillingPayload } from "@/lib/api/clients/billing/save-billing-api";

interface BillingSettingsObject {
  TierSettings?: Array<{
    Tier: string;
    SavingsFrom: number;
    SavingsTo: number;
    Percentage: number;
  }>;
  ContingencyPercentage?: number | null;
  Discount?: number | null;
  MaxBillingCap?: number | null;
  MinBillingCap?: number | null;
  AdditionalFeePerAccount?: Array<{
    FeeType: string;
    FeeValue: number;
  }>;
}

/**
 * Transforms ClientBillingModal form data into API payload format
 */
export function transformBillingFormToPayload(
  formData: BillingFormData,
  clientId: string
): SaveClientBillingPayload {
  // Build billing settings object based on billing method
  const billingSettingsObj: BillingSettingsObject = {};

  if (formData.billingMethod.toLowerCase() === "tier") {
    // For tier billing method
    billingSettingsObj.TierSettings = formData.tierSettings.map((tier) => ({
      Tier: tier.tier,
      SavingsFrom: tier.savingsFrom,
      SavingsTo: tier.savingsTo,
      Percentage: tier.percentage,
    }));
  } else {
    // For contingency or other methods
    billingSettingsObj.ContingencyPercentage = formData.contingencyPercentage
      ? Number(formData.contingencyPercentage)
      : null;
  }

  // Add discount if enabled (send number without symbol)
  if (formData.discountEnabled && formData.discount) {
    billingSettingsObj.Discount = Number(formData.discount);
  } else {
    billingSettingsObj.Discount = null;
  }

  // Add maximum cap if enabled
  billingSettingsObj.MaxBillingCap = formData.maximumCapEnabled && formData.maximumCap
    ? Number(formData.maximumCap)
    : null;

  // Add minimum billing cap if enabled
  billingSettingsObj.MinBillingCap = formData.minimumBillingEnabled && formData.minimumBilling
    ? Number(formData.minimumBilling)
    : null;

  // Add additional fees inside billing settings (matching API response structure)
  const validFees = formData.additionalFees.filter(
    (fee) => fee.feeType && fee.feeValue
  );

  if (validFees.length > 0) {
    billingSettingsObj.AdditionalFeePerAccount = validFees.map((fee) => ({
      FeeType: fee.feeType,
      FeeValue: Number(fee.feeValue),
    }));
  }

  return {
    clientId,
    billingMethod: formData.billingMethod,
    billingSettings: JSON.stringify([billingSettingsObj]),
    additionalFeePerAccount: [], // Send empty array as per API structure
    billingInternalNotes: "", // Not in form currently
    billingClientNotes: formData.billingClientNotes || "",
    billingManager: formData.billingManager || "",
    defaultTaxRateSource: formData.defaultTaxRateSource || "",
    defaultTaxRateType: formData.defaultTaxRateType || "",
    defaultAssessment: formData.defaultAssessmentType || "",
  };
}

import * as React from "react";
import type { BillingFormData, TierSetting } from "./types";
import { INITIAL_BILLING_FORM_STATE } from "./constants";
import type { AdditionalFee } from "@/lib/api/clients/types";
import { useBillingMethods } from "@/lib/api/clients/billing/billing-methods-api";
import { useFeeTypes } from "@/lib/api/clients/billing/fee-types-api";
import { useAccountManagers } from "@/lib/api/clients/billing/account-managers-api";
import { useTaxRateSources } from "@/lib/api/clients/billing/tax-rate-source-api";
import { useTaxRateTypes } from "@/lib/api/clients/billing/tax-rate-type-api";
import { useAssessmentTypes } from "@/lib/api/clients/billing/assessment-type-api";

export function useBillingForm() {
  const [formData, setFormData] = React.useState<BillingFormData>(INITIAL_BILLING_FORM_STATE);
  const [fetchFlags, setFetchFlags] = React.useState({
    billingMethods: false,
    feeTypes: false,
    accountManagers: false,
    taxRateSources: false,
    taxRateTypes: false,
    assessmentTypes: false,
  });

  const enableFetch = React.useCallback((key: keyof typeof fetchFlags) => {
    setFetchFlags((prev) => ({ ...prev, [key]: true }));
  }, []);

  const queries = {
    billingMethods: useBillingMethods(fetchFlags.billingMethods),
    feeTypes: useFeeTypes(fetchFlags.feeTypes),
    accountManagers: useAccountManagers(fetchFlags.accountManagers),
    taxRateSources: useTaxRateSources(fetchFlags.taxRateSources),
    taxRateTypes: useTaxRateTypes(fetchFlags.taxRateTypes),
    assessmentTypes: useAssessmentTypes(fetchFlags.assessmentTypes),
  };

  const handleInputChange = React.useCallback(
    (field: keyof BillingFormData, value: string | boolean) => {
      if (field === "discount" && typeof value === "string") {
        const numValue = Number(value);
        if (formData.discountType === "%" && numValue > 100) return;
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [formData.discountType]
  );

  const handleAddFee = React.useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      additionalFees: [...prev.additionalFees, { feeType: "", feeValue: 0 }],
    }));
  }, []);

  const handleRemoveFee = React.useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalFees: prev.additionalFees.filter((_, i) => i !== index),
    }));
  }, []);

  const handleFeeChange = React.useCallback(
    (index: number, field: keyof AdditionalFee, value: string | number) => {
      setFormData((prev) => {
        const newFees = [...prev.additionalFees];
        newFees[index] = { ...newFees[index], [field]: value };
        return { ...prev, additionalFees: newFees };
      });
    },
    []
  );

  const handleAddTier = React.useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      tierSettings: [
        ...prev.tierSettings,
        { tier: "", savingsFrom: 0, savingsTo: 0, percentage: 0 },
      ],
    }));
  }, []);

  const handleRemoveTier = React.useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      tierSettings: prev.tierSettings.filter((_, i) => i !== index),
    }));
  }, []);

  const handleTierChange = React.useCallback(
    (index: number, field: keyof TierSetting, value: string | number) => {
      setFormData((prev) => {
        const newTiers = [...prev.tierSettings];
        newTiers[index] = { ...newTiers[index], [field]: value };
        return { ...prev, tierSettings: newTiers };
      });
    },
    []
  );

  const resetForm = React.useCallback(() => {
    setFormData(INITIAL_BILLING_FORM_STATE);
    setFetchFlags({
      billingMethods: false,
      feeTypes: false,
      accountManagers: false,
      taxRateSources: false,
      taxRateTypes: false,
      assessmentTypes: false,
    });
  }, []);

  return {
    formData,
    setFormData,
    queries,
    enableFetch,
    handlers: {
      handleInputChange,
      handleAddFee,
      handleRemoveFee,
      handleFeeChange,
      handleAddTier,
      handleRemoveTier,
      handleTierChange,
    },
    resetForm,
  };
}

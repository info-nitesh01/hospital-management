"use client";

import * as React from "react";
import { Button } from "@/components/commonComponents/Button";
import { Modal } from "@/components/commonComponents/Modal";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableInput } from "@/components/commonComponents/SearchableInput";
import { PercentageInput } from "@/components/commonComponents/PercentageInput";
import { showErrorToast, showSuccessToast } from "@/lib/api";
import type { ClientBillingModalProps } from "./types";
import { useBillingForm } from "./useBillingForm";
import { AdditionalFeesTable } from "./AdditionalFeesTable";
import { TierSettingsTable } from "./TierSettingsTable";
import { useSaveClientBilling } from "@/lib/api/clients/billing/save-billing-api";
import { transformBillingFormToPayload } from "./transformPayload";
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "@/lib/api/clients";

export function ClientBillingModal({
  open,
  onOpenChange,
  clientId,
}: ClientBillingModalProps) {
  const { formData, setFormData, queries, enableFetch, handlers, resetForm } =
    useBillingForm();

  const saveBillingMutation = useSaveClientBilling();

  // Fetch client data to prefill the form
  const { data: clientData } = useQuery({
    queryKey: ["client-detail", clientId],
    queryFn: () => getClientById(clientId),
    enabled: open && !!clientId,
  });

  // Prefill form data when client data is loaded
  React.useEffect(() => {
    if (clientData && open) {
      // Parse billingSettings to get tier settings if billing method is tier
      interface TierSettingRaw {
        Tier: string;
        SavingsFrom: number;
        SavingsTo: number;
        Percentage: number;
      }

      interface BillingSettingsRaw {
        TierSettings?: TierSettingRaw[];
      }

      let parsedTierSettings: Array<{
        tier: string;
        savingsFrom: number;
        savingsTo: number;
        percentage: number;
      }> = [];

      if (clientData.billingSettings) {
        try {
          const billingSettingsArray = JSON.parse(clientData.billingSettings) as BillingSettingsRaw[];
          if (Array.isArray(billingSettingsArray) && billingSettingsArray.length > 0) {
            const settings = billingSettingsArray[0];
            if (settings.TierSettings && Array.isArray(settings.TierSettings)) {
              parsedTierSettings = settings.TierSettings.map((tier) => ({
                tier: tier.Tier || "",
                savingsFrom: tier.SavingsFrom || 0,
                savingsTo: tier.SavingsTo || 0,
                percentage: tier.Percentage || 0,
              }));
            }
          }
        } catch (error) {
          console.error("Failed to parse tier settings:", error);
        }
      }

      setFormData({
        billingMethod: clientData.billingMethod || "",
        contingencyPercentage: clientData.contingencyPercentage?.toString() || "",
        additionalFees: clientData.additionalFees || [],
        tierSettings: parsedTierSettings.length > 0 ? parsedTierSettings : [{ tier: "", savingsFrom: 0, savingsTo: 0, percentage: 0 }],
        discountEnabled: clientData.discount !== null && clientData.discount !== undefined,
        discount: clientData.discount?.toString() || "",
        discountType: "%",
        maximumCapEnabled: clientData.maximumCap !== null && clientData.maximumCap !== undefined,
        maximumCap: clientData.maximumCap?.toString() || "",
        minimumBillingEnabled: clientData.minimumBilling !== null && clientData.minimumBilling !== undefined,
        minimumBilling: clientData.minimumBilling?.toString() || "",
        billingClientNotes: clientData.billingClientNotes || "",
        billingManager: clientData.billingManager || "",
        defaultTaxRateSource: clientData.defaultTaxRateSource || "",
        defaultTaxRateType: clientData.defaultTaxRateType || "",
        defaultAssessmentType: clientData.defaultAssessment || "",
      });
    }
  }, [clientData, open, setFormData]);

  const handleClose = React.useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [onOpenChange, resetForm]);

  // Validate tier settings
  const hasTierValidationErrors = React.useMemo(() => {
    if (formData.billingMethod.toLowerCase() === "tier") {
      return formData.tierSettings.some(
        (tier) =>
          tier.savingsFrom &&
          tier.savingsTo &&
          tier.savingsFrom >= tier.savingsTo
      );
    }
    return false;
  }, [formData.billingMethod, formData.tierSettings]);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Prevent submission if there are validation errors
      if (hasTierValidationErrors) {
        showErrorToast("Please fix validation errors before saving", {
          title: "Validation Error",
        });
        return;
      }

      try {
        // Transform form data to API payload
        const payload = transformBillingFormToPayload(formData, clientId);

        // Call mutation
        await saveBillingMutation.mutateAsync(payload);

        showSuccessToast("Billing information saved successfully");
        handleClose();
      } catch (error) {
        showErrorToast(error, { title: "Failed to save billing information" });
      }
    },
    [formData, clientId, saveBillingMutation, handleClose, hasTierValidationErrors]
  );

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={saveBillingMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleSubmit}
        loading={saveBillingMutation.isPending}
        loadingText="Saving..."
        disabled={saveBillingMutation.isPending || hasTierValidationErrors}
      >
        Save
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Client Billing"
      size="full"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8">
          {/* Left Panel - Main Form */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Billing Method */}
              <div>
                <Label htmlFor="billingMethod">
                  Billing Method <span className="text-red-500">*</span>
                </Label>
                <SearchableInput
                  value={formData.billingMethod}
                  onChange={(value) =>
                    handlers.handleInputChange("billingMethod", value)
                  }
                  options={queries.billingMethods.data || []}
                  placeholder="Select billing method"
                  isLoading={queries.billingMethods.isLoading}
                  onFocus={() => enableFetch("billingMethods")}
                />
              </div>

              {/* Contingency Percentage */}
              {formData.billingMethod.toLowerCase() !== "tier" && (
                <div>
                  <Label htmlFor="contingencyPercentage">Contingency %</Label>
                  <PercentageInput
                    value={formData.contingencyPercentage}
                    onChange={(value) =>
                      handlers.handleInputChange("contingencyPercentage", value)
                    }
                  />
                </div>
              )}
            </div>

            {/* Tier Settings */}
            {formData.billingMethod.toLowerCase() === "tier" && (
              <TierSettingsTable
                tierSettings={formData.tierSettings}
                onAddTier={handlers.handleAddTier}
                onRemoveTier={handlers.handleRemoveTier}
                onTierChange={handlers.handleTierChange}
              />
            )}

            {/* Additional Fees */}
            <AdditionalFeesTable
              additionalFees={formData.additionalFees}
              feeTypeOptions={queries.feeTypes.data || []}
              isLoadingFeeTypes={queries.feeTypes.isLoading}
              onAddFee={handlers.handleAddFee}
              onRemoveFee={handlers.handleRemoveFee}
              onFeeChange={handlers.handleFeeChange}
              onFocusFeeType={() => enableFetch("feeTypes")}
            />

            {/* Discount and Maximum Cap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="discountEnabled"
                    checked={formData.discountEnabled}
                    onCheckedChange={(checked) =>
                      handlers.handleInputChange("discountEnabled", !!checked)
                    }
                  />
                  <Label htmlFor="discountEnabled" className="cursor-pointer">
                    Discount
                  </Label>
                  {!formData.discountEnabled && (
                    <p className="text-sm text-muted-foreground">
                      (Not Applied)
                    </p>
                  )}
                </div>
                {formData.discountEnabled && (
                  <div className="flex gap-2">
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        handlers.handleInputChange("discountType", value)
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.discountType === "%" ? (
                      <PercentageInput
                        value={formData.discount}
                        onChange={(value) =>
                          handlers.handleInputChange("discount", value)
                        }
                        className="flex-1"
                      />
                    ) : (
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.discount}
                        onChange={(e) =>
                          handlers.handleInputChange("discount", e.target.value)
                        }
                        className="flex-1"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="maximumCapEnabled"
                    checked={formData.maximumCapEnabled}
                    onCheckedChange={(checked) =>
                      handlers.handleInputChange("maximumCapEnabled", !!checked)
                    }
                  />
                  <Label htmlFor="maximumCapEnabled" className="cursor-pointer">
                    Maximum Cap
                  </Label>
                  {!formData.maximumCapEnabled && (
                    <p className="text-sm text-muted-foreground">
                      (Not Applied)
                    </p>
                  )}
                </div>
                {formData.maximumCapEnabled && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.maximumCap}
                      onChange={(e) =>
                        handlers.handleInputChange("maximumCap", e.target.value)
                      }
                      className="pl-8"
                    />
                  </div>
                )}
              </div>
              
              {/* Minimum Billing */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="minimumBillingEnabled"
                    checked={formData.minimumBillingEnabled}
                    onCheckedChange={(checked) =>
                      handlers.handleInputChange(
                        "minimumBillingEnabled",
                        !!checked
                      )
                    }
                  />
                  <Label
                    htmlFor="minimumBillingEnabled"
                    className="cursor-pointer"
                  >
                    Minimum Billing
                  </Label>
                  {!formData.minimumBillingEnabled && (
                    <p className="text-sm text-muted-foreground">
                      (Not Applied)
                    </p>
                  )}
                </div>
                {formData.minimumBillingEnabled && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.minimumBilling}
                      onChange={(e) =>
                        handlers.handleInputChange(
                          "minimumBilling",
                          e.target.value
                        )
                      }
                      className="pl-8"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Billing Client Notes */}
            <div>
              <Label htmlFor="billingClientNotes">Billing Client Notes</Label>
              <textarea
                id="billingClientNotes"
                placeholder="Enter billing notes..."
                value={formData.billingClientNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handlers.handleInputChange(
                    "billingClientNotes",
                    e.target.value
                  )
                }
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>

            {/* Billing Manager */}
            <div>
              <Label htmlFor="billingManager">Billing Manager</Label>
              <SearchableInput
                value={formData.billingManager}
                onChange={(value) =>
                  handlers.handleInputChange("billingManager", value)
                }
                options={queries.accountManagers.data || []}
                placeholder="Select billing manager"
                isLoading={queries.accountManagers.isLoading}
                onFocus={() => enableFetch("accountManagers")}
              />
            </div>
          </div>

          {/* Right Panel - Appeal Savings Settings */}
          <div className="space-y-6 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-8">
            <h3 className="font-semibold text-lg">Appeal Savings Settings</h3>

            <div>
              <Label htmlFor="defaultTaxRateSource">
                Default Tax Rate Source
              </Label>
              <SearchableInput
                value={formData.defaultTaxRateSource}
                onChange={(value) =>
                  handlers.handleInputChange("defaultTaxRateSource", value)
                }
                options={(queries.taxRateSources.data || []).map((item) => ({
                  value: item,
                  label: item,
                }))}
                placeholder="Select tax rate source"
                isLoading={queries.taxRateSources.isLoading}
                onFocus={() => enableFetch("taxRateSources")}
              />
            </div>

            <div>
              <Label htmlFor="defaultTaxRateType">Default Tax Rate Type</Label>
              <SearchableInput
                value={formData.defaultTaxRateType}
                onChange={(value) =>
                  handlers.handleInputChange("defaultTaxRateType", value)
                }
                options={(queries.taxRateTypes.data || []).map((item) => ({
                  value: item,
                  label: item,
                }))}
                placeholder="Select tax rate type"
                isLoading={queries.taxRateTypes.isLoading}
                onFocus={() => enableFetch("taxRateTypes")}
              />
            </div>

            <div>
              <Label htmlFor="defaultAssessmentType">
                Default Assessment Type
              </Label>
              <SearchableInput
                value={formData.defaultAssessmentType}
                onChange={(value) =>
                  handlers.handleInputChange("defaultAssessmentType", value)
                }
                options={(queries.assessmentTypes.data || []).map((item) => ({
                  value: item,
                  label: item,
                }))}
                placeholder="Select assessment type"
                isLoading={queries.assessmentTypes.isLoading}
                onFocus={() => enableFetch("assessmentTypes")}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

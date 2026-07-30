import * as React from "react";
import { SearchableInput } from "@/components/commonComponents/SearchableInput";
import { FormField } from "./FormField";
import { ClientManagementSectionProps } from "../types";

export const ClientManagementSection = React.memo(({
  formData,
  errors,
  handleInputChange,
  clientManagerOptions,
  isLoadingClientManagers,
  onClientManagerFocus,
  salesManagerOptions,
  isLoadingSalesManagers,
  onSalesManagerFocus,
}: ClientManagementSectionProps) => (
  <div className="space-y-4">
    <h3 className="text-base text-gray-500 pb-2">Client Management</h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField label="Client Manager" name="clientManager" required error={errors.clientManager}>
        <SearchableInput
          value={formData.clientManager}
          onChange={(value) => handleInputChange("clientManager", value)}
          options={clientManagerOptions}
          placeholder="Select client manager"
          isLoading={isLoadingClientManagers}
          onFocus={onClientManagerFocus}
        />
      </FormField>

      <FormField label="Sales Manager" name="salesManager">
        <SearchableInput
          value={formData.salesManager}
          onChange={(value) => handleInputChange("salesManager", value)}
          options={salesManagerOptions}
          placeholder="Select sales manager"
          isLoading={isLoadingSalesManagers}
          onFocus={onSalesManagerFocus}
        />
      </FormField>
    </div>
  </div>
));

ClientManagementSection.displayName = "ClientManagementSection";

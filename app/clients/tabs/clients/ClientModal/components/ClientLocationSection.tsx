import * as React from "react";
import { SearchableInput } from "@/components/commonComponents/SearchableInput";
import { FormField } from "./FormField";
import { ClientLocationSectionProps } from "../types";

export const ClientLocationSection = React.memo(({
  formData,
  handleInputChange,
  stateOptions,
  isLoadingStates,
  onStateFocus,
  cityOptions,
  isLoadingCities,
  onCityFocus,
  countyOptions,
  isLoadingCounties,
  onCountyFocus,
  zipCodeOptions,
  isLoadingZipCodes,
  onZipCodeFocus,
}: Omit<ClientLocationSectionProps, 'errors'>) => (
  <div className="space-y-4">
    <h3 className="text-base text-gray-500 pb-2">Client Location</h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField label="State" name="state">
        <SearchableInput
          value={formData.state}
          onChange={(value) => handleInputChange("state", value)}
          options={stateOptions}
          placeholder="Select state"
          isLoading={isLoadingStates}
          onFocus={onStateFocus}
        />
      </FormField>

      <FormField label="City" name="city">
        <SearchableInput
          value={formData.city}
          onChange={(value) => handleInputChange("city", value)}
          options={cityOptions}
          placeholder="Select city"
          isLoading={isLoadingCities}
          onFocus={onCityFocus}
        />
      </FormField>

      <FormField label="County" name="county">
        <SearchableInput
          value={formData.county}
          onChange={(value) => handleInputChange("county", value)}
          options={countyOptions}
          placeholder="Select county"
          isLoading={isLoadingCounties}
          onFocus={onCountyFocus}
        />
      </FormField>

      <FormField label="Zip" name="zip">
        <SearchableInput
          value={formData.zip}
          onChange={(value) => handleInputChange("zip", value)}
          options={zipCodeOptions}
          placeholder="Select zip code"
          isLoading={isLoadingZipCodes}
          onFocus={onZipCodeFocus}
        />
      </FormField>

      <FormField label="Address" name="address">
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Enter address"
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </FormField>
    </div>
  </div>
));

ClientLocationSection.displayName = "ClientLocationSection";

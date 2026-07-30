import * as React from "react";
import { Input } from "@/components/ui/input";
import { SearchableInput } from "@/components/commonComponents/SearchableInput";
import { FormField } from "./FormField";
import { ClientInformationSectionProps } from "../types";
import { STATUS_OPTIONS } from "../constants";
import { HiOutlineXMark } from "react-icons/hi2";

export const ClientInformationSection = React.memo(({
  formData,
  errors,
  handleInputChange,
  handleContactChange,
  handleAddContact,
  handleRemoveContact,
  clientTypeOptions,
  isLoadingClientTypes,
  onClientTypeFocus,
  contactTypeOptions,
  isLoadingContactTypes,
  onContactTypeFocus,
}: ClientInformationSectionProps) => (
  <div className="space-y-4">
    <h3 className="text-base text-gray-500 pb-2">Client Information</h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField label="Client" name="client" required error={errors.client}>
        <Input
          id="client"
          value={formData.client}
          onChange={(e) => handleInputChange("client", e.target.value)}
          placeholder="Enter client name"
          aria-invalid={!!errors.client}
        />
      </FormField>

      <FormField label="Client Short Name" name="clientShortName">
        <Input
          id="clientShortName"
          value={formData.clientShortName}
          onChange={(e) => handleInputChange("clientShortName", e.target.value)}
          placeholder="Enter short name"
        />
      </FormField>

      <FormField label="Client Type" name="clientType">
        <SearchableInput
          value={formData.clientType}
          onChange={(value) => handleInputChange("clientType", value)}
          options={clientTypeOptions}
          placeholder="Select client type"
          isLoading={isLoadingClientTypes}
          onFocus={onClientTypeFocus}
        />
      </FormField>

      <FormField label="Status" name="status" required error={errors.status}>
        <SearchableInput
          value={formData.status}
          onChange={(value) => handleInputChange("status", value)}
          options={STATUS_OPTIONS}
          placeholder="Select status"
        />
      </FormField>

      <FormField label="Notes" name="notes" required error={errors.notes}>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Enter notes"
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          aria-invalid={!!errors.notes}
        />
      </FormField>
    </div>

    {/* Contact Information Rows */}
    <div className="space-y-3  p-4 rounded-md bg-sidebar-accent">
      {formData.contacts.map((contact, index) => (
        <div key={contact.id} className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* First row: only 3 fields (no Contact Type) */}
            {index === 0 ? (
              <>
                <FormField label="Contact Name" name={`contactName-${index}`}>
                  <Input
                    id={`contactName-${index}`}
                    value={contact.contactName}
                    onChange={(e) => handleContactChange(index, "contactName", e.target.value)}
                    placeholder="Enter contact name"
                    className="bg-white"
                  />
                </FormField>

                <FormField label="Contact Phone" name={`contactPhone-${index}`}>
                  <Input
                    id={`contactPhone-${index}`}
                    value={contact.contactPhone}
                    onChange={(e) => handleContactChange(index, "contactPhone", e.target.value)}
                    placeholder="Enter contact phone"
                    className="bg-white"
                  />
                </FormField>

                <FormField
                  label="Contact Email"
                  name={`contactEmail-${index}`}
                  error={errors[`contactEmail_${index}` as keyof typeof errors]}
                >
                  <Input
                    id={`contactEmail-${index}`}
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => handleContactChange(index, "contactEmail", e.target.value)}
                    placeholder="Enter contact email"
                    className="bg-white"
                    aria-invalid={!!errors[`contactEmail_${index}` as keyof typeof errors]}
                  />
                </FormField>
              </>
            ) : (
              <>
                {/* Additional rows: include Contact Type */}
                <FormField label="Contact Type" name={`contactType-${index}`} required>
                  <SearchableInput
                    value={contact.contactType}
                    onChange={(value) => handleContactChange(index, "contactType", value)}
                    options={contactTypeOptions}
                    placeholder="Select contact type"
                    isLoading={isLoadingContactTypes}
                    onFocus={onContactTypeFocus}
                    bgColor="bg-white"
                  />
                </FormField>

                <FormField label="Contact Name" name={`contactName-${index}`}>
                  <Input
                    id={`contactName-${index}`}
                    value={contact.contactName}
                    onChange={(e) => handleContactChange(index, "contactName", e.target.value)}
                    placeholder="Enter contact name"
                    className="bg-white"
                  />
                </FormField>

                <FormField label="Contact Phone" name={`contactPhone-${index}`}>
                  <Input
                    id={`contactPhone-${index}`}
                    value={contact.contactPhone}
                    onChange={(e) => handleContactChange(index, "contactPhone", e.target.value)}
                    placeholder="Enter contact phone"
                    className="bg-white"
                  />
                </FormField>

                <FormField
                  label="Contact Email"
                  name={`contactEmail-${index}`}
                  error={errors[`contactEmail_${index}` as keyof typeof errors]}
                >
                  <Input
                    id={`contactEmail-${index}`}
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => handleContactChange(index, "contactEmail", e.target.value)}
                    placeholder="Enter contact email"
                    className="bg-white"
                    aria-invalid={!!errors[`contactEmail_${index}` as keyof typeof errors]}
                  />
                </FormField>

                {/* Remove button - only show for contacts after the first one */}
                <button
                  type="button"
                  onClick={() => handleRemoveContact(index)}
                  className="absolute top-2 -right-2 p-1 rounded-full bg-destructive/70 text-destructive-foreground hover:bg-destructive/90 transition-colors z-10"
                  aria-label="Remove contact"
                >
                  <HiOutlineXMark className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Add New Contact Button - shown only after first row */}
          {index === 0 && (
            <div className="mt-2 ml-4">
              <button
                type="button"
                onClick={handleAddContact}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                + Add new
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
));

ClientInformationSection.displayName = "ClientInformationSection";

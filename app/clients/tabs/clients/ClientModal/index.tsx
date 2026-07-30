"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/commonComponents/Button";
import { Modal } from "@/components/commonComponents/Modal";
import { showErrorToast, showSuccessToast } from "@/lib/api";
import { ClientFormSkeleton } from "./ClientFormSkeleton";
import { useClientTypes, useContactTypes, useStates, useCities, useCounties, useZipCodes, useClientManagers, useSalesManagers } from "@/lib/api/clients/add/preload-apis";
import { useAddClient } from "@/lib/api/clients/add/add-client-api";
import { useUpdateClient, type UpdateClientPayload } from "@/lib/api/clients/update/update-client-api";
import { getClientById } from "@/lib/api/clients";
import { ClientInformationSection } from "./components/ClientInformationSection";
import { ClientLocationSection } from "./components/ClientLocationSection";
import { ClientManagementSection } from "./components/ClientManagementSection";
import { ClientModalProps, ClientFormData, Contact } from "./types";
import { INITIAL_FORM_STATE, REQUIRED_FIELDS } from "./constants";

export function ClientModal({ open, onOpenChange, clientId }: ClientModalProps) {
  // Determine mode based on clientId presence
  const isEditMode = Boolean(clientId);
  const [formData, setFormData] = React.useState<ClientFormData>(INITIAL_FORM_STATE);

  const [errors, setErrors] = React.useState<Partial<Record<keyof ClientFormData, string>>>({});

  // Fetch existing client data when in edit mode
  const {
    data: existingClientData,
    isLoading: isLoadingClientData,
    isFetching: isFetchingClientData
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId!),
    enabled: isEditMode && !!clientId && open,
    staleTime: 0, // Always fetch fresh data when editing
  });

  // API mutation hooks
  const addClientMutation = useAddClient();
  const updateClientMutation = useUpdateClient();

  const [shouldFetchClientTypes, setShouldFetchClientTypes] = React.useState(false);
  const { data: clientTypeOptions = [], isLoading: isLoadingClientTypes } = useClientTypes(shouldFetchClientTypes);

  const [shouldFetchStates, setShouldFetchStates] = React.useState(false);
  const { data: stateOptions = [], isLoading: isLoadingStates } = useStates(shouldFetchStates);

  const [shouldFetchCities, setShouldFetchCities] = React.useState(false);
  const { data: cityOptions = [], isLoading: isLoadingCities } = useCities(formData.state || null, shouldFetchCities);

  const [shouldFetchCounties, setShouldFetchCounties] = React.useState(false);
  const { data: countyOptions = [], isLoading: isLoadingCounties } = useCounties(formData.state || null, shouldFetchCounties);

  const [shouldFetchZipCodes, setShouldFetchZipCodes] = React.useState(false);
  const { data: zipCodeOptions = [], isLoading: isLoadingZipCodes } = useZipCodes(shouldFetchZipCodes);

  const [shouldFetchClientManagers, setShouldFetchClientManagers] = React.useState(false);
  const { data: clientManagerOptions = [], isLoading: isLoadingClientManagers } = useClientManagers(shouldFetchClientManagers);

  const [shouldFetchSalesManagers, setShouldFetchSalesManagers] = React.useState(false);
  const { data: salesManagerOptions = [], isLoading: isLoadingSalesManagers } = useSalesManagers(shouldFetchSalesManagers);

  const [shouldFetchContactTypes, setShouldFetchContactTypes] = React.useState(false);
  const { data: contactTypeOptions = [], isLoading: isLoadingContactTypes } = useContactTypes(shouldFetchContactTypes);

  // Populate form with existing data in edit mode
  React.useEffect(() => {
    if (isEditMode && existingClientData && open) {
      setFormData({
        client: existingClientData.clientName || "",
        clientShortName: existingClientData.clientShortName || "",
        clientType: existingClientData.clientType || "",
        status: existingClientData.clientStatus || "",
        notes: existingClientData.notes || "",
        state: existingClientData.state || "",
        city: existingClientData.city || "",
        county: existingClientData.county || "",
        zip: existingClientData.zip || "",
        address: existingClientData.address || "",
        clientManager: existingClientData.clientManager || "",
        salesManager: existingClientData.salesManager || "",
        contacts: existingClientData.clientContacts?.length > 0
          ? existingClientData.clientContacts.map(contact => ({
              id: contact.contactId,
              contactType: contact.contactType || "",
              contactName: contact.contactName || "",
              contactPhone: contact.contactPhone || "",
              contactEmail: contact.contactEmail || "",
            }))
          : INITIAL_FORM_STATE.contacts,
      });

      // Trigger dependent fetches if state is populated
      if (existingClientData.state) {
        setShouldFetchCities(true);
        setShouldFetchCounties(true);
      }

      // Trigger manager option fetches to display names instead of IDs
      if (existingClientData.clientManager) {
        setShouldFetchClientManagers(true);
      }
      if (existingClientData.salesManager) {
        setShouldFetchSalesManagers(true);
      }
    }
  }, [isEditMode, existingClientData, open]);

  const handleInputChange = React.useCallback((field: keyof ClientFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // When state changes, clear city and county, and trigger fetches
      if (field === "state") {
        newData.city = "";
        newData.county = "";
        setShouldFetchCities(true);
        setShouldFetchCounties(true);
      }

      return newData;
    });

    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleContactChange = React.useCallback((index: number, field: keyof Contact, value: string) => {
    setFormData((prev) => {
      const newContacts = [...prev.contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, contacts: newContacts };
    });

    // Clear email validation error when user types in email field
    if (field === "contactEmail") {
      setErrors((prev) => {
        const errorKey = `contactEmail_${index}` as keyof ClientFormData;
        if (prev[errorKey]) {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  const handleAddContact = React.useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          id: `contact-${Date.now()}-${Math.random()}`,
          contactType: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
        },
      ],
    }));
  }, []);

  const handleRemoveContact = React.useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  }, []);

  const handleClose = React.useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    // Reset all fetch triggers
    setShouldFetchClientTypes(false);
    setShouldFetchStates(false);
    setShouldFetchCities(false);
    setShouldFetchCounties(false);
    setShouldFetchZipCodes(false);
    setShouldFetchClientManagers(false);
    setShouldFetchSalesManagers(false);
    setShouldFetchContactTypes(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const validateForm = React.useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate required fields
    REQUIRED_FIELDS.forEach(({ field, message }) => {
      const value = formData[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field] = message;
      }
    });

    // Validate contact emails (optional but must be valid format if provided)
    formData.contacts.forEach((contact, index) => {
      if (contact.contactEmail && contact.contactEmail.trim()) {
        if (!emailRegex.test(contact.contactEmail.trim())) {
          // Store error with a dynamic key for contact email
          newErrors[`contactEmail_${index}` as keyof ClientFormData] = "Invalid email format";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorToast("Please fix the errors in the form", {
        title: "Validation Error",
      });
      return;
    }

    try {
      // Filter out contacts where all fields are empty
      const validContacts = formData.contacts.filter((contact) => {
        return contact.contactName || contact.contactPhone || contact.contactEmail;
      });

      // Transform formData to match API payload structure
      const basePayload = {
        clientName: formData.client,
        clientShortName: formData.clientShortName || "",
        clientType: formData.clientType || "",
        clientStatus: formData.status,
        state: formData.state || "",
        city: formData.city || "",
        county: formData.county || "",
        address: formData.address || "",
        zip: formData.zip || "",
        clientManager: formData.clientManager,
        salesManager: formData.salesManager || "",
        notes: formData.notes,
        contacts: validContacts.map((contact, index) => {
          // Check if this is an existing contact (has GUID format contactId)
          const isExistingContact = contact.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contact.id);

          if (isExistingContact && existingClientData) {
            // For existing contacts, find the original data and include all fields
            const originalContact = existingClientData.clientContacts?.find(c => c.contactId === contact.id);
            if (originalContact) {
              return {
                contactId: originalContact.contactId,
                contactType: contact.contactType || originalContact.contactType,
                contactName: contact.contactName || "",
                contactPhone: contact.contactPhone || "",
                contactEmail: contact.contactEmail || "",
                createdBy: originalContact.createdBy,
                createdOn: originalContact.createdOn,
                clientId: originalContact.clientId,
              };
            }
          }

          // For new contacts, only include basic fields
          return {
            contactType: index === 0 && !contact.contactType ? "Primary" : contact.contactType,
            contactName: contact.contactName || "",
            contactPhone: contact.contactPhone || "",
            contactEmail: contact.contactEmail || "",
          };
        }),
      };

      if (isEditMode && clientId) {
        // Update existing client
        const updatePayload: UpdateClientPayload = {
          ...basePayload,
          clientId,
        };

        await updateClientMutation.mutateAsync(updatePayload);
        showSuccessToast(`Client "${formData.client}" updated successfully`);
      } else {
        // Create new client
        const response = await addClientMutation.mutateAsync(basePayload);
        showSuccessToast(`Client "${formData.client}" added successfully with ID: ${response.content}`);
      }

      // Reset form and close modal
      handleClose();
    } catch (error) {
      showErrorToast(error, {
        title: isEditMode ? "Failed to update client" : "Failed to add client",
      });
    }
  }, [formData, validateForm, handleClose, isEditMode, clientId, addClientMutation, updateClientMutation, existingClientData]);

  const footer = React.useMemo(
    () => (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={addClientMutation.isPending || updateClientMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          loading={addClientMutation.isPending || updateClientMutation.isPending}
        >
          {isEditMode ? "Update" : "Create"}
        </Button>
      </>
    ),
    [handleClose, handleSubmit, isEditMode, addClientMutation.isPending, updateClientMutation.isPending]
  );

  // Modal title based on mode
  const modalTitle = isEditMode
    ? "Edit Client"
    : "Add Client";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={modalTitle}
      size="full"
      footer={footer}
      skeleton={<ClientFormSkeleton />}
      showSkeleton={isLoadingClientData || isFetchingClientData}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {!isLoadingClientData && !isFetchingClientData && (
          <>
            <ClientInformationSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleContactChange={handleContactChange}
              handleAddContact={handleAddContact}
              handleRemoveContact={handleRemoveContact}
              clientTypeOptions={clientTypeOptions}
              isLoadingClientTypes={isLoadingClientTypes}
              onClientTypeFocus={() => setShouldFetchClientTypes(true)}
              contactTypeOptions={contactTypeOptions}
              isLoadingContactTypes={isLoadingContactTypes}
              onContactTypeFocus={() => setShouldFetchContactTypes(true)}
            />

            <ClientLocationSection
              formData={formData}
              handleInputChange={handleInputChange}
              stateOptions={stateOptions}
              isLoadingStates={isLoadingStates}
              onStateFocus={() => setShouldFetchStates(true)}
              cityOptions={cityOptions}
              isLoadingCities={isLoadingCities}
              onCityFocus={() => setShouldFetchCities(true)}
              countyOptions={countyOptions}
              isLoadingCounties={isLoadingCounties}
              onCountyFocus={() => setShouldFetchCounties(true)}
              zipCodeOptions={zipCodeOptions}
              isLoadingZipCodes={isLoadingZipCodes}
              onZipCodeFocus={() => setShouldFetchZipCodes(true)}
            />

            <ClientManagementSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              clientManagerOptions={clientManagerOptions}
              isLoadingClientManagers={isLoadingClientManagers}
              onClientManagerFocus={() => setShouldFetchClientManagers(true)}
              salesManagerOptions={salesManagerOptions}
              isLoadingSalesManagers={isLoadingSalesManagers}
              onSalesManagerFocus={() => setShouldFetchSalesManagers(true)}
            />
          </>
        )}
      </form>
    </Modal>
  );
}

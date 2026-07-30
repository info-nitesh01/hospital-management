export interface Contact {
  id: string;
  contactType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface ClientFormData {
  // Client Information
  client: string;
  clientShortName: string;
  clientType: string;
  status: string;
  notes: string;

  // Contact Information
  contacts: Contact[];

  // Client Location
  state: string;
  city: string;
  county: string;
  zip: string;
  address: string;

  // Client Management
  clientManager: string;
  salesManager: string;
}

export interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string; // Optional - when provided, modal is in edit mode
}

export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export interface ClientInformationSectionProps {
  formData: ClientFormData;
  errors: Partial<Record<keyof ClientFormData, string>>;
  handleInputChange: (field: keyof ClientFormData, value: string) => void;
  handleContactChange: (index: number, field: keyof Contact, value: string) => void;
  handleAddContact: () => void;
  handleRemoveContact: (index: number) => void;
  clientTypeOptions: Array<{ value: string; label: string }>;
  isLoadingClientTypes: boolean;
  onClientTypeFocus: () => void;
  contactTypeOptions: Array<{ value: string; label: string }>;
  isLoadingContactTypes: boolean;
  onContactTypeFocus: () => void;
}

export interface ClientLocationSectionProps {
  formData: ClientFormData;
  errors: Partial<Record<keyof ClientFormData, string>>;
  handleInputChange: (field: keyof ClientFormData, value: string) => void;
  stateOptions: Array<{ value: string; label: string }>;
  isLoadingStates: boolean;
  onStateFocus: () => void;
  cityOptions: Array<{ value: string; label: string }>;
  isLoadingCities: boolean;
  onCityFocus: () => void;
  countyOptions: Array<{ value: string; label: string }>;
  isLoadingCounties: boolean;
  onCountyFocus: () => void;
  zipCodeOptions: Array<{ value: string; label: string }>;
  isLoadingZipCodes: boolean;
  onZipCodeFocus: () => void;
}

export interface ClientManagementSectionProps {
  formData: ClientFormData;
  errors: Partial<Record<keyof ClientFormData, string>>;
  handleInputChange: (field: keyof ClientFormData, value: string) => void;
  clientManagerOptions: Array<{ value: string; label: string }>;
  isLoadingClientManagers: boolean;
  onClientManagerFocus: () => void;
  salesManagerOptions: Array<{ value: string; label: string }>;
  isLoadingSalesManagers: boolean;
  onSalesManagerFocus: () => void;
}

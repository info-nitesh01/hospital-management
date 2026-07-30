import { ClientFormData } from "./types";

// Helper to create options where label matches value
export const createOptions = (values: string[]) =>
  values.map(value => ({ value, label: value }));

// Static options for dropdowns
export const STATUS_OPTIONS = createOptions(["Active", "Inactive"]);

// Initial form state
export const INITIAL_FORM_STATE: ClientFormData = {
  client: "",
  clientShortName: "",
  clientType: "",
  status: "",
  notes: "",
  contacts: [
    {
      id: "contact-initial",
      contactType: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    },
  ],
  state: "",
  city: "",
  county: "",
  zip: "",
  address: "",
  clientManager: "",
  salesManager: "",
};

// Validation rules
export const REQUIRED_FIELDS: Array<{ field: keyof ClientFormData; message: string }> = [
  { field: "client", message: "Client name is required" },
  { field: "status", message: "Status is required" },
  { field: "notes", message: "Notes are required" },
  { field: "clientManager", message: "Client Manager is required" },
];

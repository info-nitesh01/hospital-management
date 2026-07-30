import * as React from "react";
import { FormFieldProps } from "../types";

export const FormField = React.memo(({
  label,
  name,
  required = false,
  error,
  children
}: FormFieldProps) => (
  <div className="grid gap-2">
    <label htmlFor={name} className="text-sm font-medium">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
));

FormField.displayName = "FormField";

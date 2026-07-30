"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccessToast } from "@/lib/api";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId?: string; // Optional for edit mode
}

export function AddAccountModal({
  open,
  onOpenChange,
  accountId,
}: AddAccountModalProps) {
  const [formData, setFormData] = React.useState({
    accountNumber: "",
    accountName: "",
    accountType: "",
    status: "Active",
    balance: "",
    contactEmail: "",
    contactPhone: "",
    accountManager: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditMode = !!accountId;

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        accountNumber: "",
        accountName: "",
        accountType: "",
        status: "Active",
        balance: "",
        contactEmail: "",
        contactPhone: "",
        accountManager: "",
      });
    }
  }, [open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccessToast(
      isEditMode ? "Account Updated" : "Account Created",
      isEditMode
        ? "The account has been updated successfully."
        : "The account has been created successfully."
    );

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Account" : "Add New Account"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the account information below."
              : "Fill in the details to create a new account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="e.g., 1001"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    handleChange("accountNumber", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">
                  Account Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountName"
                  placeholder="e.g., Main Operating Account"
                  value={formData.accountName}
                  onChange={(e) => handleChange("accountName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">
                  Account Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => handleChange("accountType", value)}
                  required
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operating">Operating</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Reserve">Reserve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">
                  Balance <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 125000.50"
                  value={formData.balance}
                  onChange={(e) => handleChange("balance", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountManager">
                  Account Manager <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountManager"
                  placeholder="e.g., John Smith"
                  value={formData.accountManager}
                  onChange={(e) =>
                    handleChange("accountManager", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="e.g., contact@example.com"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    handleChange("contactEmail", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="e.g., (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    handleChange("contactPhone", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Account"
                : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

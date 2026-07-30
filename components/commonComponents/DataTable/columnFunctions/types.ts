// Base type constraint for table data
export type TableData = Record<string, unknown>;

// Type for status variants
export type StatusType = "active" | "inactive" | "pending" | "completed" | "cancelled" | "in-progress" | "draft" | "published";

// Status color mapping
export const statusVariants: Record<StatusType, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  completed: "default",
  published: "default",
  pending: "secondary",
  "in-progress": "secondary",
  draft: "secondary",
  inactive: "outline",
  cancelled: "destructive",
};

// Type for column configuration options
export interface ColumnOptions {
  currency?: string;
  emailAccessor?: string;
  trueLabel?: string;
  falseLabel?: string;
  suffix?: string;
  external?: boolean;
  showIcon?: boolean;
  className?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
}
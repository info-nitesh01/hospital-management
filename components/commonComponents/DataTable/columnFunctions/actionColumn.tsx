import { ColumnDef } from "@tanstack/react-table";
import { HiOutlinePencil, HiOutlineEye } from "react-icons/hi2";
import React from "react";
import { createActionColumn } from "../index";
import { TableData } from "./types";

/**
 * Standard action columns
 */
export const standardActionColumn = <T extends TableData>(
  onView?: (data: T) => void,
  onEdit?: (data: T) => void,
  additionalActions?: Array<{
    label: string;
    onClick: (data: T) => void;
    icon?: React.ReactNode;
  }>,
  headerLabel?: string,
): ColumnDef<T> => {
  const actions = [];

  if (onView) {
    actions.push({
      label: "View Details",
      onClick: onView,
      icon: <HiOutlineEye className="h-4 w-4" />,
    });
  }

  if (onEdit) {
    actions.push({
      label: "Edit",
      onClick: onEdit,
      icon: <HiOutlinePencil className="h-4 w-4" />,
    });
  }

  if (additionalActions) {
    actions.push(...additionalActions);
  }

  return createActionColumn<T>(actions, headerLabel);
};
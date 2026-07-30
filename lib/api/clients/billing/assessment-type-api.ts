import { createSimpleQuery } from "./shared";

interface AssessmentTypeItem {
  assessment: string;
}

export const useAssessmentTypes = createSimpleQuery<AssessmentTypeItem, "assessment">(
  "/ColumnFilter/GetDefaultAssessment",
  ["clients", "billing", "assessmentTypes"],
  "assessment"
);

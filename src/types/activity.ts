import type { DivisionId, EmployeeId, TeamId } from "@/types/organization";

export type ActivityType =
  | "Discussion"
  | "Content"
  | "Knowledge"
  | "Project Update"
  | "Media"
  | "Notice";

export type CompanyActivity = {
  id: string;
  type: ActivityType;
  title: string;
  summary: string;
  href: string;
  employeeId?: EmployeeId;
  divisionId?: DivisionId;
  teamId?: TeamId;
  status: "Published" | "Preview" | "Draft";
  publishedAt: string;
  sourceLabel: string;
};

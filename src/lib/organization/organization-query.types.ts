import type {
  Company,
  Division,
  Employee,
  EmployeeShowcase,
  Team,
} from "@/types/organization";

export type EmployeeReferenceView = Pick<
  Employee,
  "id" | "slug" | "nameKo" | "nameEn" | "jobTitleKo" | "jobTitleEn"
>;

export type EmployeeSummaryView = EmployeeReferenceView &
  Pick<
    Employee,
    | "divisionId"
    | "teamId"
    | "departmentId"
    | "summaryKo"
    | "summaryEn"
    | "specialtiesKo"
    | "specialtiesEn"
    | "status"
    | "brandColor"
    | "profileImage"
  >;

export type DivisionSummaryView = {
  division: Division;
  teamCount: number;
  teams: Team[];
  employeeCount: number;
  employees: EmployeeReferenceView[];
};

export type DivisionDetailView = {
  division: Division;
  teams: Team[];
  employees: EmployeeSummaryView[];
};

export type CompanyOverviewView = {
  company: Company;
  divisions: DivisionSummaryView[];
  employeeCount: number;
};

export type EmployeeDetailView = {
  employee: Employee;
  division: Division;
  team: Team;
  showcaseAvailable: boolean;
};

export type EmployeeShowcaseView = {
  employee: EmployeeDetailView;
  showcase: EmployeeShowcase;
};

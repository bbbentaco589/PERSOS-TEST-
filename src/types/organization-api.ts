import type {
  CompanyOverviewView,
  DivisionDetailView,
  DivisionSummaryView,
  EmployeeDetailView,
  EmployeeShowcaseView,
  EmployeeSummaryView,
} from "@/lib/organization";

export type GetCompanyOverviewResponse = {
  data: CompanyOverviewView;
};

export type GetDivisionsResponse = {
  data: DivisionSummaryView[];
};

export type GetDivisionResponse = {
  data: DivisionDetailView;
};

export type GetEmployeesResponse = {
  data: EmployeeSummaryView[];
};

export type GetEmployeeResponse = {
  data: EmployeeDetailView;
};

export type GetEmployeeShowcaseResponse = {
  data: EmployeeShowcaseView;
};

export type OrganizationApiErrorResponse = {
  error: {
    code: "NOT_FOUND" | "ORGANIZATION_QUERY_FAILED";
    message: string;
  };
};

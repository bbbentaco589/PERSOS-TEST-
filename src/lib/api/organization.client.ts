import type {
  GetCompanyOverviewResponse,
  GetDivisionResponse,
  GetDivisionsResponse,
  GetEmployeeResponse,
  GetEmployeeShowcaseResponse,
  GetEmployeesResponse,
  OrganizationApiErrorResponse,
} from "@/types/organization-api";

async function requestOrganizationJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(path, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const payload = (await response.json()) as
    | TResponse
    | OrganizationApiErrorResponse;

  if (!response.ok) {
    const errorPayload = payload as OrganizationApiErrorResponse;
    throw new Error(errorPayload.error?.message ?? "Organization request failed.");
  }

  return payload as TResponse;
}

export function fetchCompanyOverview() {
  return requestOrganizationJson<GetCompanyOverviewResponse>(
    "/api/organization/company"
  );
}

export function fetchDivisions() {
  return requestOrganizationJson<GetDivisionsResponse>(
    "/api/organization/divisions"
  );
}

export function fetchDivisionById(divisionId: string) {
  return requestOrganizationJson<GetDivisionResponse>(
    `/api/organization/divisions/${encodeURIComponent(divisionId)}`
  );
}

export function fetchEmployees() {
  return requestOrganizationJson<GetEmployeesResponse>(
    "/api/organization/employees"
  );
}

export function fetchEmployeeById(employeeId: string) {
  return requestOrganizationJson<GetEmployeeResponse>(
    `/api/organization/employees/${encodeURIComponent(employeeId)}`
  );
}

export function fetchEmployeeShowcase(employeeId: string) {
  return requestOrganizationJson<GetEmployeeShowcaseResponse>(
    `/api/organization/employees/${encodeURIComponent(employeeId)}/showcase`
  );
}

import {
  getRepositories,
  type OrganizationRepository,
} from "@/lib/repositories";
import type { Employee } from "@/types/organization";
import type {
  CompanyOverviewView,
  DivisionDetailView,
  DivisionSummaryView,
  EmployeeDetailView,
  EmployeeShowcaseView,
  EmployeeSummaryView,
} from "./organization-query.types";

function resolveRepository(repository?: OrganizationRepository) {
  return repository ?? getRepositories().organization;
}

function toEmployeeSummary(employee: Employee): EmployeeSummaryView {
  return {
    id: employee.id,
    slug: employee.slug,
    nameKo: employee.nameKo,
    nameEn: employee.nameEn,
    jobTitleKo: employee.jobTitleKo,
    jobTitleEn: employee.jobTitleEn,
    divisionId: employee.divisionId,
    teamId: employee.teamId,
    departmentId: employee.departmentId,
    summaryKo: employee.summaryKo,
    summaryEn: employee.summaryEn,
    specialtiesKo: employee.specialtiesKo,
    specialtiesEn: employee.specialtiesEn,
    status: employee.status,
    brandColor: employee.brandColor,
    profileImage: employee.profileImage,
  };
}

async function toDivisionSummary(
  divisionId: string,
  repository: OrganizationRepository
): Promise<DivisionSummaryView | undefined> {
  const division = await repository.getDivisionById(divisionId);

  if (!division) {
    return undefined;
  }

  const [employees, teams] = await Promise.all([
    repository.getEmployeesByDivisionId(division.id),
    repository.getTeamsByDivisionId(division.id),
  ]);

  return {
    division,
    teamCount: teams.length,
    teams,
    employeeCount: employees.length,
    employees: employees.map(({ id, slug, nameKo, nameEn, jobTitleKo, jobTitleEn }) => ({
      id,
      slug,
      nameKo,
      nameEn,
      jobTitleKo,
      jobTitleEn,
    })),
  };
}

async function toEmployeeDetail(
  employee: Employee,
  repository: OrganizationRepository
): Promise<EmployeeDetailView | undefined> {
  const [division, team] = await Promise.all([
    repository.getDivisionById(employee.divisionId),
    repository.getTeamById(employee.teamId),
  ]);

  if (!division || !team) {
    return undefined;
  }

  return {
    employee,
    division,
    team,
    showcaseAvailable: Boolean(await repository.getEmployeeShowcaseByEmployeeId(employee.id)),
  };
}

export async function getCompanyOverview(
  repository?: OrganizationRepository
): Promise<CompanyOverviewView | undefined> {
  const resolvedRepository = resolveRepository(repository);
  const company = (await resolvedRepository.listCompanies())[0];

  if (!company) {
    return undefined;
  }

  const companyDivisions = await resolvedRepository.getDivisionsByCompanyId(company.id);
  const divisionResults = await Promise.all(
    companyDivisions.map((division) => toDivisionSummary(division.id, resolvedRepository))
  );
  const divisions = divisionResults.filter(
    (division): division is DivisionSummaryView => Boolean(division)
  );

  return {
    company,
    divisions,
    employeeCount: divisions.reduce(
      (total, division) => total + division.employeeCount,
      0
    ),
  };
}

export async function getAllDivisions(
  repository?: OrganizationRepository
): Promise<DivisionSummaryView[]> {
  const resolvedRepository = resolveRepository(repository);
  const divisions = await resolvedRepository.listDivisions();
  const results = await Promise.all(
    divisions.map((division) => toDivisionSummary(division.id, resolvedRepository))
  );

  return results.filter((division): division is DivisionSummaryView => Boolean(division));
}

export async function getDivisionById(
  divisionId: string,
  repository?: OrganizationRepository
) {
  const resolvedRepository = resolveRepository(repository);
  return toDivisionSummary(divisionId, resolvedRepository);
}

export async function getDivisionWithEmployees(
  divisionId: string,
  repository?: OrganizationRepository
): Promise<DivisionDetailView | undefined> {
  const resolvedRepository = resolveRepository(repository);
  const division = await resolvedRepository.getDivisionById(divisionId);

  if (!division) {
    return undefined;
  }

  return {
    division,
    teams: await resolvedRepository.getTeamsByDivisionId(division.id),
    employees: (await resolvedRepository.getEmployeesByDivisionId(division.id)).map(toEmployeeSummary),
  };
}

export async function getAllEmployees(
  repository?: OrganizationRepository
): Promise<EmployeeSummaryView[]> {
  return (await resolveRepository(repository).listEmployees()).map(toEmployeeSummary);
}

export async function getEmployeeById(
  employeeId: string,
  repository?: OrganizationRepository
) {
  const resolvedRepository = resolveRepository(repository);
  const employee = await resolvedRepository.getEmployeeById(employeeId);

  return employee ? await toEmployeeDetail(employee, resolvedRepository) : undefined;
}

export async function getEmployeeBySlug(
  slug: string,
  repository?: OrganizationRepository
) {
  const resolvedRepository = resolveRepository(repository);
  const employee = await resolvedRepository.getEmployeeBySlug(slug);

  return employee ? await toEmployeeDetail(employee, resolvedRepository) : undefined;
}

export async function getEmployeeShowcase(
  employeeId: string,
  repository?: OrganizationRepository
): Promise<EmployeeShowcaseView | undefined> {
  const resolvedRepository = resolveRepository(repository);
  const [employee, showcase] = await Promise.all([
    resolvedRepository.getEmployeeById(employeeId),
    resolvedRepository.getEmployeeShowcaseByEmployeeId(employeeId),
  ]);

  if (!employee || !showcase) {
    return undefined;
  }

  const employeeDetail = await toEmployeeDetail(employee, resolvedRepository);

  return employeeDetail ? { employee: employeeDetail, showcase } : undefined;
}

export async function getEmployeeShowcaseBySlug(
  slug: string,
  repository?: OrganizationRepository
) {
  const resolvedRepository = resolveRepository(repository);
  const employee = await resolvedRepository.getEmployeeBySlug(slug);

  return employee
    ? await getEmployeeShowcase(employee.id, resolvedRepository)
    : undefined;
}

import { getRepositories } from "./repository-factory";

export function getAllCompanies() {
  return getRepositories().organization.listCompanies();
}

export function getCompanyById(companyId: string) {
  return getRepositories().organization.getCompanyById(companyId);
}

export function getAllDivisions() {
  return getRepositories().organization.listDivisions();
}

export function getDivisionById(divisionId: string) {
  return getRepositories().organization.getDivisionById(divisionId);
}

export function getDivisionBySlug(slug: string) {
  return getRepositories().organization.getDivisionBySlug(slug);
}

export function getDivisionsByCompanyId(companyId: string) {
  return getRepositories().organization.getDivisionsByCompanyId(companyId);
}

export function getAllTeams() {
  return getRepositories().organization.listTeams();
}

export function getTeamById(teamId: string) {
  return getRepositories().organization.getTeamById(teamId);
}

export function getTeamBySlug(slug: string) {
  return getRepositories().organization.getTeamBySlug(slug);
}

export function getTeamsByDivisionId(divisionId: string) {
  return getRepositories().organization.getTeamsByDivisionId(divisionId);
}

export function getAllEmployees() {
  return getRepositories().organization.listEmployees();
}

export function getEmployeeById(employeeId: string) {
  return getRepositories().organization.getEmployeeById(employeeId);
}

export function getEmployeeBySlug(slug: string) {
  return getRepositories().organization.getEmployeeBySlug(slug);
}

export function getEmployeesByDivisionId(divisionId: string) {
  return getRepositories().organization.getEmployeesByDivisionId(divisionId);
}

export function getEmployeesByTeamId(teamId: string) {
  return getRepositories().organization.getEmployeesByTeamId(teamId);
}

export function getAllEmployeeShowcases() {
  return getRepositories().organization.listEmployeeShowcases();
}

export function getEmployeeShowcaseByEmployeeId(employeeId: string) {
  return getRepositories().organization.getEmployeeShowcaseByEmployeeId(employeeId);
}

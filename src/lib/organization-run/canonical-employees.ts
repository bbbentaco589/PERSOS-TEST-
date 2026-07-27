import {
  EMPLOYEE_REACTION_IDS,
  type EmployeeReactionCanonical,
} from "@/lib/ai/employee-reaction-prompt-builder";
import { getRepositories } from "@/lib/repositories";

export const ORGANIZATION_RUN_EMPLOYEE_IDS = EMPLOYEE_REACTION_IDS;

export async function getOrganizationRunCanonicalEmployees(
  employeeIds: readonly string[] = ORGANIZATION_RUN_EMPLOYEE_IDS
): Promise<EmployeeReactionCanonical[]> {
  const repositories = getRepositories();
  const [employees, divisions, teams] = await Promise.all([
    Promise.all(
      employeeIds.map((employeeId) =>
        repositories.characters.getCharacterById(employeeId)
      )
    ),
    repositories.organization.listDivisions(),
    repositories.organization.listTeams(),
  ]);

  return employeeIds.map((employeeId, index) => {
    const employee = employees[index];
    if (!employee) {
      throw new Error(`${employeeId} Character Canonical을 찾지 못했습니다.`);
    }

    return {
      employee,
      divisionName:
        divisions.find((division) => division.id === employee.divisionId)
          ?.nameKo ?? employee.divisionId,
      teamName:
        teams.find((team) => team.id === employee.teamId)?.nameKo ??
        employee.teamId,
    };
  });
}

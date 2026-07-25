import { getEmployeeById } from "@/lib/organization";
import type { GetEmployeeResponse } from "@/types/organization-api";
import {
  organizationJsonResponse,
  organizationNotFound,
  organizationQueryFailed,
} from "../../_lib/response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await context.params;
    const employee = await getEmployeeById(employeeId);

    return employee
      ? organizationJsonResponse<GetEmployeeResponse>({ data: employee })
      : organizationNotFound("Employee", employeeId);
  } catch (caughtError) {
    return organizationQueryFailed(caughtError);
  }
}

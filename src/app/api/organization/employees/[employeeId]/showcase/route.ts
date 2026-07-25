import { getEmployeeShowcase } from "@/lib/organization";
import type { GetEmployeeShowcaseResponse } from "@/types/organization-api";
import {
  organizationJsonResponse,
  organizationNotFound,
  organizationQueryFailed,
} from "../../../_lib/response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await context.params;
    const showcase = await getEmployeeShowcase(employeeId);

    return showcase
      ? organizationJsonResponse<GetEmployeeShowcaseResponse>({ data: showcase })
      : organizationNotFound("Employee showcase", employeeId);
  } catch (caughtError) {
    return organizationQueryFailed(caughtError);
  }
}

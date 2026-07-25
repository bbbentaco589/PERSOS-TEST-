import { getDivisionWithEmployees } from "@/lib/organization";
import type { GetDivisionResponse } from "@/types/organization-api";
import {
  organizationJsonResponse,
  organizationNotFound,
  organizationQueryFailed,
} from "../../_lib/response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ divisionId: string }> }
) {
  try {
    const { divisionId } = await context.params;
    const division = await getDivisionWithEmployees(divisionId);

    return division
      ? organizationJsonResponse<GetDivisionResponse>({ data: division })
      : organizationNotFound("Division", divisionId);
  } catch (caughtError) {
    return organizationQueryFailed(caughtError);
  }
}

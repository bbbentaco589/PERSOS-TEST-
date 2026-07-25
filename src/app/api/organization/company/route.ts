import { getCompanyOverview } from "@/lib/organization";
import type { GetCompanyOverviewResponse } from "@/types/organization-api";
import {
  organizationJsonResponse,
  organizationNotFound,
  organizationQueryFailed,
} from "../_lib/response";

export async function GET() {
  try {
    const company = await getCompanyOverview();

    return company
      ? organizationJsonResponse<GetCompanyOverviewResponse>({ data: company })
      : organizationNotFound("Company", "default");
  } catch (caughtError) {
    return organizationQueryFailed(caughtError);
  }
}

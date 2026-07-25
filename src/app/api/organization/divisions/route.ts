import { getAllDivisions } from "@/lib/organization";
import type { GetDivisionsResponse } from "@/types/organization-api";
import {
  organizationJsonResponse,
  organizationQueryFailed,
} from "../_lib/response";

export async function GET() {
  try {
    return organizationJsonResponse<GetDivisionsResponse>({
      data: await getAllDivisions(),
    });
  } catch (caughtError) {
    return organizationQueryFailed(caughtError);
  }
}

import { getAllEmployees } from "@/lib/organization";
import type { GetEmployeesResponse } from "@/types/organization-api";
import {
  organizationJsonResponse,
  organizationQueryFailed,
} from "../_lib/response";

export async function GET() {
  try {
    return organizationJsonResponse<GetEmployeesResponse>({
      data: await getAllEmployees(),
    });
  } catch (caughtError) {
    return organizationQueryFailed(caughtError);
  }
}

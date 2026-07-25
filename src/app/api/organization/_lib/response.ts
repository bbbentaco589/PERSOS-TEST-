import { NextResponse } from "next/server";

import type { OrganizationApiErrorResponse } from "@/types/organization-api";

export function organizationJsonResponse<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

export function organizationNotFound(resource: string, identifier: string) {
  return organizationJsonResponse<OrganizationApiErrorResponse>(
    {
      error: {
        code: "NOT_FOUND",
        message: `${resource} not found: ${identifier}`,
      },
    },
    { status: 404 }
  );
}

export function organizationQueryFailed(caughtError: unknown) {
  return organizationJsonResponse<OrganizationApiErrorResponse>(
    {
      error: {
        code: "ORGANIZATION_QUERY_FAILED",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Organization query failed.",
      },
    },
    { status: 500 }
  );
}

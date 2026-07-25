import { NextRequest, NextResponse } from "next/server";

import { getRepositories } from "@/lib/repositories";
import type {
  ApiErrorResponse,
  UpdateReviewStatusRequest,
  UpdateReviewStatusResponse,
} from "@/types/api";

function jsonResponse<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

function errorResponse(code: string, message: string, status: number) {
  return jsonResponse<ApiErrorResponse>({ error: { code, message } }, { status });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ discussionId: string }> }
) {
  try {
    const { discussionId } = await context.params;
    const body = (await request.json()) as UpdateReviewStatusRequest;

    if (!body.contentDraft || !body.status) {
      return errorResponse(
        "VALIDATION_ERROR",
        "콘텐츠 초안과 변경할 검토 상태가 필요합니다.",
        400
      );
    }

    if (body.contentDraft.discussionId !== discussionId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "콘텐츠 초안의 Discussion ID가 요청 경로와 일치해야 합니다.",
        400
      );
    }

    const storedFlow = await getRepositories().discussionPersistence.updateReviewStatus({
      discussionId,
      contentDraft: body.contentDraft,
      status: body.status,
    });

    if (!storedFlow) {
      return errorResponse(
        "STATIC_DISCUSSION_READ_ONLY",
        "생성된 토론만 검토 상태를 변경할 수 있습니다.",
        409
      );
    }

    return jsonResponse<UpdateReviewStatusResponse>({
      contentDraft: storedFlow.contentDraft ?? body.contentDraft,
    });
  } catch (caughtError) {
    return errorResponse(
      "UPDATE_REVIEW_FAILED",
      caughtError instanceof Error ? caughtError.message : "검토 상태를 변경하지 못했습니다.",
      400
    );
  }
}

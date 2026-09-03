import { NextRequest, NextResponse } from "next/server";

import { DiscussionStatus } from "@/constants/discussion";
import { getAIProvider, isAIProviderError, AIErrorCode } from "@/lib/ai";
import { hasAuthorizedAdminMutation } from "@/lib/admin-auth/session";
import {
  createAIDiscussionEngineFlow,
  generateAIConsensusForDiscussion,
  generateAIContentDraftForDiscussion,
  generateAICrossRebuttalsForDiscussion,
  generateAIResponsesForDiscussion,
} from "@/lib/discussion-engine";
import { getRepositories } from "@/lib/repositories";
import type {
  ApiErrorResponse,
  GenerateDiscussionFlowRequest,
  GenerateDiscussionFlowResponse,
} from "@/types/api";

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  if (!hasAuthorizedAdminMutation(request)) {
    return errorResponse("FORBIDDEN", "허용되지 않은 요청입니다.", 403);
  }
  try {
    const body = (await request.json()) as GenerateDiscussionFlowRequest;
    const repositories = getRepositories();
    const aiProvider = await getAIProvider();

    if (body.step === "full") {
      if (!body.topicId) {
        return errorResponse("VALIDATION_ERROR", "전체 토론 생성에는 topicId가 필요합니다.", 400);
      }

      const flow = await createAIDiscussionEngineFlow(body.topicId, {
        participantIds: body.participantIds,
        mode: body.mode,
      }, repositories, aiProvider);
      const storedFlow = await repositories.discussionPersistence.saveDiscussionFlow(flow, {
        assignNewId: true,
      });

      return jsonResponse<GenerateDiscussionFlowResponse>(storedFlow);
    }

    if (!body.discussion) {
      return errorResponse("VALIDATION_ERROR", "단계별 생성에는 discussion이 필요합니다.", 400);
    }

    const sources = await repositories.sources.getSourcesByIds(body.discussion.sourceIds);
    let discussion = body.discussion;
    let responses = body.responses ?? [];
    let rebuttals = body.rebuttals ?? [];
    let consensus = body.consensus ?? null;
    let contentDraft = null;

    if (body.step === "responses") {
      responses = await generateAIResponsesForDiscussion(discussion, repositories, aiProvider);
      discussion = {
        ...discussion,
        status: DiscussionStatus.AIGenerated,
        responseIds: responses.map((response) => response.id),
      };
    }

    if (body.step === "rebuttals") {
      rebuttals = await generateAICrossRebuttalsForDiscussion(
        discussion,
        responses,
        repositories,
        aiProvider
      );
      discussion = {
        ...discussion,
        crossRebuttalIds: rebuttals.map((rebuttal) => rebuttal.id),
      };
    }

    if (body.step === "consensus") {
      consensus = await generateAIConsensusForDiscussion(
        discussion,
        responses,
        rebuttals,
        repositories,
        aiProvider
      );
      discussion = {
        ...discussion,
        status: DiscussionStatus.PendingReview,
        consensusId: consensus.id,
      };
    }

    if (body.step === "content-draft") {
      if (!consensus) {
        return errorResponse("VALIDATION_ERROR", "콘텐츠 초안 생성에는 consensus가 필요합니다.", 400);
      }

      contentDraft = await generateAIContentDraftForDiscussion(
        discussion,
        responses,
        rebuttals,
        consensus,
        repositories,
        aiProvider
      );
    }

    const storedFlow = await repositories.discussionPersistence.saveDiscussionFlow({
      topicId: discussion.topicId,
      discussion,
      sources,
      responses,
      rebuttals,
      consensus,
      contentDraft,
    });

    return jsonResponse<GenerateDiscussionFlowResponse>(storedFlow);
  } catch (caughtError) {
    if (isAIProviderError(caughtError)) {
      return errorResponse(caughtError.code, caughtError.message, caughtError.httpStatus);
    }
    return errorResponse(
      AIErrorCode.DiscussionGenerationFailed,
      caughtError instanceof Error ? caughtError.message : "AI 토론 생성에 실패했습니다.",
      500
    );
  }
}

import { NextResponse } from "next/server";

import { getRepositories } from "@/lib/repositories";
import type { ApiErrorResponse, GetDiscussionResponse } from "@/types/api";

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ discussionId: string }> }
) {
  const { discussionId } = await context.params;
  const repositories = getRepositories();
  const storedFlow =
    await repositories.discussionPersistence.getGeneratedDiscussionFlowById(discussionId);

  if (storedFlow) {
    return jsonResponse<GetDiscussionResponse>(storedFlow);
  }

  const discussion = await repositories.discussions.getDiscussionById(discussionId);

  if (!discussion) {
    return errorResponse("NOT_FOUND", `Discussion not found: ${discussionId}`, 404);
  }

  const [sources, responses, rebuttals, consensus, contentDrafts] = await Promise.all([
    repositories.sources.getSourcesByIds(discussion.sourceIds),
    repositories.aiResponses.getResponsesByDiscussionId(discussion.id),
    repositories.crossRebuttals.getCrossRebuttalsByDiscussionId(discussion.id),
    repositories.consensus.getConsensusByDiscussionId(discussion.id),
    repositories.contentDrafts.getContentDraftsByDiscussionId(discussion.id),
  ]);

  return jsonResponse<GetDiscussionResponse>({
    topicId: discussion.topicId,
    discussion,
    sources,
    responses,
    rebuttals,
    consensus: consensus ?? null,
    contentDraft: contentDrafts[0] ?? null,
  });
}

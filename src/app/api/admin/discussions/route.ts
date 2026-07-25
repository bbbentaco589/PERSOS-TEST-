import { NextRequest, NextResponse } from "next/server";

import { DiscussionStatus } from "@/constants/discussion";
import {
  attachSourcesToDiscussion,
  createDiscussionFromTopic,
} from "@/lib/discussion-engine";
import { getRepositories } from "@/lib/repositories";
import type {
  ApiErrorResponse,
  CreateDiscussionRequest,
  CreateDiscussionResponse,
  GetDiscussionsResponse,
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

export async function GET() {
  const repositories = getRepositories();
  const [staticDiscussions, generatedDiscussions, generatedFlows] = await Promise.all([
    repositories.discussions.listDiscussions(),
    repositories.discussionPersistence.listGeneratedDiscussions(),
    repositories.discussionPersistence.listGeneratedDiscussionFlows(),
  ]);

  return jsonResponse<GetDiscussionsResponse>({
    discussions: [...staticDiscussions, ...generatedDiscussions],
    generatedDiscussionIds: generatedFlows.map((flow) => flow.discussion.id),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateDiscussionRequest;

    if (!body.topicId) {
      return errorResponse("VALIDATION_ERROR", "topicId is required.", 400);
    }

    const repositories = getRepositories();
    const draft = await createDiscussionFromTopic(body.topicId, {
      participantIds: body.participantIds,
      mode: body.mode,
    }, repositories);
    const discussion = {
      ...await attachSourcesToDiscussion(draft, repositories),
      status: DiscussionStatus.SourceAttached,
    };

    const storedFlow = await repositories.discussionPersistence.saveDiscussionFlow(
      {
        topicId: body.topicId,
        discussion,
        sources: await repositories.sources.getSourcesByIds(discussion.sourceIds),
        responses: [],
        rebuttals: [],
        consensus: null,
        contentDraft: null,
      },
      { assignNewId: true }
    );

    return jsonResponse<CreateDiscussionResponse>({
      topicId: body.topicId,
      discussion: storedFlow.discussion,
      sources: storedFlow.sources,
      responses: [],
      rebuttals: [],
      consensus: null,
      contentDraft: null,
    });
  } catch (caughtError) {
    return errorResponse(
      "CREATE_DISCUSSION_FAILED",
      caughtError instanceof Error ? caughtError.message : "Failed to create discussion.",
      500
    );
  }
}

export async function DELETE() {
  await getRepositories().discussionPersistence.clearGeneratedDiscussions();

  return jsonResponse({
    ok: true,
    message: "Generated in-memory discussion flows cleared.",
  });
}

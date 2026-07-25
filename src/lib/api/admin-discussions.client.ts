import type { HumanReviewStatus } from "@/constants/discussion";
import type { ContentDraft } from "@/types";
import type {
  ApiErrorResponse,
  CreateDiscussionRequest,
  CreateDiscussionResponse,
  GenerateDiscussionFlowRequest,
  GenerateDiscussionFlowResponse,
  GetDiscussionResponse,
  GetDiscussionsResponse,
  UpdateReviewStatusResponse,
} from "@/types/api";

async function requestJson<TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json()) as TResponse | ApiErrorResponse;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse;
    throw new Error(errorPayload.error?.message ?? "관리자 토론 요청에 실패했습니다.");
  }

  return payload as TResponse;
}

export function fetchDiscussions() {
  return requestJson<GetDiscussionsResponse>("/api/admin/discussions", {
    method: "GET",
  });
}

export function fetchDiscussionById(discussionId: string) {
  return requestJson<GetDiscussionResponse>(`/api/admin/discussions/${discussionId}`, {
    method: "GET",
  });
}

export function createDiscussion(request: CreateDiscussionRequest) {
  return requestJson<CreateDiscussionResponse>("/api/admin/discussions", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function generateDiscussionFlow(request: GenerateDiscussionFlowRequest) {
  return requestJson<GenerateDiscussionFlowResponse>("/api/admin/discussions/generate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateDiscussionReviewStatus({
  discussionId,
  contentDraft,
  status,
}: {
  discussionId: string;
  contentDraft: ContentDraft;
  status: HumanReviewStatus;
}) {
  return requestJson<UpdateReviewStatusResponse>(
    `/api/admin/discussions/${discussionId}/review`,
    {
      method: "PATCH",
      body: JSON.stringify({ contentDraft, status }),
    }
  );
}

export function clearGeneratedDiscussions() {
  return requestJson<{ ok: true; message: string }>("/api/admin/discussions", {
    method: "DELETE",
  });
}

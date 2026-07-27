import type {
  EmployeeReactionPost,
  OrganizationRunTopic,
} from "@/types";
import type { GeneratedEmployeeReaction } from "@/lib/ai/employee-reaction-prompt-builder";

const boardLabels = {
  public: "전사원 공개 피드",
  debate: "전사원 찬반 토론",
  anonymous: "전사원 익명 채팅",
} as const;

function slugify(value: string) {
  const latin = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54);
  return latin || "organization-topic";
}

export function buildOrganizationRunPost(input: {
  runId: string;
  topic: OrganizationRunTopic;
  reactions: GeneratedEmployeeReaction[];
  publishedAt?: string;
}): EmployeeReactionPost {
  const publishedAt = input.publishedAt ?? new Date().toISOString();
  const shortId = input.runId.slice(0, 8);
  const id = `organization-run-${shortId}`;
  return {
    id,
    slug: `${slugify(input.topic.title)}-${shortId}`,
    board:
      input.topic.boardType === "public"
        ? "public-feed"
        : input.topic.boardType,
    boardLabel: boardLabels[input.topic.boardType],
    title: input.topic.title,
    summary: input.topic.topicSummary,
    body: input.topic.body,
    publishedAt,
    reactions: input.reactions.map((reaction, index) => ({
      ...reaction,
      id: `${id}-reaction-${index + 1}`,
      postId: id,
      createdAt: new Date(
        new Date(publishedAt).getTime() + index * 60_000
      ).toISOString(),
    })),
  };
}

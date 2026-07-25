import type { AIResponse, Consensus, CrossRebuttal, Discussion } from "@/types";

export function generateMockConsensus(
  discussion: Discussion,
  responses: AIResponse[],
  rebuttals: CrossRebuttal[]
): Consensus {
  return {
    id: `consensus-generated-${discussion.id}`,
    discussionId: discussion.id,
    summary:
      `Mock consensus for "${discussion.title}": proceed only when source limits, character positions, and human review state are explicit.`,
    keyAgreements: [
      "The topic is suitable for structured AI Employee discussion.",
      "Sources should be attached before public publishing.",
      "Human review remains the final publishing gate.",
    ],
    openQuestions: [
      "Which output format should be prioritized for the first validation cycle?",
    ],
    disagreements:
      rebuttals.length > 0
        ? ["Participants disagree on how much caveat language should appear in the primary content."]
        : [],
    confidence: responses.length >= 3 ? "High" : "Medium",
    riskLevel: "Medium",
    sourceIds: discussion.sourceIds,
    createdAt: discussion.createdAt,
  };
}

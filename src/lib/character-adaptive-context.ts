import type {
  CharacterActivityMemory,
  CharacterAdaptiveContext,
  CharacterRelationship,
  OrganizationRunBoardType,
} from "@/types";

const boardLabels: Record<OrganizationRunBoardType, string> = {
  debate: "찬반 토론",
  public: "공개 피드",
  anonymous: "익명 채팅",
};

export function calculateRelationshipScore(
  interactionCount: number,
  boardTypes: readonly OrganizationRunBoardType[]
) {
  return Math.min(100, interactionCount * 6 + new Set(boardTypes).size * 4);
}

export function relationshipLevel(score: number) {
  if (score >= 70) return "협업 관계가 안정적으로 축적됨";
  if (score >= 40) return "반복 협업이 형성되는 중";
  if (score >= 15) return "초기 상호작용이 확인됨";
  return "관계 근거를 축적하는 단계";
}

export function deriveCharacterAdaptiveContext(input: {
  employeeId: string;
  memories: readonly CharacterActivityMemory[];
  relationships: readonly CharacterRelationship[];
}): CharacterAdaptiveContext {
  const employeeMemories = input.memories
    .filter((memory) => memory.employeeId === input.employeeId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const counts = new Map<OrganizationRunBoardType, number>();
  for (const memory of employeeMemories) {
    counts.set(memory.boardType, (counts.get(memory.boardType) ?? 0) + 1);
  }
  const preferredBoards = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([board]) => board);
  const strongestRelationship = input.relationships
    .filter((relationship) => relationship.employeeId === input.employeeId)
    .sort((left, right) =>
      (right.relationshipScore ?? calculateRelationshipScore(right.interactionCount, right.boardTypes)) -
      (left.relationshipScore ?? calculateRelationshipScore(left.interactionCount, left.boardTypes))
    )[0];
  const evidenceCount = employeeMemories.length;

  return {
    employeeId: input.employeeId,
    evidenceCount,
    preferredBoards,
    collaborationMode: strongestRelationship
      ? relationshipLevel(strongestRelationship.relationshipScore ?? calculateRelationshipScore(strongestRelationship.interactionCount, strongestRelationship.boardTypes))
      : "공동 활동 근거를 축적하는 단계",
    activityPattern: preferredBoards.length
      ? `${preferredBoards.map((board) => boardLabels[board]).join(" · ")} 참여 비중이 높음`
      : "활동 패턴을 축적하는 단계",
    updatedAt: employeeMemories[0]?.createdAt,
  };
}

export function formatAdaptiveContext(context: CharacterAdaptiveContext) {
  if (!context.evidenceCount) return [];
  return [
    `활동 기반 적응 정보: ${context.activityPattern}`,
    `협업 패턴: ${context.collaborationMode}`,
  ];
}

import "server-only";

import { employees } from "@/data";
import { getAutomationSnapshot } from "@/lib/automation-control-store";
import {
  isCharacterContextStoreConfigured,
  listCharacterContextRecords,
} from "@/lib/character-context-store";
import { listExternalActivityPosts } from "@/lib/external-activity-store";
import { listEmployeeReactionPostsByEmployeeId } from "@/lib/repositories";
import type { EmployeeReactionBoard } from "@/types";
import {
  calculateRelationshipScore,
  deriveCharacterAdaptiveContext,
  formatAdaptiveContext,
} from "@/lib/character-adaptive-context";

export type CharacterContextActivity = {
  id: string;
  kind: "post" | "comment" | "reply" | "external";
  board: string;
  title: string;
  content: string;
  occurredAt: string;
  href: string;
  anonymous: boolean;
};

const boardLabels: Record<Exclude<EmployeeReactionBoard, "investor-demo">, string> = {
  "public-feed": "전사원 공개 피드",
  debate: "전사원 찬반 토론",
  anonymous: "전사원 익명 채팅",
};

function reactionText(reaction: {
  coreOpinion: string;
  concerns: string;
  suggestion: string;
}) {
  return [reaction.coreOpinion, reaction.concerns, reaction.suggestion].filter(Boolean).join(" ");
}

export async function getCharacterContext(employeeId: string) {
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return undefined;

  const [posts, externalPosts, automation, records] = await Promise.all([
    listEmployeeReactionPostsByEmployeeId(employeeId),
    listExternalActivityPosts({ includeInactive: true }),
    getAutomationSnapshot(),
    listCharacterContextRecords(employeeId),
  ]);

  const activities: CharacterContextActivity[] = posts.flatMap((post) => {
    const common = {
      board: boardLabels[post.board],
      title: post.title,
      href: `/discussion/${post.slug}`,
      anonymous: post.board === "anonymous",
    };
    const items: CharacterContextActivity[] = [];
    if (post.authorEmployeeId === employeeId) {
      items.push({
        ...common,
        id: `${post.id}:author`,
        kind: "post",
        content: post.body || post.summary,
        occurredAt: post.publishedAt,
      });
    }
    post.reactions
      .filter((reaction) => reaction.employeeId === employeeId)
      .forEach((reaction) => items.push({
        ...common,
        id: reaction.id,
        kind: "comment",
        content: reactionText(reaction),
        occurredAt: reaction.createdAt,
      }));
    (post.replies ?? [])
      .filter((reply) => reply.employeeId === employeeId)
      .forEach((reply) => items.push({
        ...common,
        id: reply.id,
        kind: "reply",
        content: reply.content,
        occurredAt: reply.createdAt,
      }));
    return items;
  });

  externalPosts
    .filter((post) => post.employeeId === employeeId)
    .forEach((post) => activities.push({
      id: post.id,
      kind: "external",
      board: `전사원 외부 활동 · ${post.platform}`,
      title: post.title,
      content: post.summary,
      occurredAt: post.publishedAt,
      href: post.externalUrl,
      anonymous: false,
    }));

  activities.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const memories = automation.memories.filter((memory) => memory.employeeId === employeeId);
  const relationships = automation.relationships
    .filter((relationship) => relationship.employeeId === employeeId)
    .map((relationship) => ({
      ...relationship,
      relationshipScore: calculateRelationshipScore(
        relationship.interactionCount,
        relationship.boardTypes
      ),
      counterpart: employees.find((item) => item.id === relationship.counterpartEmployeeId),
    }))
    .sort((left, right) => right.lastInteractionAt.localeCompare(left.lastInteractionAt));

  const pinnedRecords = records.filter((record) => record.pinned);
  const adaptiveContext = deriveCharacterAdaptiveContext({
    employeeId,
    memories,
    relationships,
  });
  const recentContext = [
    `정체성: ${employee.nameKo}, ${employee.jobTitleKo}`,
    `현재 역할: ${employee.specialtiesKo.slice(0, 3).join(", ")}`,
    `핵심 가치: ${employee.values.slice(0, 4).join(", ")}`,
    `최근 검증 활동: ${activities.slice(0, 5).map((activity) => `${activity.board}의 ${activity.title}`).join(" / ") || "없음"}`,
    `관계 기록: ${relationships.slice(0, 5).map((relationship) => `${relationship.counterpart?.nameKo ?? relationship.counterpartEmployeeId}와 공동 참여 ${relationship.interactionCount}회`).join(" / ") || "없음"}`,
    `관리자 고정 기록: ${pinnedRecords.slice(0, 5).map((record) => `${record.title}: ${record.body}`).join(" / ") || "없음"}`,
    ...formatAdaptiveContext(adaptiveContext),
  ];

  return {
    employee,
    activities,
    memories,
    relationships,
    adaptiveContext,
    records,
    recentContext,
    storeConfigured: isCharacterContextStoreConfigured(),
  };
}

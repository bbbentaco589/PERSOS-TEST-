import { characters, sources, topics } from "@/data";
import { updateHumanReviewStatus } from "@/lib/discussion-engine/review-workflow";
import { prepareDiscussionFlowForStorage } from "@/lib/repositories/discussion-flow-storage";
import type { ContentDraft } from "@/types";
import type { DiscussionEngineFlowPayload, StoredDiscussionFlow } from "@/types/api";

type DiscussionStoreState = {
  sequence: number;
  store: Map<string, StoredDiscussionFlow>;
};

const globalStore = globalThis as typeof globalThis & {
  __pssBetaDiscussionStore?: DiscussionStoreState;
};

const state =
  globalStore.__pssBetaDiscussionStore ??
  (globalStore.__pssBetaDiscussionStore = {
    sequence: 0,
    store: new Map<string, StoredDiscussionFlow>(),
  });

function now() {
  return new Date().toISOString();
}

export function listStoredDiscussions() {
  return Array.from(state.store.values()).map((flow) => flow.discussion);
}

export function listStoredDiscussionFlows() {
  return Array.from(state.store.values());
}

export function getStoredDiscussionById(discussionId: string) {
  return state.store.get(discussionId);
}

export function saveDiscussionFlow(
  flow: DiscussionEngineFlowPayload,
  options?: { assignNewId?: boolean }
) {
  state.sequence += 1;
  const rewrittenFlow = prepareDiscussionFlowForStorage(
    flow,
    options?.assignNewId
  );
  const discussionId = rewrittenFlow.discussion.id;
  const existing = state.store.get(discussionId);
  const timestamp = now();
  const topic = topics.find((item) => item.id === rewrittenFlow.topicId);

  if (!topic) {
    throw new Error(`Cannot store discussion flow. Topic not found: ${rewrittenFlow.topicId}`);
  }

  const knownSourceIds = new Set(sources.map((source) => source.id));
  const unknownSourceId = rewrittenFlow.sources.find(
    (source) => !knownSourceIds.has(source.id)
  )?.id;
  if (unknownSourceId) {
    throw new Error(`Cannot store discussion flow. Source not found: ${unknownSourceId}`);
  }

  const knownCharacterIds = new Set(characters.map((character) => character.id));
  const unknownCharacterId = rewrittenFlow.discussion.participants.find(
    (participant) => !knownCharacterIds.has(participant.characterId)
  )?.characterId;
  if (unknownCharacterId) {
    throw new Error(`Cannot store discussion flow. Character not found: ${unknownCharacterId}`);
  }

  const storedFlow: StoredDiscussionFlow = {
    ...rewrittenFlow,
    topic,
    characters: characters.filter((character) => {
      return rewrittenFlow.discussion.participants.some(
        (participant) => participant.characterId === character.id
      );
    }),
    isGenerated: true,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  state.store.set(discussionId, storedFlow);

  return storedFlow;
}

export function updateStoredDiscussionReviewStatus({
  discussionId,
  contentDraft,
}: {
  discussionId: string;
  contentDraft: ContentDraft;
}) {
  const storedFlow = state.store.get(discussionId);

  if (!storedFlow) {
    return null;
  }

  const updatedFlow: StoredDiscussionFlow = {
    ...storedFlow,
    contentDraft,
    updatedAt: now(),
  };

  state.store.set(discussionId, updatedFlow);

  return updatedFlow;
}

export function updateStoredDiscussionContentDraftStatus({
  discussionId,
  contentDraft,
  status,
}: {
  discussionId: string;
  contentDraft: ContentDraft;
  status: ContentDraft["status"];
}) {
  const timestamp = now();
  const updatedDraft = {
    ...updateHumanReviewStatus(contentDraft, status),
    updatedAt: timestamp,
  };
  const storedFlow = state.store.get(discussionId);

  if (!storedFlow) {
    return null;
  }

  const updatedFlow: StoredDiscussionFlow = {
    ...storedFlow,
    discussion: {
      ...storedFlow.discussion,
      status,
      publishedAt:
        status === "Published"
          ? storedFlow.discussion.publishedAt ?? timestamp
          : storedFlow.discussion.publishedAt,
    },
    contentDraft: updatedDraft,
    updatedAt: timestamp,
  };

  state.store.set(discussionId, updatedFlow);
  return updatedFlow;
}

export function clearStoredDiscussions() {
  state.store.clear();
  state.sequence = 0;
}

export function deleteStoredDiscussion(discussionId: string) {
  return state.store.delete(discussionId);
}

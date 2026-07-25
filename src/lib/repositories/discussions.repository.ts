import { getRepositories } from "./repository-factory";

export function getDiscussions() {
  return getRepositories().discussions.listDiscussions();
}

export function getDiscussionById(discussionId: string) {
  return getRepositories().discussions.getDiscussionById(discussionId);
}

export function getDiscussionBySlug(slug: string) {
  return getRepositories().discussions.getDiscussionBySlug(slug);
}

export function getDiscussionsByTopicId(topicId: string) {
  return getRepositories().discussions.getDiscussionsByTopicId(topicId);
}

export function getResponsesByDiscussionId(discussionId: string) {
  return getRepositories().aiResponses.getResponsesByDiscussionId(discussionId);
}

export function getCrossRebuttalsByDiscussionId(discussionId: string) {
  return getRepositories().crossRebuttals.getCrossRebuttalsByDiscussionId(discussionId);
}

export function getConsensusByDiscussionId(discussionId: string) {
  return getRepositories().consensus.getConsensusByDiscussionId(discussionId);
}

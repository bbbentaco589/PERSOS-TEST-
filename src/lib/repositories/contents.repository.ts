import { getRepositories } from "./repository-factory";

export function getContentDrafts() {
  return getRepositories().contentDrafts.listContentDrafts();
}

export function getContentDraftById(contentDraftId: string) {
  return getRepositories().contentDrafts.getContentDraftById(contentDraftId);
}

export function getContentDraftsByDiscussionId(discussionId: string) {
  return getRepositories().contentDrafts.getContentDraftsByDiscussionId(discussionId);
}

export function getPublishedContent() {
  return getRepositories().contentDrafts.listPublishedContent();
}

export function getPublishedContentBySlug(slug: string) {
  return getRepositories().contentDrafts.getPublishedContentBySlug(slug);
}

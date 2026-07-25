import { getRepositories } from "./repository-factory";

export function getTopics() {
  return getRepositories().topics.listTopics();
}

export function getTopicById(topicId: string) {
  return getRepositories().topics.getTopicById(topicId);
}

export function getTopicBySlug(slug: string) {
  return getRepositories().topics.getTopicBySlug(slug);
}

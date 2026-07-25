import { getRepositories } from "./repository-factory";

export function getSources() {
  return getRepositories().sources.listSources();
}

export function getSourceById(sourceId: string) {
  return getRepositories().sources.getSourceById(sourceId);
}

export function getSourcesByTopicId(topicId: string) {
  return getRepositories().sources.getSourcesByTopicId(topicId);
}

export function getSourcesByIds(sourceIds: string[]) {
  return getRepositories().sources.getSourcesByIds(sourceIds);
}
